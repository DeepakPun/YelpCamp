import Campground from "../models/campground.js"
import Review from "../models/review.js"

const createReview = async (req, res) => {
  const { campgroundId } = req.params
  const MAX_REVIEWS = 20

  const campground = await Campground.findById(campgroundId).populate("reviews")
  if (!campground) throw new ExpressError("Campground not found", 404)

  if (campground.reviews.length >= MAX_REVIEWS) {
    const oldestReview = campground.reviews.sort(
      (a, b) => a.createdAt - b.createdAt,
    )[0]
    campground.reviews = campground.reviews.filter(
      (r) => r._id.toString() !== oldestReview._id.toString(),
    )
    await Review.findByIdAndDelete(oldestReview._id)
  }

  const review = new Review(req.body.review)
  review.author = req.user._id
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash("success", "Successfully made a new review!")
  res.redirect(`/campgrounds/${campground._id}`)
}

const deleteReview = async (req, res) => {
  const { campgroundId, reviewId } = req.params
  await Campground.findByIdAndUpdate(campgroundId, {
    $pull: { reviews: reviewId },
  })
  await Review.findByIdAndDelete(reviewId)
  req.flash("error", "Successfully deleted review!")
  res.redirect(`/campgrounds/${campgroundId}`)
}

export { createReview, deleteReview }
