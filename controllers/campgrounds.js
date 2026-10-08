import Campground from "../models/campground.js"

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
  campground.author = req.user._id
  await campground.save()
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
