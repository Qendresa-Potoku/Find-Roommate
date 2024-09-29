import express from "express";
import {
  register,
  login,
  verify,
  updateUserProfile,
  getUserProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../utils/auth.js";
import User from "../models/userModel.js";

const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Verify token route
router.post("/verify", verify);

// Fetch user profile
router.get("/profile", verifyToken, getUserProfile);

// Update profile route
router.put("/update", verifyToken, updateUserProfile);

// Get all users except the logged-in user
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users." });
  }
});

// Send friend request
router.post("/send-friend-request", verifyToken, async (req, res) => {
  const { recipientId } = req.body;
  try {
    const user = await User.findById(req.userId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    // Check if the recipient already received the friend request
    if (!recipient.friendRequests.includes(req.userId)) {
      recipient.friendRequests.push(req.userId);
      await recipient.save();
      res.status(200).json({ message: "Friend request sent." });
    } else {
      res.status(400).json({ message: "Friend request already sent." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sending friend request." });
  }
});

// Fetch friend requests
router.get("/friends/requests", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "friendRequests",
      "name username"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friend requests." });
  }
});

// Accept friend request
router.post("/friends/accept", verifyToken, async (req, res) => {
  const { senderId } = req.body;

  try {
    const user = await User.findById(req.userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the sender has actually sent a friend request
    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request not found." });
    }

    // Add each other as friends
    user.friendlist.push(senderId);
    sender.friendlist.push(req.userId);

    // Remove the request from the friend requests
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Friend request accepted." });
  } catch (error) {
    res.status(500).json({ message: "Error accepting friend request." });
  }
});

// Delete friend request
router.post("/friends/delete", verifyToken, async (req, res) => {
  const { senderId } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove the friend request
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await user.save();

    res.status(200).json({ message: "Friend request deleted." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting friend request." });
  }
});

// Fetch friend list
router.get("/friends/list", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "friendlist",
      "name username"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friendlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friends list." });
  }
});

export default router;
