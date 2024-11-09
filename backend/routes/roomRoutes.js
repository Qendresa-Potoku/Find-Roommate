// routes/roomRoutes.js

import express from "express";
import {
  addRoom,
  getUserRooms,
  updateRoom,
  deleteRoom,
  getOtherRooms,
  getPublicRooms,
  getMatchedRooms,
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

router.get("/public-rooms", getPublicRooms);

// Route to get matched rooms
router.get("/matches/rooms", verifyToken, getMatchedRooms);

export default router;
