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
import { roomUpload } from "../controllers/roomController.js";

const router = express.Router();

router.post("/add", verifyToken, roomUpload.array("images"), addRoom);

router.get("/", verifyToken, getUserRooms);

router.post(
  "/update/:roomId",
  verifyToken,
  roomUpload.array("images"),
  updateRoom
);

router.delete("/delete/:roomId", verifyToken, deleteRoom);

router.get("/other-rooms", verifyToken, getOtherRooms);

router.get("/public-rooms", getPublicRooms);

router.get("/matches/rooms", verifyToken, getMatchedRooms);

export default router;
