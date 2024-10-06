// controllers/roomController.js

import Room from "../models/roomModel.js";

// Add a new room listing
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
    const newRoom = new Room({
      userId: req.userId, // req.userId is extracted from the verified token
      rent,
      availableFrom,
      duration,
      type,
      layout,
      deposit,
      description,
      location,
      images,
    });

    await newRoom.save();
    return res
      .status(201)
      .json({ message: "Room posted successfully", room: newRoom });
  } catch (error) {
    return res.status(500).json({ message: "Error posting room", error });
  }
};

// Fetch all rooms posted by the logged-in user
export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.userId });
    return res.status(200).json({ rooms });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching rooms", error });
  }
};

// Update room listing
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
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this room" });
    }

    // Update the room's fields
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

// Fetch all rooms except those posted by the logged-in user
export const getOtherRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: { $ne: req.userId } });
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({ message: "Error fetching rooms", error });
  }
};
