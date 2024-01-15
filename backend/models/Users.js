import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: String, required: true },
  email:{type:String,required:true},
  isVerified:{type:Boolean,required:true},
  postedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blogs" }],
  emailToken:{type:String}
});

export const UserModel = mongoose.model("Users", UserSchema);
