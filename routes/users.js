import express from "express"
import User from "../models/user.js"
import passport from "passport"
import { storeReturnTo } from "../middleware.js"
import {
  loginUser,
  logoutUser,
  registerUser,
  renderLoginForm,
  renderRegisterForm,
} from "../controllers/users.js"

const router = express.Router()

router.route("/register").get(renderRegisterForm).post(registerUser)

router
  .route("/login")
  .get(renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    loginUser,
  )

router.route("/logout").get(logoutUser)

export default router
