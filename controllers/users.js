import User from "../models/user.js"

const renderRegisterForm = (req, res) => res.render("users/register")

const registerUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body
    const user = new User({ email, username })
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, (err) => {
      if (err) return next(err)
      req.flash("success", "Welcome to Yelp Camp!")
      res.redirect("/campgrounds")
    })
  } catch (e) {
    req.flash("error", e.message)
    res.redirect("register")
  }
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
