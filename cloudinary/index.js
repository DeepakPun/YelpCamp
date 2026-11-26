import { v2 as cloudinary } from "cloudinary"
import multer from "multer"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only jpg, png, jpeg allowed"))
    }
  },
})

function uploadToCloudinary(buffer, folder = "YelpCamp") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(buffer)
  })
}

export { cloudinary, upload, uploadToCloudinary }

// console.log(
//   "ENV CHECK:",
//   process.env.CLOUDINARY_CLOUD_NAME,
//   process.env.CLOUDINARY_KEY ? "key exists" : "KEY MISSING",
// )
