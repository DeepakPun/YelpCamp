import Campground from "../models/campground.js"
import { cloudinary, uploadToCloudinary } from "../cloudinary/index.js"
import * as maptilerClient from "@maptiler/client"
import Review from "../models/review.js"

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY
maptilerClient.config.fetch = fetch

// async function findCoordinates() {
//   const geoData = await maptilerClient.geocoding.forward("Los Angeles")
//   console.log("Coordinates: ", geoData.features[0].geometry.coordinates)
// }

const getAllCampgrounds = async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}

const renderNewCampForm = async (req, res) => {
  res.render("campgrounds/new")
}

const viewSingleCamp = async (req, res) => {
  const { campgroundId } = req.params
  const campground = await Campground.findById(campgroundId)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author")
  if (!campground) {
    req.flash("error", "Campground not found")
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/show", { campground })
}

const createCampground = async (req, res) => {
  const query = req.body.campground.location?.trim()

  if (!query || query.length < 3) {
    req.flash("error", "Please enter a real location")
    return res.redirect("/campgrounds/new")
  }

  const geoData = await maptilerClient.geocoding.forward(query, {
    limit: 1,
    autocomplete: false,
  })

  if (!geoData.features?.length) {
    req.flash("error", "Could not geocode that location. Please try again.")
    return res.redirect("/campgrounds/new")
  }

  const feature = geoData.features[0]

  if (feature.relevance !== undefined && feature.relevance < 0.6) {
    req.flash(
      "error",
      `Could not find "${req.query}". Try a city address like "Yosemite National Park"`,
    )
    return res.redirect("/campgrounds/new")
  }

  const campground = new Campground(req.body.campground)
  campground.geometry = feature.geometry
  campground.location = feature.place_name

  if (req.files?.length) {
    const uploaded = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer)),
    )
    campground.images = uploaded.map((f) => ({
      url: f.secure_url,
      filename: f.public_id,
    }))
  } else {
    campground.images = []
  }

  campground.author = req.user._id
  await campground.save()

  const MAX_CAMPGROUNDS = 5
  const count = await Campground.countDocuments()
  if (count > MAX_CAMPGROUNDS) {
    const overflow = count - MAX_CAMPGROUNDS
    const oldest = await Campground.find()
      .sort({ createdAt: 1 })
      .limit(overflow)

    for (let camp of oldest) {
      for (let img of camp.images) {
        if (img.filename) {
          await cloudinary.uploader.destroy(img.filename)
        }
      }

      await Review.deleteMany({ _id: { $in: camp.reviews } })
      await Campground.findByIdAndDelete(camp._id)
    }
  }

  req.flash("success", "Successfully made a new campground!")
  res.redirect(`/campgrounds/${campground._id}`)
}

const renderEditForm = async (req, res) => {
  const { campgroundId } = req.params
  const campground = await Campground.findById(campgroundId)
  if (!campground) {
    req.flash("error", "Campground not found")
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit", { campground })
}

const updateCampground = async (req, res) => {
  const { campgroundId } = req.params

  const query = req.body.campground.location?.trim()

  const campground = await Campground.findById(campgroundId)

  if (!campground) {
    req.flash("error", "Campground not found")
    return res.redirect("/campgrounds")
  }

  if (query && query !== campground.location) {
    const geoData = await maptilerClient.geocoding.forward(query, {
      limit: 1,
      autocomplete: false,
    })

    if (!geoData.features?.length || geoData.features[0].relevance < 0.6) {
      req.flash(
        "error",
        `Could not find "${query}" - it might be Asda, Djibouti again`,
      )
      return res.redirect(`/campgrounds/${campgroundId}/edit`)
    }

    campground.geometry = geoData.features[0].geometry
    campground.location = geoData.features[0].place_name
  }

  campground.set({
    ...req.body.campground,
    location: campground.location,
    geometry: campground.geometry,
  })

  const deleteImages = req.body.deleteImages
    ? [].concat(req.body.deleteImages)
    : []

  const hasNewImages = req.files && req.files.length > 0
  const deleteCount = deleteImages.length

  if (deleteCount === campground.images.length && !hasNewImages) {
    req.flash("error", "You cannot delete all images, must have at least one")
    return res.redirect(`/campgrounds/${campground._id}/edit`)
  }

  if (deleteCount > 0) {
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: deleteImages } } },
    })
  }

  if (hasNewImages) {
    const uploaded = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer)),
    )
    const newImages = uploaded.map((f) => ({
      url: f.secure_url,
      filename: f.public_id,
    }))
    campground.images.push(...newImages)
  }

  await campground.save()

  req.flash("success", "Successfully updated the campground!")
  res.redirect(`/campgrounds/${campground._id}`)
}

const deleteCampground = async (req, res) => {
  const { campgroundId } = req.params
  const campground = await Campground.findById(campgroundId)
  if (!campground) {
    req.flash("error", "Campground not found")
    return res.redirect("/campgrounds")
  }
  await Campground.findByIdAndDelete(campgroundId)
  req.flash("success", "Successfully deleted campground!")
  res.redirect("/campgrounds")
}

export {
  getAllCampgrounds,
  renderNewCampForm,
  viewSingleCamp,
  createCampground,
  renderEditForm,
  updateCampground,
  deleteCampground,
}
