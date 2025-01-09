import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const Chats = () => {
  const { friendId } = useParams(); // Get friendId from the URL params
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(friendId);
  const userId = sessionStorage.getItem("userId");
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5555"); // Adjust for your backend address
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", userId); // Join room for logged-in user
    });

    // Listen for new messages
    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);

      // Update last message in chats list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.friendId === message.sender || chat.friendId === message.receiver
            ? {
                ...chat,
                lastMessage: message.message,
                timestamp: message.createdAt,
              }
            : chat
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Fetch all chats for the user
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5555/api/chat/chats",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  // Fetch messages for the selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!friendId) return;
      try {
        const response = await axios.get(
          `http://localhost:5555/api/chat/messages/${friendId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        setMessages(response.data);
        setSelectedChat(friendId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [friendId]);

  // Handle sending a new message
  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: userId,
      receiverId: friendId,
      message: newMessage,
    };

    // Optimistically add the message to the UI
    setMessages((prev) => [
      ...prev,
      { ...messageData, createdAt: new Date().toISOString() },
    ]);

    // Update last message in chats list
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.friendId === friendId
          ? {
              ...chat,
              lastMessage: newMessage,
              timestamp: new Date().toISOString(),
            }
          : chat
      )
    );

    setNewMessage(""); // Clear the input field immediately

    try {
      // Emit the message to the backend via Socket.IO
      socket.emit("sendMessage", messageData);

      // Save the message to the database
      await axios.post("http://localhost:5555/api/chat/send", messageData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for Chats */}
      <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Messages</h3>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <Link
              to={`/chats/${chat.friendId}`}
              key={chat.friendId}
              className={`block p-2 rounded ${
                chat.friendId === selectedChat ? "bg-gray-700" : ""
              }`}
            >
              <div className="flex items-center">
                <img
                  src={`http://localhost:5555/${
                    chat.image || "uploads/default-profile.png"
                  }`}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <p className="font-bold">{chat.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage || "Start chatting"}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">No chats available</p>
        )}
      </div>

      {/* Chat Window */}
      <div className="w-3/4 bg-gray-900 text-white p-4 flex flex-col justify-between">
        {friendId ? (
          <>
            <div className="mb-4 flex-grow overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isSender =
                    msg.sender === userId ||
                    msg?.senderId?.toString() === userId?.toString(); // Safely check if sender matches userId
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isSender ? "justify-end" : "justify-start"
                      }`}
                    >
                      <p
                        className={`inline-block p-2 rounded my-1 ${
                          isSender
                            ? "bg-blue-600 text-white text-right"
                            : "bg-gray-700 text-white text-left"
                        }`}
                      >
                        {msg.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-400">
                  No messages yet. Start chatting!
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow bg-gray-700 text-white p-2 rounded-l"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 p-2 rounded-r"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-center flex-grow flex items-center justify-center">
            Select a chat to start messaging
          </p>
        )}
      </div>
    </div>
  );
};

export default Chats;
