import express from "express"
import Campground from "../models/campground.js"
import Review from "../models/review.js"
import { reviewSchema } from "../schemas.js"
import ExpressError from "../utils/ExpressError.js"

const router = express.Router({ mergeParams: true })

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

router.post("/", validateReview, async (req, res) => {
  const { campgroundId } = req.params
  const campground = await Campground.findById(campgroundId)
  if (!campground) throw new ExpressError("Campground not found", 404)

  const review = new Review(req.body.review)
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash("success", "Successfully made a new review!")
  res.redirect(`/campgrounds/${campground._id}`)
})

router.delete("/:reviewId", async (req, res) => {
  const { campgroundId, reviewId } = req.params
  await Campground.findByIdAndUpdate(campgroundId, {
    $pull: { reviews: reviewId },
  })
  await Review.findByIdAndDelete(reviewId)
  req.flash("error", "Successfully deleted review!")
  res.redirect(`/campgrounds/${campgroundId}`)
})

export default router
