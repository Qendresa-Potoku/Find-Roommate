import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { buildResponse } from "../utils/util.js";
import multer from "multer";
import { findNearestNeighbors } from "../utils/knnMatcher.js";

// Register a user
export const register = async (req, res) => {
  const { name, email, username, password, ...rest } = req.body;
  const image = req.file ? req.file.path : null;

  if (!name || !email || !username || !password) {
    return buildResponse(res, 400, { message: "All fields are required" });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return buildResponse(res, 400, { message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      image,
      ...rest,
    });

    await user.save();
    return buildResponse(res, 200, { message: "User registered successfully" });
  } catch (error) {
    return buildResponse(res, 500, { message: "Server Error" });
  }
};

// Login a user
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return buildResponse(res, 400, { message: "Username or password missing" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return buildResponse(res, 404, { message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return buildResponse(res, 401, { message: "Password incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return buildResponse(res, 200, { token, user });
  } catch (error) {
    return buildResponse(res, 500, { message: "Server Error" });
  }
};

// Token verification
export const verify = (req, res) => {
  const token = req.body.token;

  if (!token) {
    return buildResponse(res, 400, { message: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return buildResponse(res, 200, { verified: true, user: decoded });
  } catch (error) {
    return buildResponse(res, 401, { message: "Invalid token" });
  }
};

export const updateUserProfile = async (req, res) => {
  const userId = req.userId;
  const { username, ...updateData } = req.body;

  try {
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user wants to update the username and if it already exists
    if (username && username !== currentUser.username) {
      const usernameExists = await User.findOne({ username: username });
      if (usernameExists) {
        return res.status(400).json({
          message: "Username already exists. Please use a different username.",
        });
      }
    }

    // Create the final object of updates (including username if it's changed)
    const updatedFields = username ? { ...updateData, username } : updateData;

    // Update the user data in the database with the new fields
    const updatedUser = await User.findByIdAndUpdate(
      userId, // Find the same user based on the logged-in userId
      { $set: updatedFields }, // Set the updated fields
      { new: true, runValidators: true } // Return the updated document
    );

    // Respond with the updated user data
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with storage
export const upload = multer({ storage });

// Controller function for updating profile image
export const updateProfileImage = async (req, res) => {
  const userId = req.userId;
  const imagePath = req.file ? req.file.path : null; // Get the uploaded file path

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { image: imagePath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile image updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Endpoint to get matched users for the current user
export const getMatchedUsers = async (req, res) => {
  try {
    const matchedUsers = await findNearestNeighbors(req.userId, 5); // Top 5 users
    return res.status(200).json(matchedUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
