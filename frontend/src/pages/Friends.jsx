import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../services/AuthServices";

const Friends = () => {
  const [tab, setTab] = useState("friends"); // Track active tab
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]); // For requests sent by the user
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
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5555/api/auth/friends/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Split friends into accepted and pending requests
      const acceptedFriends = response.data.filter(
        (friend) => friend.status === "accepted"
      );
      const pendingFriends = response.data.filter(
        (friend) => friend.status === "pending"
      );

      setFriends(acceptedFriends);
      setPendingRequests(pendingFriends);
    } catch (error) {
      setMessage("Error fetching friends.");
    }
  };

  const acceptFriendRequest = async (senderId) => {
    try {
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
            {friends.map((friend) => (
              <li
                key={friend._id}
                className="border p-4 rounded-lg shadow-md flex justify-between"
              >
                <p>{friend.name}</p>
                <button className="bg-green-500 text-white py-1 px-4 rounded">
                  Chat
                </button>
              </li>
            ))}
          </ul>

          {/* Pending Requests */}
          <h2 className="text-xl mt-4 mb-4">Pending Requests</h2>
          <ul>
            {pendingRequests.map((request) => (
              <li
                key={request._id}
                className="border p-4 rounded-lg shadow-md flex justify-between"
              >
                <p>{request.name} (Pending)</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "requests" && (
        <>
          {/* Incoming Friend Requests */}
          <h2 className="text-xl mb-4">Incoming Friend Requests</h2>
          <ul>
            {friendRequests.map((request) => (
              <li
                key={request._id}
                className="border p-4 rounded-lg shadow-md flex justify-between"
              >
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
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Friends;
