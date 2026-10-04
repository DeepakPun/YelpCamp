import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import Campground from "./models/campground.js"
import Review from "./models/review.js"
import methodOverride from "method-override"
import morgan from "morgan"
import ejsMate from "ejs-mate"
import ExpressError from "./utils/ExpressError.js"
import { campgroundSchema, reviewSchema } from "./schemas.js"

mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.set("view engine", "ejs")
app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))

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

app.use((req, res, next) => {
  if (req.url.includes(".well-known")) {
    return res.status(204).end()
  }
  next()
})

app.use(morgan("dev"))

app.get("/", (req, res) => {
  res.render("home")
})

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id).populate("reviews")
  console.log(campground)
  res.render("campgrounds/show", { campground })
})

app.post("/campgrounds", validateCampground, async (req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render("campgrounds/edit", { campground })
})

app.put("/campgrounds/:id", validateCampground, async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { new: true },
  )
  res.redirect(`/campgrounds/${campground._id}`)
})

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  res.redirect("/campgrounds")
})

app.post(
  "/campgrounds/:campgroundId/reviews",
  validateReview,
  async (req, res) => {
    const { campgroundId } = req.params
    const campground = await Campground.findById(campgroundId)
    if (!campground) throw new ExpressError("Campground not found", 404)

    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    console.log(campground)
    res.redirect(`/campgrounds/${campground._id}`)
  },
)

app.delete("/campgrounds/:campgroundId/reviews/:reviewId", async (req, res) => {
  const { campgroundId, reviewId } = req.params
  await Campground.findByIdAndUpdate(campgroundId, {
    $pull: { reviews: reviewId },
  })
  await Review.findByIdAndDelete(reviewId)
  res.redirect(`/campgrounds/${campgroundId}`)
})

app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = "Oh No, Something Went Wrong!"
  res.status(statusCode).render("error", { err })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Unsplash image url
// https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtcGdyb3VuZHxlbnwwfHwwfHx8MA%3D%3D
// app.all('/{*path}', (req, res, next) => {}
//  _id: {id: false},
