// routes/roomRoutes.js

import express from "express";
import {
  addRoom,
  getUserRooms,
  updateRoom,
  deleteRoom,
  getOtherRooms,
} from "../controllers/roomController.js";
import { verifyToken } from "../utils/auth.js";

const router = express.Router();

// Route to add a new room
router.post("/add", verifyToken, addRoom);

// Route to fetch all rooms posted by the user
router.get("/", verifyToken, getUserRooms);

// Route to update a room listing
router.post("/update/:roomId", verifyToken, updateRoom);

// Route to delete a room
router.delete("/delete/:roomId", verifyToken, deleteRoom);

//Fetch rooms
router.get("/other-rooms", verifyToken, getOtherRooms);

export default router;
