import mongoose from "mongoose"
import passportLocalMongoose from "passport-local-mongoose"
const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
})

UserSchema.plugin(passportLocalMongoose.default)

export default mongoose.model("User", UserSchema)
