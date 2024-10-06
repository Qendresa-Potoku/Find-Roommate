import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/AuthServices";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]); // State for rooms
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("renters"); // View toggle
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
      setFriends(response.data.map((friend) => friend._id));
    } catch (error) {
      setMessage("Error fetching friends.");
    }
  };

  // Fetch rooms not posted by the logged-in user
  const fetchOtherRooms = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:5555/api/rooms/other-rooms",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setMessage("Error fetching rooms.");
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

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === "rooms") {
      fetchOtherRooms(); // Fetch rooms when "Rooms" button is clicked
    }
  };

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="flex items-center justify-center">
        <input
          type="text"
          placeholder="Where are you looking?"
          className="p-2 border border-gray-300 rounded-l-lg"
        />
        <button
          className={`p-2 border-t border-b border-gray-300 ${
            activeView === "renters" ? "bg-gray-300" : "bg-white"
          }`}
          onClick={() => handleViewChange("renters")}
        >
          Renters
        </button>
        <button
          className={`p-2 border rounded-r-lg border-gray-300 ${
            activeView === "rooms" ? "bg-gray-300" : "bg-white"
          }`}
          onClick={() => handleViewChange("rooms")}
        >
          Rooms
        </button>
      </div>

      {message && <p>{message}</p>}

      {/* Conditionally render Renters or Rooms */}
      {activeView === "renters" ? (
        <div>
          <h2 className="text-xl mt-4">Renters:</h2>
          <div className="grid grid-cols-3 gap-4">
            {users.map((userItem) => (
              <div
                key={userItem._id}
                className="border p-4 rounded-lg shadow-md flex flex-col items-center"
              >
                <p className="font-bold">{userItem.name}</p>
                <p>{userItem.email}</p>
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
      ) : (
        <div>
          <h2 className="text-xl mt-4">Rooms:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="border p-4 rounded-lg shadow-md bg-white"
              >
                <img
                  src={room.images[0] || "/default-room.png"} // Placeholder if no image available
                  alt="Room"
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <div className="mb-4">
                  <p className="text-xl font-bold">${room.rent} / mo</p>
                  <p>
                    <strong>Available:</strong>{" "}
                    {new Date(room.availableFrom).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Type:</strong> {room.type}
                  </p>
                  <p>
                    <strong>Layout:</strong> {room.layout}
                  </p>
                  <p>
                    <strong>Deposit:</strong> ${room.deposit}
                  </p>
                  <p>
                    <strong>Location:</strong> {room.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
