import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const Chat = () => {
  const { friendId: receiverId } = useParams(); // Extract receiverId from route
  const [userId, setUserId] = useState(null); // Use state to handle userId
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = io("http://localhost:5555");

  useEffect(() => {
    // Get userId from sessionStorage
    const storedUserId = sessionStorage.getItem("userId");

    if (!storedUserId) {
      console.error("Chat.jsx - User ID is missing from sessionStorage.");
      setUserId(null);
      return;
    }

    setUserId(storedUserId);

    // Debug logs
    console.log("Chat.jsx - receiverId:", receiverId);
    console.log("Chat.jsx - userId:", storedUserId);

    if (!receiverId) {
      console.error("Chat.jsx - Missing receiverId.");
      return;
    }

    // Fetch existing messages
    axios
      .get(`http://localhost:5555/api/chat/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });

    // Connect to the socket
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      socket.emit("joinRoom", storedUserId);
    });

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [receiverId]);

  const sendMessage = async () => {
    if (!receiverId || !userId) {
      console.error("Cannot send message. Missing receiverId or userId.");
      return;
    }

    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: userId,
      receiverId,
      message: newMessage,
    };

    // Send message to the server
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");

    // Save the message to the database
    try {
      await axios.post("http://localhost:5555/api/chat/send", messageData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Check for required values
  if (!receiverId || !userId) {
    return (
      <div>
        <p>Error: Missing required information to display the chat.</p>
        <p>
          Debug Information:
          <br />
          receiverId: {receiverId || "undefined"}
          <br />
          userId: {userId || "undefined"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.senderId === userId ? "sent" : "received"}
          >
            {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
