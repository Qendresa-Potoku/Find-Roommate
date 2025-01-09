import express from "express";
import { verifyToken } from "../utils/auth.js";
import {
  sendMessage,
  getMessages,
  getChats,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);

router.get("/messages/:receiverId", verifyToken, getMessages);
router.get("/chats", verifyToken, getChats);

export default router;
