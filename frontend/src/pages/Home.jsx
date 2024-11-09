import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("renters");
  const [searchQuery, setSearchQuery] = useState("");
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      fetchUsers();
      if (activeView === "rooms") {
        fetchRooms();
      }
    }
  }, [user, activeView, navigate]);
  // useEffect(() => {
  //   fetchUsers();
  //   if (activeView === "rooms") {
  //     fetchRooms();
  //   }
  // }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5555/api/auth/public-users"
      );
      setUsers(response.data);
    } catch (error) {
      setMessage("Error fetching users.");
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5555/api/rooms/public-rooms"
      );
      setRooms(response.data.rooms);
    } catch (error) {
      setMessage("Error fetching rooms.");
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === "rooms") {
      fetchRooms();
    }
  };

  const filteredUsers = users.filter((userItem) =>
    userItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
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
                className="border p-4 rounded-lg shadow-md flex items-center w-[300px] h-[120px] relative"
              >
                <div className="flex-shrink-0 relative">
                  <img
                    src={`http://localhost:5555/${userItem.image}`}
                    alt="User"
                    className={`rounded-full w-16 h-16 object-cover mr-4 ${
                      user ? "" : "blur-sm"
                    }`}
                  />
                  {!user && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <span className="text-white text-xs text-center">
                        Login/Register to see more
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{userItem.name}</p>
                  <p className="text-gray-600 text-sm">{userItem.email}</p>
                  {user && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="border p-4 rounded-lg shadow-md bg-white relative"
              >
                <div className="relative">
                  <img
                    src={room.images[0] || "/default-room.png"}
                    alt="Room"
                    className={`w-40 h-40 object-cover rounded-md mb-4 ${
                      user ? "" : "blur-sm"
                    }`}
                  />
                  {!user && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                      <span className="text-white text-xs text-center">
                        Login/Register to see more
                      </span>
                    </div>
                  )}
                </div>
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

export default Home;
