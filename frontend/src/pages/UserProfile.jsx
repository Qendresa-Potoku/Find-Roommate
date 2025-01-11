import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:5555/api/auth/user/${id}`
        );
        setUserData(userResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Error fetching user details.");
      }
    };

    const fetchUserRooms = async () => {
      try {
        const roomResponse = await axios.get(
          `http://localhost:5555/api/rooms/user/${id}`
        );
        setRooms(
          roomResponse.data.rooms.map((room) => ({
            ...room,
            currentPhotoIndex: 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching user rooms:", error);
        setMessage("Error fetching user's rooms.");
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
        console.error("Error fetching friends list:", error);
        setMessage("Error fetching friends list.");
      }
    };

    fetchUserData();
    fetchUserRooms();
    fetchFriends();
  }, [id]);

  const sendFriendRequest = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5555/api/auth/send-friend-request",
        { recipientId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error("Error sending friend request:", error);
      setMessage("Error sending friend request.");
    }
  };

  const handleNextPhoto = (roomId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room._id === roomId
          ? {
              ...room,
              currentPhotoIndex:
                (room.currentPhotoIndex + 1) % room.images.length,
            }
          : room
      )
    );
  };

  const handlePreviousPhoto = (roomId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room._id === roomId
          ? {
              ...room,
              currentPhotoIndex:
                (room.currentPhotoIndex - 1 + room.images.length) %
                room.images.length,
            }
          : room
      )
    );
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col justify-center  lg:flex-row p-6 gap-8 bg-gray-100 min-h-screen">
      {/* Left Section: User Details */}
      <div className="w-full lg:w-1/3 bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between">
        <div>
          <div className="text-center">
            <img
              src={`http://localhost:5555/${
                userData.image || "uploads/default-profile.png"
              }`}
              alt={userData.name}
              className="rounded-full w-32 h-32 object-cover mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold">{`Hi, I'm ${userData.name}`}</h1>
            <p className="text-green-500 font-medium mt-2">ACTIVE TODAY</p>
            <p className="text-gray-500 mt-4">
              {userData.age || "N/A"} •
              {` ${capitalizeFirstLetter(userData.gender)}` || "N/A"}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">INTRODUCTION</h2>

            <div className="mt-6 flex flex-wrap gap-4">
              {userData.pets && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`PETS: ${capitalizeFirstLetter(userData.pets)}`}
                </button>
              )}
              {userData.smokes && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`SMOKES: ${capitalizeFirstLetter(userData.smokes)}`}
                </button>
              )}
              {userData.speaks && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`SPEAKS: ${capitalizeFirstLetter(userData.speaks)}`}
                </button>
              )}
              {userData.diet && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`DIET: ${capitalizeFirstLetter(userData.diet)}`}
                </button>
              )}
              {userData.drinks && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`DRINKS: ${capitalizeFirstLetter(userData.drinks)}`}
                </button>
              )}
              {userData.drugs && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`DRUGS: ${capitalizeFirstLetter(userData.drugs)}`}
                </button>
              )}
              {userData.education && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`EDUCATION: ${capitalizeFirstLetter(userData.education)}`}
                </button>
              )}
              {userData.ethnicity && (
                <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
                  {`ETHNICITY: ${capitalizeFirstLetter(userData.ethnicity)}`}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          {friends.includes(id) ? (
            <button
              className="w-full  text-white py-3 rounded-lg font-semibold"
              onClick={() => navigate(`/chats/${id}`)}
              style={{
                background:
                  "linear-gradient(to right, rgba(0, 128, 0, 0), green)",
              }}
            >
              Chat
            </button>
          ) : (
            <button
              className="w-full  text-white py-3 rounded-lg font-semibold"
              onClick={sendFriendRequest}
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

      {/* Right Section: User's Rooms */}
      <div className="w-full lg:w-1/3 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">My Active Listing</h2>
        {rooms.length > 0 ? (
          <div className="grid gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="border rounded-lg shadow-md p-4 flex flex-col items-center bg-white cursor-pointer"
                onClick={() => navigate(`/room/${room._id}`)}
              >
                {/* Room Header */}
                <div className="flex items-center w-full mb-4">
                  <img
                    src={`http://localhost:5555/${
                      userData.image || "uploads/default-profile.png"
                    }`}
                    alt={userData.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="text-gray-800 font-semibold">
                      {userData.name}
                    </p>
                  </div>
                </div>

                {/* Room Image with Navigation */}
                <div className="relative w-full rounded-md overflow-hidden mb-4">
                  <img
                    src={`http://localhost:5555/${
                      room.images[room.currentPhotoIndex] ||
                      "uploads/default-room.png"
                    }`}
                    alt="Room"
                    className="w-full h-64 object-cover rounded-md"
                  />
                  {room.images && room.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent onClick from triggering
                          handlePreviousPhoto(room._id);
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent onClick from triggering
                          handleNextPhoto(room._id);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        &gt;
                      </button>
                    </>
                  )}
                </div>

                {/* Room Details */}
                <div className="text-center w-full">
                  <p className="text-lg font-bold text-gray-800">
                    ${room.rent} / mo
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {room.type || "N/A"} • {room.layout || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    <strong>Available From:</strong>{" "}
                    {new Date(room.availableFrom).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    <strong>Location:</strong> {room.location.name || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No active listings by this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
