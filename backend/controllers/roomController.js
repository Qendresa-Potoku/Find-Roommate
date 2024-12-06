import Room from "../models/roomModel.js";
import { findNearestRooms } from "../utils/knnMatcher.js";
import User from "../models/userModel.js";
import { getCoordinates } from "../utils/geoUtils.js";
import multer from "multer";
import fs from "fs";
import path from "path";

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
    images,
  } = req.body;

  try {
    const coordinates = await getCoordinates(location.name);
    if (!coordinates) {
      return res.status(400).json({ message: "Invalid location provided." });
    }

    const imagePaths = [];
    if (images && images.length > 0) {
      images.forEach((base64Image, index) => {
        const buffer = Buffer.from(
          base64Image.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        const fileName = `${Date.now()}-${index}.jpg`;
        const filePath = path.join("./uploads/rooms", fileName);
        fs.writeFileSync(filePath, buffer);
        imagePaths.push(filePath);
      });
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
      images: imagePaths,
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

    const coordinates = await getCoordinates(location.name);
    if (!coordinates) {
      return res.status(400).json({ message: "Invalid location provided." });
    }

    const newImagePaths = [];
    if (images && images.length > 0) {
      images.forEach((base64Image, index) => {
        const buffer = Buffer.from(
          base64Image.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        const fileName = `${Date.now()}-${index}.jpg`;
        const filePath = path.join("./uploads/rooms", fileName);
        fs.writeFileSync(filePath, buffer);
        newImagePaths.push(filePath);
      });
    }

    room.rent = rent;
    room.availableFrom = availableFrom;
    room.duration = duration;
    room.type = type;
    room.layout = layout;
    room.deposit = deposit;
    room.description = description;
    room.location = {
      name: location.name,
      coordinates,
    };
    room.images = [...room.images, ...newImagePaths];

    await room.save();
    return res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({ message: "Error updating room", error });
  }
};

export const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  console.log("Room ID received:", roomId);

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

    await Room.findByIdAndDelete(roomId);
    console.log(`Room ${roomId} deleted successfully`);

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error.message, error.stack);
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
      "rent type layout deposit location.name location.coordinates images availableFrom"
    );
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching public rooms:", error);
    return res.status(500).json({ message: "Error fetching public rooms" });
  }
};

export const getMatchedRooms = async (req, res) => {
  try {
    const matchedRooms = await findNearestRooms(req.userId);
    return res.status(200).json(matchedRooms);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
