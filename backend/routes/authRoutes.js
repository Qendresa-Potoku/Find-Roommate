import express from "express";
import { upload } from "../controllers/authController.js";
import {
  register,
  login,
  verify,
  updateUserProfile,
  getUserProfile,
  getMatchedUsers,
} from "../controllers/authController.js";
import { verifyToken } from "../utils/auth.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/register", upload.single("image"), register);

router.post("/login", login);

router.post("/verify", verify);

router.get("/profile", verifyToken, getUserProfile);

router.put("/update", verifyToken, upload.single("image"), updateUserProfile);

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users." });
  }
});

router.post("/send-friend-request", verifyToken, async (req, res) => {
  const { recipientId } = req.body;
  try {
    const user = await User.findById(req.userId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

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

router.post("/friends/accept", verifyToken, async (req, res) => {
  const { senderId } = req.body;

  try {
    const user = await User.findById(req.userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request not found." });
    }

    user.friendlist.push(senderId);
    sender.friendlist.push(req.userId);

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

router.get("/public-users", async (req, res) => {
  try {
    const users = await User.find({}, "name email image");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users." });
  }
});

router.post("/friends/delete", verifyToken, async (req, res) => {
  const { senderId } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== senderId
    );

    await user.save();

    res.status(200).json({ message: "Friend request deleted." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting friend request." });
  }
});

router.get("/friends/list", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "friendlist",
      "name username image"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friendlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching friends list." });
  }
});

router.get("/matches/users", verifyToken, getMatchedUsers);

export default router;
