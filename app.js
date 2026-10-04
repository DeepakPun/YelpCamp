import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import Campground from "./models/campground.js"
import methodOverride from "method-override"

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
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))

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
  const campground = await Campground.findById(id)
  res.render("campgrounds/show", { campground })
})

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render("campgrounds/edit", { campground })
})

app.put("/campgrounds/:id", async (req, res) => {
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
