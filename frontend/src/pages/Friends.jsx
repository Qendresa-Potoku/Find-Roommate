import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../services/AuthServices";

const Friends = () => {
  const [tab, setTab] = useState("friends");
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const user = getUser();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [friendReqs, friendsList] = await Promise.all([
        fetchFriendRequests(),
        fetchFriends(),
      ]);

      setFriendRequests(friendReqs);
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends or requests", error);
      setMessage("Failed to load data.");
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return [];

      const response = await axios.get(
        "http://localhost:5555/api/auth/friends/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      setMessage("Error fetching friend requests.");
      return [];
    }
  };

  const fetchFriends = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return [];

      const response = await axios.get(
        "http://localhost:5555/api/auth/friends/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      setMessage("Error fetching friends.");
      return [];
    }
  };

  const acceptFriendRequest = async (senderId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5555/api/auth/friends/accept",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      setMessage("Error accepting friend request.");
    }
  };

  const deleteFriendRequest = async (senderId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5555/api/auth/friends/delete",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      setMessage("Error deleting friend request.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Friends and Requests</h1>

      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button
          className={`mr-4 px-4 py-2 ${
            tab === "friends" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("friends")}
        >
          Friends
        </button>
        <button
          className={`px-4 py-2 ${
            tab === "requests" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("requests")}
        >
          Requests
        </button>
      </div>

      {message && <p className="text-red-500">{message}</p>}

      {/* Tab Content */}
      {tab === "friends" && (
        <>
          {/* Friends List */}
          <h2 className="text-xl mb-4">Your Friends</h2>
          <ul>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <li
                  key={friend._id}
                  className="border p-4 rounded-lg shadow-md flex justify-between"
                >
                  {friend.image && (
                    <img
                      src={`http://localhost:5555/${
                        friend.image || "uploads/default-profile.png"
                      }`}
                      alt="Friend"
                      className="rounded-full w-12 h-12 mr-4"
                    />
                  )}
                  <p>
                    {friend.name} ({friend.username})
                  </p>
                  <button className="bg-green-500 text-white py-1 px-4 rounded">
                    Chat
                  </button>
                </li>
              ))
            ) : (
              <p>You have no friends yet.</p>
            )}
          </ul>
        </>
      )}

      {tab === "requests" && (
        <>
          {/* Incoming Friend Requests */}
          <h2 className="text-xl mb-4">Incoming Friend Requests</h2>
          <ul>
            {friendRequests.length > 0 ? (
              friendRequests.map((request) => (
                <li
                  key={request._id}
                  className="border p-4 rounded-lg shadow-md flex justify-between"
                >
                  {request.image && (
                    <img
                      src={`http://localhost:5555/${
                        request.image || "uploads/default-profile.png"
                      }`}
                      alt="Request"
                      className="rounded-full w-12 h-12 mr-4"
                    />
                  )}
                  <p>
                    {request.name} ({request.username})
                  </p>
                  <div>
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
                  </div>
                </li>
              ))
            ) : (
              <p>No friend requests found.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default Friends;
