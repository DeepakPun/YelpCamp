//  _id: {id: false},
import mongoose from "mongoose"
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
})

export default mongoose.model("User", userSchema)
