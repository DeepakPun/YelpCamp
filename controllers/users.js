import User from "../models/user.js"
import { cloudinary } from "../cloudinary/index.js"

const renderRegisterForm = (req, res) => res.render("users/register")

const registerUser = async (req, res, next) => {
  const { email, username, password } = req.body
  const user = new User({ email, username })
  const MAX_USERS = 100

  const userCount = await User.countDocuments()

  if (userCount >= MAX_USERS) {
    const oldestUser = await User.findOne().sort({ createdAt: 1 })
    const userCamps = await Campground.find({ author: oldestUser._id })
    for (let camp of userCamps) {
      for (let img of camp.images) {
        await cloudinary.uploader.destroy(img.filename)
      }
      await Review.deleteMany({ _id: { $in: camp.reviews } })
      await Campground.findByIdAndDelete(camp._id)
    }
    await User.findByIdAndDelete(oldestUser._id)
    // console.log(`Demo cap: deleted oldest user ${oldestUser.username}`)
  }
  const registeredUser = await User.register(user, password)

  req.login(registeredUser, (err) => {
    if (err) return next(err)
    req.flash("success", "Welcome to Yelp Camp!")
    res.redirect("/campgrounds")
  })
}

const renderLoginForm = (req, res) => res.render("users/login")

const loginUser = async (req, res) => {
  req.flash("success", "Welcome back!")
  const redirectUrl = res.locals.returnTo || "/campgrounds"
  res.redirect(redirectUrl)
}

const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) return next(err)
    req.flash("success", "Successfully logged out!")
    res.redirect("/campgrounds")
  })
}

export {
  renderRegisterForm,
  renderLoginForm,
  loginUser,
  registerUser,
  logoutUser,
}
