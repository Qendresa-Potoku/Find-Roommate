import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res
      .status(400)
      .json({ message: "Receiver and message are required" });
  }

  try {
    const newMessage = await Message.create({
      sender: req.userId,
      receiver: receiverId,
      message,
    });

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getMessages = async (req, res) => {
  const { receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: receiverId },
        { sender: receiverId, receiver: req.userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const getChats = async (req, res) => {
  try {
    const userId = req.userId; // Get the logged-in user's ID from the token

    // Fetch the logged-in user's friends
    const user = await User.findById(userId).populate(
      "friendlist",
      "name username image"
    ); // Populate friend details

    if (!user || !user.friendlist) {
      return res.status(404).json({ message: "Friends not found" });
    }

    // Get the last message for each friend
    const chats = await Promise.all(
      user.friendlist.map(async (friend) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: friend._id },
            { sender: friend._id, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 }) // Sort by latest message
          .exec();

        return {
          friendId: friend._id,
          name: friend.name,
          username: friend.username,
          image: friend.image || null,
          lastMessage: lastMessage ? lastMessage.message : "Start Chatting",
          timestamp: lastMessage ? lastMessage.createdAt : null,
        };
      })
    );

    // Sort chats by timestamp (most recent first)
    chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
};
