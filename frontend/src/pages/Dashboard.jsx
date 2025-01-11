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
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 16;
  const [currentRoomPage, setCurrentRoomPage] = useState(1);
  const itemsPerPage = 12;
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [sentRequests, setSentRequests] = useState([]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users
    .filter((userItem) =>
      userItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastRoom = currentRoomPage * itemsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - itemsPerPage;
  const currentRooms = rooms
    .filter((room) => {
      const locationName =
        typeof room.location === "string"
          ? room.location
          : room.location?.name || "";
      return locationName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .slice(indexOfFirstRoom, indexOfLastRoom);

  const totalRoomPages = Math.ceil(rooms.length / itemsPerPage);

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

      const filteredUsers = response.data
        .filter((userItem) => userItem._id !== user.id)
        .map((userItem) => ({
          _id: userItem._id,
          name: userItem.name,
          email: userItem.email,
          image: userItem.image || userItem.profilePic || null,
        }));

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
      console.error("Error fetching rooms:", error.response || error);
      setMessage(
        error.response?.data?.message || "Error fetching rooms from server."
      );
    }
  };

  const sendFriendRequest = async (recipientId) => {
    if (sentRequests.includes(recipientId)) {
      setPopupMessage("You already sent a Friend Request!");
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 3000);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5555/api/auth/send-friend-request",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSentRequests((prevRequests) => [...prevRequests, recipientId]);

      setPopupMessage("Friend Request sent successfully!");
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error sending Friend Request.";
      setPopupMessage(errorMessage);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 3000);
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
          <div
            className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
              popupVisible ? "opacity-100 visible z-50" : "opacity-0 invisible"
            }`}
          >
            <div className="bg-white text-black py-4 px-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold">{popupMessage}</p>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentUsers.map((userItem) => (
              <div
                key={userItem._id}
                className="relative border p-4 rounded-2xl shadow-md flex items-center w-[300px] h-[120px] cursor-pointer transition-all duration-[480ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform hover:translate-y-[-8px] group"
                onClick={() => navigate(`/profile/${userItem._id}`)}
              >
                {/* Subtle Layer Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gray-100 z-[-1] group-hover:scale-105 group-hover:bg-gray-200 transition-all duration-500"></div>

                {/* User Image */}
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

                {/* User Info */}
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{userItem.name}</p>
                  {friends.includes(userItem._id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chats/${userItem._id}`);
                      }}
                      className="mt-2 py-1 px-4 rounded-lg text-sm font-semibold transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0, 128, 0, 0), green)",
                      }}
                    >
                      Chat
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFriendRequest(userItem._id);
                      }}
                      className="mt-2 py-1 px-4 rounded-lg text-sm font-semibold transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(13, 123, 240, 0), rgb(9, 60, 114))",
                      }}
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-4 py-2 mx-1 rounded text-sm font-semibold transition-all duration-300 ${
                  page === currentPage ? "text-white" : "text-gray-700"
                }`}
                style={{
                  background:
                    page === currentPage
                      ? "linear-gradient(to right, rgba(13, 123, 240, 0), rgb(9, 60, 114))"
                      : "rgba(240, 240, 240, 1)",
                  color: page === currentPage ? "white" : "black",
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap justify-center gap-10 px-6">
            {currentRooms.map((room) => (
              <div
                key={room._id}
                className="relative w-[320px] bg-white border cursor-pointer rounded-2xl shadow-lg p-4 transition-all duration-500 hover:shadow-xl hover:translate-y-[-8px] group"
                onClick={() => navigate(`/room/${room._id}`)}
              >
                {/* Subtle Layer Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gray-100 z-[-1] group-hover:scale-105 group-hover:bg-gray-200 transition-all duration-500"></div>

                {/* Room Image */}
                <div className="rounded-lg overflow-hidden mb-4">
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
                    className="w-full h-40 object-cover"
                  />
                </div>

                {/* Room Info */}
                <div className="space-y-2">
                  <p className="font-bold text-xl text-gray-800">
                    ${room.rent} / mo
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Available:</strong>{" "}
                    {new Date(room.availableFrom).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Type:</strong> {room.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Layout:</strong> {room.layout}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Deposit:</strong> ${room.deposit}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {room.location?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center mt-4">
            {Array.from({ length: totalRoomPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  className={`px-4 py-2 mx-1 rounded text-sm font-semibold transition-all duration-300 ${
                    page === currentRoomPage ? "text-white" : "text-gray-700"
                  }`}
                  style={{
                    background:
                      page === currentRoomPage
                        ? "linear-gradient(to right, rgba(13, 123, 240, 0), rgb(9, 60, 114))"
                        : "rgba(240, 240, 240, 1)",
                    color: page === currentRoomPage ? "white" : "black",
                  }}
                  onClick={() => setCurrentRoomPage(page)}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
