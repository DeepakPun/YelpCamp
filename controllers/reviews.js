import Campground from "../models/campground.js"
import Review from "../models/review.js"

const createReview = async (req, res) => {
  const { campgroundId } = req.params
  const MAX_REVIEWS = 20

  // 1. Validate FIRST, before touching existing reviews
  const rating = Number(req.body.review?.rating)
  const body = req.body.review?.body?.trim()

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    req.flash("error", "Please select a rating from 1 to 5 stars")
    return res.redirect(`/campgrounds/${campgroundId}`)
  }

  if (!body) {
    req.flash("error", "Please enter a review")
    return res.redirect(`/campgrounds/${campgroundId}`)
  }

  const campground = await Campground.findById(campgroundId).populate("reviews")
  if (!campground) throw new ExpressError("Campground not found", 404)

  // 2. Only delete oldest if the new review is valid
  if (campground.reviews.length >= MAX_REVIEWS) {
    const oldestReview = [...campground.reviews].sort(
      (a, b) => a.createdAt - b.createdAt,
    )[0]

    campground.reviews = campground.reviews.filter(
      (r) => r._id.toString() !== oldestReview._id.toString(),
    )
    await Review.findByIdAndDelete(oldestReview._id)
  }

  // 3. Use the cleaned values, not raw req.body
  const review = new Review({ rating, body })
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
