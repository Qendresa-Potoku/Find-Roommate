import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { buildResponse } from "../utils/util.js";
import multer from "multer";
import { findNearestNeighbors } from "../utils/knnMatcher.js";
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
    // Validate and destructure location
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
  const userId = req.userId; // Extract user ID from verified token
  const { username, location, ...updateData } = req.body; // Destructure non-file fields
  const imagePath = req.file ? req.file.path : null; // Check if a file was uploaded

  try {
    // Fetch the current user from the database
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedFields = { ...updateData };

    // Handle username update
    if (username && username !== currentUser.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      updatedFields.username = username;
    }

    // Handle location update
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

    // Handle image update
    if (imagePath) {
      // Optionally remove the old image file if exists
      if (currentUser.image) {
        try {
          fs.unlinkSync(currentUser.image);
        } catch (err) {
          console.error("Error removing old image file:", err.message);
        }
      }

      // Save the new image path
      updatedFields.image = imagePath;
    }

    // Update the user with the collected fields
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

// Initialize multer with storage
export const upload = multer({ storage });

// Controller function for updating profile image
// export const updateProfileImage = async (req, res) => {
//   const userId = req.userId;
//   const imagePath = req.file ? req.file.path : null;

//   console.log("Profile image update request received:");
//   console.log("User ID:", userId);
//   console.log("Uploaded File:", req.file);

//   if (!userId) {
//     return res.status(400).json({ message: "User ID is missing" });
//   }

//   if (!imagePath) {
//     return res.status(400).json({ message: "Image file is required" });
//   }

//   try {
//     // Update the image in DB
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { image: imagePath },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "Profile image updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error updating profile image:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Endpoint to get matched users for the current user
export const getMatchedUsers = async (req, res) => {
  try {
    const matchedUsers = await findNearestNeighbors(req.userId, 6); // Top 5 users
    return res.status(200).json(matchedUsers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
