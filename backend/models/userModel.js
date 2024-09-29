import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  gender: String,
  orientation: String,
  diet: String,
  drinks: String,
  drugs: String,
  education: String,
  ethnicity: String,
  income: String,
  location: String,
  pets: String,
  smokes: String,
  speaks: String,
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);
export default User;
