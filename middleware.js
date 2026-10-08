import Campground from "./models/campground.js"
import Review from "./models/review.js"
import { campgroundSchema, reviewSchema } from "./schemas.js"
import ExpressError from "./utils/ExpressError.js"

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash("error", "You must be signed in first!")
    return res.redirect("/login")
  }
  next()
}

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) res.locals.returnTo = req.session.returnTo
  next()
}

const isAuthor = async (req, res, next) => {
  const { campgroundId } = req.params
  const campground = await Campground.findById(campgroundId)
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this campground")
    return res.redirect(`/campgrounds/${campgroundId}`)
  }
  next()
}

const isReviewAuthor = async (req, res, next) => {
  const { campgroundId, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review")
    return res.redirect(`/campgrounds/${campgroundId}`)
  }
  next()
}

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

export {
  isLoggedIn,
  storeReturnTo,
  isAuthor,
  isReviewAuthor,
  validateCampground,
  validateReview,
}
