import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  availableFrom: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  layout: {
    type: String,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    name: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  images: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
