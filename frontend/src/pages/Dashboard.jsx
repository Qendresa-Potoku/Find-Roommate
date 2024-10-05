import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/AuthServices";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState("");
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchFriends();
    } else {
      navigate("/login");
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

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

  const fetchFriends = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5555/api/auth/friends/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriends(response.data.map((friend) => friend._id)); // Store friends' ids in state
    } catch (error) {
      setMessage("Error fetching friends.");
    }
  };

  const sendFriendRequest = async (recipientId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

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
            {/* Conditionally show Add Friend button if not already a friend */}
            {!friends.includes(userItem._id) && (
              <button
                onClick={() => sendFriendRequest(userItem._id)}
                className="mt-2 bg-blue-500 text-white py-1 px-4 rounded"
              >
                Add Friend
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
