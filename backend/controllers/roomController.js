import Room from "../models/roomModel.js";
import { findNearestRooms } from "../utils/knnMatcher.js";
import User from "../models/userModel.js";
import { getCoordinates } from "../utils/geoUtils.js";
import multer from "multer";
import fs from "fs";

export const addRoom = async (req, res) => {
  const {
    rent,
    availableFrom,
    duration,
    type,
    layout,
    deposit,
    description,
    location,
  } = req.body;

  // Handle images
  const images = req.files ? req.files.map((file) => file.path) : [];

  try {
    // Validate location
    const coordinates = await getCoordinates(location.name);
    if (!coordinates) {
      return res.status(400).json({ message: "Invalid location provided." });
    }

    const newRoom = new Room({
      userId: req.userId,
      rent,
      availableFrom,
      duration,
      type,
      layout,
      deposit,
      description,
      location: {
        name: location.name,
        coordinates,
      },
      images, // Save image paths
    });

    await newRoom.save();
    return res
      .status(201)
      .json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    console.error("Error adding room:", error);
    return res.status(500).json({ message: "Error adding room", error });
  }
};

const roomStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/rooms");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
export const roomUpload = multer({ storage: roomStorage });

// Fetch all rooms posted by the logged-in user
export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.userId });
    return res.status(200).json({ rooms });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching rooms", error });
  }
};

export const updateRoom = async (req, res) => {
  const { roomId } = req.params;
  const {
    rent,
    availableFrom,
    duration,
    type,
    layout,
    deposit,
    description,
    location,
    images,
  } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (room.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this room." });
    }

    // Validate location
    if (!location || !location.name || !location.coordinates) {
      return res.status(400).json({ message: "Invalid location provided." });
    }

    // Update room fields
    room.rent = rent;
    room.availableFrom = availableFrom;
    room.duration = duration;
    room.type = type;
    room.layout = layout;
    room.deposit = deposit;
    room.description = description;
    room.location = location;
    room.images = images;

    await room.save();
    return res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({ message: "Error updating room", error });
  }
};

// Delete a room listing
export const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  console.log("Room ID received:", roomId); // Log the roomId

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      console.log(`Room with ID ${roomId} not found`);
      return res.status(404).json({ message: "Room not found" });
    }

    console.log(`Room found: ${room}`);

    if (room.userId.toString() !== req.userId) {
      console.log(
        `Unauthorized: User ${req.userId} is not authorized to delete room ${roomId}`
      );
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this room" });
    }

    // Attempt to delete the room using findByIdAndDelete instead of remove
    await Room.findByIdAndDelete(roomId);
    console.log(`Room ${roomId} deleted successfully`);

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error.message, error.stack); // Log the exact error
    return res.status(500).json({ message: "Error deleting room", error });
  }
};

export const getOtherRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: { $ne: req.userId } });
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({ message: "Error fetching rooms", error });
  }
};

export const getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find(
      {},
      "title location images rent type layout deposit "
    );
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching public rooms:", error);
    return res.status(500).json({ message: "Error fetching public rooms" });
  }
};

export const getMatchedRooms = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const matchedRooms = await findNearestRooms(req.userId, 5); // Get top 5 rooms

    console.log(
      "Matched Rooms (sorted by geographic and income distance):",
      matchedRooms
    );

    return res.status(200).json(matchedRooms);
  } catch (error) {
    console.error("Error fetching matched rooms:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
