import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import methodOverride from "method-override"
import morgan from "morgan"
import ejsMate from "ejs-mate"
import ExpressError from "./utils/ExpressError.js"
import campgroundRoutes from "./routes/campgrounds.js"
import reviewRoutes from "./routes/reviews.js"
import session from "express-session"
import flash from "connect-flash"

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
app.use(express.static(path.join(__dirname, "public")))

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionConfig))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

app.use((req, res, next) => {
  if (req.url.includes(".well-known")) {
    return res.status(204).end()
  }
  next()
})

app.use(morgan("dev"))

app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:campgroundId/reviews", reviewRoutes)

app.get("/", (req, res) => {
  res.render("home")
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
