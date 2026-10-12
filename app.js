import "./env.js"
// import "./utils/mongoSanitizeV5.js"
import { sanitizeV5 } from "./utils/mongoSanitizeV5.js"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import methodOverride from "method-override"
import morgan from "morgan"
import ejsMate from "ejs-mate"
import ExpressError from "./utils/ExpressError.js"
import campgroundRoutes from "./routes/campgrounds.js"
import userRoutes from "./routes/users.js"
import reviewRoutes from "./routes/reviews.js"
import session from "express-session"
import flash from "connect-flash"
import passport from "passport"
import LocalStrategy from "passport-local"
import User from "./models/user.js"
import helmet from "helmet"
import { MongoStore } from "connect-mongo"

const dbUrl = process.env.MONGO_URI || "mongodb://localhost:27017/yelp-camp"

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
})

mongoose.connect(dbUrl)

const db = mongoose.connection
db.on("error", (err) => {
  console.error(
    `\x1b[31m[❌ DB ERROR] [${new Date().toLocaleTimeString()}] Connection failed:\x1b[0m`,
    err.message,
  )
})

db.once("open", () => {
  const { host, name } = mongoose.connection
  console.log(
    `\x1b[32m[🚀 DB SUCCESS] [${new Date().toLocaleTimeString()}] Connected to Mongo successfully!\x1b[0m`,
  )
  console.log(`   ├─ Host: ${host}`)
  console.log(`   └─ Database: ${name}`)
})

const app = express()
app.set("query parser", "extended")

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.set("view engine", "ejs")
app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(sanitizeV5({ replaceWith: "_" }))

store.on("error", (e) => console.log("SESSION STORE ERROR.", e.messsage))

const sessionConfig = {
  store,
  name: "YelpCamp-User-Session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionConfig))
app.use(flash())
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.tiles.mapbox.com/",
  // "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
]
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.mapbox.com/",
  // "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
]
const connectSrcUrls = [
  // "https://api.mapbox.com/",
  // "https://a.tiles.mapbox.com/",
  // "https://b.tiles.mapbox.com/",
  // "https://events.mapbox.com/",
  "https://api.maptiler.com/",
  "https://cdn.maptiler.com",
  "https://cdn.jsdelivr.net",
]
// imgSrc: (["https://api.maptiler.com/"],
const fontSrcUrls = ["https://cdn.jsdelivr.net"]
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
)

app.use((req, res, next) => {
  if (req.url.includes(".well-known")) {
    return res.status(204).end()
  }
  next()
})

app.use(morgan("dev"))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  // console.log("req.query:", req.query)
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

app.use("/", userRoutes)
app.use("/campgrounds/:campgroundId/reviews", reviewRoutes)
app.use("/campgrounds", campgroundRoutes)

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
  if (process.env.NODE_ENV !== "production")
    console.log(`Running in ${process.env.NODE_ENV} mode`)
})

// Unsplash image url
// https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtcGdyb3VuZHxlbnwwfHwwfHx8MA%3D%3D
// app.all('/{*path}', (req, res, next) => {}
//  _id: {id: false},
// npm install cloudinary@1.41.3

// npm install multer-storage-cloudinary@4.0.0

// npm install multer@1.4.5-lts.1
