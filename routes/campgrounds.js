import express from "express"
import { isLoggedIn, isAuthor, validateCampground } from "../middleware.js"
import multer from "multer"
import { storage } from "../cloudinary/index.js"
const upload = multer({ storage })

import {
  createCampground,
  getAllCampgrounds,
  renderEditForm,
  renderNewCampForm,
  updateCampground,
  viewSingleCamp,
  deleteCampground,
} from "../controllers/campgrounds.js"

const router = express.Router()

router
  .route("/")
  .get(getAllCampgrounds)
  .post(
    isLoggedIn,
    validateCampground,
    upload.array("images"),
    createCampground,
  )

router.route("/new").get(isLoggedIn, renderNewCampForm)

router
  .route("/:campgroundId")
  .get(viewSingleCamp)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("images"),
    validateCampground,
    updateCampground,
  )
  .delete(isLoggedIn, isAuthor, deleteCampground)

router.route("/:campgroundId/edit").get(isLoggedIn, isAuthor, renderEditForm)

export default router
