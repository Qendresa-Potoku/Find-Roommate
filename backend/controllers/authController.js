import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { buildResponse } from "../utils/util.js";
import multer from "multer";
import { findNearestUsers } from "../utils/knnMatcher.js";
import { getCoordinates } from "../utils/geoUtils.js";
import fs from "fs";

export const register = async (req, res) => {
  const { name, email, username, password, location, ...rest } = req.body;

  const image = req.file ? req.file.path : null;

  if (
    !name ||
    !email ||
    !username ||
    !password ||
    !location ||
    !location.name
  ) {
    return buildResponse(res, 400, { message: "All fields are required" });
  }

  try {
    const { name: locationName, coordinates } = location;

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return buildResponse(res, 400, {
        message: "Invalid location coordinates",
      });
    }

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
      location: {
        name: locationName,
        coordinates,
      },
      image,
      ...rest,
    });

    await user.save();

    return buildResponse(res, 200, { message: "User registered successfully" });
  } catch (error) {
    console.error("Error during user registration:", error);
    return buildResponse(res, 500, {
      message: "Server Error",
      error: error.message,
    });
  }
};

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
  const { username, location, ...updateData } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedFields = { ...updateData };

    if (username && username !== currentUser.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      updatedFields.username = username;
    }

    if (location) {
      const coordinates = await getCoordinates(location.name);
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        return res.status(400).json({ message: "Invalid location" });
      }
      updatedFields.location = {
        name: location.name,
        coordinates,
      };
    }

    if (imagePath) {
      if (currentUser.image) {
        try {
          fs.unlinkSync(currentUser.image);
        } catch (err) {
          console.error("Error removing old image file:", err.message);
        }
      }

      updatedFields.image = imagePath;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

export const getMatchedUsers = async (req, res) => {
  try {
    const matchedUsers = await findNearestUsers(req.userId);

    const plainUsers = matchedUsers.map((user) =>
      user.toObject ? user.toObject() : user
    );

    return res.status(200).json(plainUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
