import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/AuthServices";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("renters");
  const [searchQuery, setSearchQuery] = useState("");
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

      const response = await axios.get(
        "http://localhost:5555/api/auth/matches/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const filteredUsers = response.data.filter(
        (userItem) => userItem._id !== user.id
      );

      setUsers(filteredUsers);
    } catch (error) {
      setMessage("Error fetching matched users.");
      console.error("Error fetching matched users:", error);
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

  const fetchOtherRooms = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:5555/api/rooms/matches/rooms",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRooms(response.data);
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
      fetchOtherRooms();
    }
  };

  const filteredUsers = users.filter((userItem) =>
    userItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter((room) => {
    const locationName =
      typeof room.location === "string"
        ? room.location
        : room.location?.name || "";
    return locationName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="flex items-center justify-center my-4">
        <div className="flex items-center border border-gray-300 rounded-full bg-gray-100 px-4 py-2">
          <input
            type="text"
            placeholder="Where are you looking?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow outline-none bg-transparent text-gray-600"
          />
          <button
            className={`flex items-center ml-2 px-4 py-2 rounded-full ${
              activeView === "renters" ? "bg-gray-300" : "bg-white"
            }`}
            onClick={() => handleViewChange("renters")}
          >
            <span className="mr-2">Renters</span>
            <i className="fas fa-user"></i>
          </button>
          <button
            className={`flex items-center ml-2 px-4 py-2 rounded-full ${
              activeView === "rooms" ? "bg-gray-300" : "bg-white"
            }`}
            onClick={() => handleViewChange("rooms")}
          >
            <span className="mr-2">Rooms</span>
            <i className="fas fa-home"></i>
          </button>
        </div>
      </div>

      {message && <p>{message}</p>}

      {/* Conditionally render Renters or Rooms */}
      {activeView === "renters" ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredUsers.map((userItem) => (
              <div
                key={userItem._id}
                className="border p-4 rounded-lg shadow-md flex items-center w-[300px] h-[120px]"
              >
                <div className="flex-shrink-0">
                  {userItem.image ? (
                    <img
                      src={`http://localhost:5555/${userItem.image}`}
                      alt="User"
                      className="rounded-full w-16 h-16 object-cover mr-4"
                    />
                  ) : (
                    <div className="rounded-full w-16 h-16 bg-gray-200 mr-4"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{userItem.name}</p>
                  <p className="text-gray-600 text-sm">{userItem.email}</p>
                  {!friends.includes(userItem._id) && (
                    <button
                      onClick={() => sendFriendRequest(userItem._id)}
                      className="mt-2 bg-blue-500 text-white py-1 px-4 rounded text-sm"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="border rounded-lg shadow-md bg-white"
              >
                <img
                  src={
                    room.images && room.images.length > 0
                      ? `http://localhost:5555/${room.images[0].replace(
                          /\\/g,
                          "/"
                        )}`
                      : "/default-room.png"
                  }
                  alt="Room"
                  className="w-full h-40 object-cover "
                />
                <div className="p-4">
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
                    <strong>Location:</strong> {room.location?.name}
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
