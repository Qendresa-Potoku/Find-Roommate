import express from "express";
import mongoose from "mongoose";
import { PORT, mongoDBURL } from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes); // Auth routes for login/register
// Add the room routes
app.use("/api/rooms", roomRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).send("Welcome To MERN Stack");
});

// Connect to MongoDB and start the server
mongoose
  .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
