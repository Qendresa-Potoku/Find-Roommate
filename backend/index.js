import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { PORT } from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const mongoDBURL = process.env.MONGODB_URL;

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app); // Use http server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend origin
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default route
app.get("/", (req, res) => {
  res.status(200).send("Welcome To MERN Stack");
});

// MongoDB connection
mongoose
  .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    if (!userId) {
      console.error("Invalid userId received for joinRoom.");
      return;
    }
    socket.join(userId);
    console.log(`User ${userId} joined their room.`);
  });

  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, message } = data;

    if (!senderId || !receiverId || !message) {
      console.error("Invalid data received for sendMessage:", data);
      return;
    }

    io.to(receiverId).emit("receiveMessage", { senderId, message });
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io };
