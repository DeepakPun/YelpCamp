import Campground from "../models/campground.js"
import { cloudinary } from "../cloudinary/index.js"
import * as maptilerClient from "@maptiler/client"

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY
maptilerClient.config.fetch = fetch

async function findCoordinates() {
  const geoData = await maptilerClient.geocoding.forward("Los Angeles")
  console.log("Coordinates: ", geoData.features[0].geometry.coordinates)
}

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

  console.log("GeoData:", geoData.features[0])

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
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))
  campground.author = req.user._id
  await campground.save()
  console.log(campground)
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

  const hasNewImages = req.files && req.files.length > 0
  const deleteCount = req.body.deleteImages?.length || 0

  if (deleteCount === campground.images.length && !hasNewImages) {
    req.flash("error", "You cannot delete all images, must have at least one")
    return res.redirect(`/campgrounds/${campground._id}/edit`)
  }

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    })
  }

  const newImages = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))
  campground.images.push(...newImages)

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
