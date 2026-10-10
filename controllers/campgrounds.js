import Campground from "../models/campground.js"
import { cloudinary } from "../cloudinary/index.js"

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
  const campground = new Campground(req.body.campground)
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
  const campground = await Campground.findById(campgroundId)
  if (!campground) {
    req.flash("error", "Campground not found")
    return res.redirect("/campgrounds")
  }

  await Campground.findByIdAndUpdate(
    campgroundId,
    { ...req.body.campground },
    { returnDocument: "after" },
  )

  const newImages = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))

  campground.images.push(...newImages)

  if (
    req.body.deleteImages &&
    req.body.deleteImages.length === campground.images.length &&
    !req.files.length
  ) {
    req.flash(
      "error",
      "You cannot delete all images, campground must have at least one image",
    )
    return res.redirect(`/campgrounds/${campground._id}/edit`)
  }

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({
      $pull: {
        images: {
          filename: {
            $in: req.body.deleteImages,
          },
        },
      },
    })
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
