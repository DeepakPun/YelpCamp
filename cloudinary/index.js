import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
console.log(
  "ENV CHECK:",
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_KEY ? "key exists" : "KEY MISSING",
)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpg", "png", "jpeg"],
  },
})

export { cloudinary, storage }
