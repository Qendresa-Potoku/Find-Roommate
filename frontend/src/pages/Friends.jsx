import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../services/AuthServices";

const Friends = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState("");
  const user = getUser();

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
      fetchFriends();
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5555/api/auth/friends/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriendRequests(response.data);
    } catch (error) {
      setMessage("Error fetching friend requests.");
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5555/api/auth/friends/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriends(response.data);
    } catch (error) {
      setMessage("Error fetching friends.");
    }
  };

  const acceptFriendRequest = async (senderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5555/api/auth/friends/accept",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendRequests(); // Refresh friend requests
      fetchFriends(); // Refresh friends list
    } catch (error) {
      setMessage("Error accepting friend request.");
    }
  };

  const deleteFriendRequest = async (senderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5555/api/auth/friends/delete",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendRequests(); // Refresh friend requests
    } catch (error) {
      setMessage("Error deleting friend request.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Friend Requests</h1>
      {message && <p>{message}</p>}
      <ul>
        {friendRequests.map((request) => (
          <li key={request._id} className="border p-4 rounded-lg shadow-md">
            <p>
              {request.name} ({request.username})
            </p>
            <button
              onClick={() => acceptFriendRequest(request._id)}
              className="mr-2 bg-green-500 text-white py-1 px-4 rounded"
            >
              Accept
            </button>
            <button
              onClick={() => deleteFriendRequest(request._id)}
              className="bg-red-500 text-white py-1 px-4 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2 className="text-xl mt-4">Your Friends:</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id} className="border p-4 rounded-lg shadow-md">
            <p>{friend.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Friends;
