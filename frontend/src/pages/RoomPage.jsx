import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RoomPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const roomResponse = await axios.get(
          `http://localhost:5555/api/rooms/${roomId}`
        );
        setRoom(roomResponse.data);

        const userId = roomResponse.data.userId._id;

        // Fetch friends list
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const friendsResponse = await axios.get(
          "http://localhost:5555/api/auth/friends/list",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const friendsList = friendsResponse.data.map((friend) => friend._id);
        setFriends(friendsList);

        // Check if the userId is in the friends list
        setIsFriend(friendsList.includes(userId));
      } catch (error) {
        console.error("Error fetching room details or friends list:", error);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  const sendFriendRequest = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const recipientId = room.userId._id;

      await axios.post(
        "http://localhost:5555/api/auth/send-friend-request",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Error sending friend request.");
    }
  };

  if (!room) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {/* Top Images */}
      <div className="flex gap-2">
        <div className="w-2/3">
          <img
            src={`http://localhost:5555/${room.images[0]}`}
            alt="Main Room"
            className="w-full h-96 object-cover rounded-md"
          />
        </div>
        <div className="w-1/3 flex flex-col gap-1">
          {room.images.slice(1).map((img, index) => (
            <img
              key={index}
              src={`http://localhost:5555/${img}`}
              alt="Room"
              className="w-full h-48 object-cover rounded-md"
            />
          ))}
        </div>
      </div>

      {/* Room Info */}
      <div className="mt-6 flex flex-wrap lg:flex-nowrap gap-6">
        {/* User Info (Posted By) Section */}
        <div
          className="w-full lg:w-1/4 bg-white p-3 rounded-lg shadow-md cursor-pointer"
          style={{ height: "100px" }}
          onClick={() => navigate(`/profile/${room.userId._id}`)}
        >
          <div className="flex items-center">
            {/* User Image */}
            <div className="flex-shrink-0">
              {room.userId.image ? (
                <img
                  src={`http://localhost:5555/${
                    room.userId.image || "uploads/default-profile.png"
                  }`}
                  alt="User"
                  className="rounded-full w-16 h-16 object-cover mr-4"
                />
              ) : (
                <div className="rounded-full w-16 h-16 bg-gray-200 mr-4"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
              <p className="font-bold text-lg">{room.userId.name}</p>
              {isFriend ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent onClick from firing
                    navigate(`/chats/${room.userId._id}`);
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
                    e.stopPropagation(); // Prevent parent onClick from firing
                    sendFriendRequest();
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
        </div>

        {/* Room Details Section */}
        <div className="w-full lg:w-3/4 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6">
            {room.type} in {room.location.name}
          </h2>

          {/* Room Details Tags */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
              Rent: €{room.rent} / mo
            </button>
            <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
              Available: {new Date(room.availableFrom).toLocaleDateString()}
            </button>
            <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
              Type: {room.type}
            </button>
            <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
              Layout: {room.layout}
            </button>
            <button className="py-2 px-4 border border-gray-300 rounded-full text-gray-600">
              Deposit: €{room.deposit}
            </button>
          </div>

          {/* Description Section */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{room.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
