import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/AuthServices";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5555/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredUsers = response.data.filter(
        (userItem) => userItem._id !== user.id
      );
      setUsers(filteredUsers);
    } catch (error) {
      setMessage("Error fetching users.");
    }
  };

  const sendFriendRequest = async (recipientId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5555/api/auth/send-friend-request",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error sending friend request.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      {user && <p>Logged in as: {user.name}</p>}
      {message && <p>{message}</p>}
      <h2 className="text-xl">Users:</h2>
      <div className="grid grid-cols-3 gap-4">
        {users.map((userItem) => (
          <div
            key={userItem._id}
            className="border p-4 rounded-lg shadow-md flex flex-col items-center"
          >
            <p className="font-bold">{userItem.name}</p>
            <p>{userItem.email}</p>
            <button
              onClick={() => sendFriendRequest(userItem._id)}
              className="mt-2 bg-blue-500 text-white py-1 px-4 rounded"
            >
              Add Friend
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
