import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Header.css";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    orientation: "",
    diet: "",
    drinks: "",
    drugs: "",
    education: "",
    ethnicity: "",
    income: "",
    location: { name: "", coordinates: { latitude: null, longitude: null } },
    pets: "",
    smokes: "",
    speaks: "",
    image: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [canPostRoom, setCanPostRoom] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [roomData, setRoomData] = useState({
    rent: "",
    availableFrom: "",
    duration: "",
    type: "",
    layout: "",
    deposit: "",
    description: "",
    location: { name: "", coordinates: { latitude: null, longitude: null } },
    images: [],
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("You need to log in to access your profile.");
      return;
    }
    axios
      .get("http://localhost:5555/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setUserData(response.data.user))
      .catch(() =>
        setMessage("Error fetching user data. Please log in again.")
      );
  }, []);

  useEffect(() => {
    if (activeTab === "posts") {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      axios
        .get("http://localhost:5555/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserPosts(response.data.rooms);
        })
        .catch(() => setMessage("Error fetching room posts."));
    }
  }, [activeTab]);

  const handleUserImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    if (name === "location") {
      setRoomData({
        ...roomData,
        location: {
          ...roomData.location,
          name: value,
        },
      });
    } else {
      setRoomData({ ...roomData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomData((prev) => ({ ...prev, images: files }));
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    const newImages = roomData.images.filter((img) => img instanceof File);
    const existingImages = roomData.images.filter(
      (img) => typeof img === "string"
    );

    const imagesBase64 = await Promise.all(
      newImages.map(
        (image) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(image);
          })
      )
    );

    const payload = {
      rent: roomData.rent,
      availableFrom: roomData.availableFrom,
      duration: roomData.duration,
      type: roomData.type,
      layout: roomData.layout,
      deposit: roomData.deposit,
      description: roomData.description,
      location: roomData.location,
      images: [...existingImages, ...imagesBase64],
    };

    try {
      const apiUrl = isEditingRoom
        ? `http://localhost:5555/api/rooms/update/${editRoomId}`
        : "http://localhost:5555/api/rooms/add";

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(response.data);
      setMessage(response.data.message);

      setRoomData({
        rent: "",
        availableFrom: "",
        duration: "",
        type: "",
        layout: "",
        deposit: "",
        description: "",
        location: {
          name: "",
          coordinates: { latitude: null, longitude: null },
        },
        images: [],
      });
      setCanPostRoom(false);

      if (activeTab === "posts") {
        const { data } = await axios.get("http://localhost:5555/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserPosts(data.rooms);
      }
    } catch (error) {
      console.error(
        "Error posting room:",
        error.response?.data || error.message
      );
      setMessage("Error posting room.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("location[name]", userData.location.name);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const response = await axios.put(
        "http://localhost:5555/api/auth/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsEditing(false);
      setUserData(response.data.user);

      // Show the popup and hide it after 4 seconds
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 4000);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      setMessage(
        error.response?.data?.message || "Failed to update profile. Try again."
      );
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleEditRoom = (room) => {
    setRoomData({
      rent: room.rent,
      availableFrom: new Date(room.availableFrom).toISOString().substr(0, 10),
      duration: room.duration,
      type: room.type,
      layout: room.layout,
      deposit: room.deposit,
      description: room.description,
      location: room.location,
      images: room.images || [],
    });
    setIsEditingRoom(true);
    setEditRoomId(room._id);
    setCanPostRoom(true);
  };

  const handleDeleteRoom = (roomId) => {
    const token = sessionStorage.getItem("token");
    axios
      .delete(`http://localhost:5555/api/rooms/delete/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessage("Room deleted successfully.");
        setUserPosts(userPosts.filter((room) => room._id !== roomId));
      })
      .catch((error) => {
        console.error("Error deleting room:", error);
        setMessage("Error deleting room.");
      });
  };

  return (
    <div className="min-h-screen flex justify-center items-center header">
      <div className="w-full max-w-7xl bg-white p-10 rounded-lg shadow-md m-2">
        <div className="tabs mb-4">
          <button
            className={`p-2 ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </button>
          <button
            className={`p-2 ${
              activeTab === "posts"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            My Posts
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="flex flex-col justify-center items-center p-6 bg-gray-100 min-h-screen">
            <h3 className="text-3xl font-bold text-blue-700 mb-6">
              My Profile
            </h3>

            {message && <p className="text-red-500 text-center">{message}</p>}

            {!isEditing ? (
              <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl flex flex-col items-center">
                <img
                  src={
                    userData.image
                      ? `http://localhost:5555/${userData.image.replace(
                          /\\/g,
                          "/"
                        )}`
                      : "/default-profile.png"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <div className="text-center mb-6">
                  <p>
                    <strong>Name:</strong> {userData.name}
                  </p>
                  <p>
                    <strong>Username:</strong> {userData.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p>
                    <strong>Age:</strong> {userData.age}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full text-center md:max-w-md">
                  <div>
                    <p>
                      <strong>Gender:</strong> {userData.gender}
                    </p>
                    <p>
                      <strong>Orientation:</strong> {userData.orientation}
                    </p>
                    <p>
                      <strong>Diet:</strong> {userData.diet}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Location:</strong> {userData.location?.name}
                    </p>
                    <p>
                      <strong>Education:</strong> {userData.education}
                    </p>
                    <p>
                      <strong>Income:</strong> {userData.income}
                    </p>
                  </div>
                </div>

                <button
                  className=" text-white py-2 px-8 rounded-md mt-6 hover:bg-blue-700 transition"
                  onClick={toggleEdit}
                  style={{
                    background:
                      "linear-gradient(to right, rgba(13, 123, 240, 0), rgb(9, 60, 114))",
                  }}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl flex flex-col items-center"
              >
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Profile Image
                    </label>
                    <img
                      src={
                        userData.image
                          ? `http://localhost:5555/${userData.image.replace(
                              /\\/g,
                              "/"
                            )}`
                          : "/default-profile.png"
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mb-2"
                    />
                    <input
                      type="file"
                      onChange={handleUserImageChange}
                      accept="image/*"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={userData.username}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      readOnly
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={userData.age}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={userData.gender}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Orientation
                    </label>
                    <select
                      name="orientation"
                      value={userData.orientation}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                    >
                      <option value="straight">Straight</option>
                      <option value="bisexual">Bisexual</option>
                      <option value="gay">Gay</option>
                    </select>
                  </div>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Diet
                    </label>
                    <select
                      name="diet"
                      value={userData.diet}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="halal">Halal</option>
                      <option value="kosher">Kosher</option>
                      <option value="anything">Anything</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-gray-700 text-sm font-medium"
                    >
                      Location
                    </label>
                    <input
                      placeholder="Enter your location"
                      id="location"
                      name="location"
                      type="text"
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                      value={userData.location?.name || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          location: {
                            ...userData.location,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={userData.education}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Income
                    </label>
                    <input
                      type="text"
                      name="income"
                      value={userData.income}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Ethnicity
                    </label>
                    <select
                      name="ethnicity"
                      value={userData.ethnicity}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                      multiple
                    >
                      <option value="albanian">Albanian</option>
                      <option value="turk">Turk</option>
                      <option value="romani">Romani</option>
                      <option value="bosniaks">Bosniaks</option>
                      <option value="serbs">Serbs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Pets
                    </label>
                    <select
                      name="pets"
                      value={userData.pets}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                      multiple
                    >
                      <option value="cats">Cats</option>
                      <option value="dogs">Dogs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Do you smoke?
                    </label>
                    <select
                      name="smokes"
                      value={userData.smokes}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="sometimes">Sometimes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium">
                      Do you drink?
                    </label>
                    <select
                      name="drinks"
                      value={userData.drinks}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                    >
                      <option value="socially">Socially</option>
                      <option value="often">Often</option>
                      <option value="rarely">Rarely</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between w-full mt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white py-2 px-8 rounded-md hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            )}
            {showPopup && (
              <div
                className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
                  showPopup ? "opacity-100 visible z-50" : "opacity-0 invisible"
                }`}
              >
                <div className="bg-white text-black py-4 px-6 rounded-lg shadow-lg text-center">
                  <p className="text-lg font-semibold">
                    Profile Updated Successfully!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            <h3 className="text-3xl font-bold mb-4">My Room Posts</h3>

            {userPosts.length === 0 ? (
              <div>
                <p>No room posts yet.</p>
                <button
                  className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition"
                  onClick={() => setCanPostRoom(true)}
                >
                  Add a Room Post
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition mb-4"
                  onClick={() => {
                    setCanPostRoom(true);
                    setIsEditingRoom(false);
                    setRoomData({
                      rent: "",
                      availableFrom: "",
                      duration: "",
                      type: "",
                      layout: "",
                      deposit: "",
                      description: "",
                      location: {
                        name: "",
                        coordinates: { latitude: null, longitude: null },
                      },
                      images: [],
                    });
                  }}
                >
                  Add New Room
                </button>

                <div className="flex flex-wrap justify-center gap-10 px-6">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="relative w-[320px] bg-white border cursor-pointer rounded-2xl shadow-lg p-4 transition-all duration-500 hover:shadow-xl hover:translate-y-[-8px] group"
                    >
                      {/* Subtle Layer Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gray-100 z-[-1] group-hover:scale-105 group-hover:bg-gray-200 transition-all duration-500"></div>

                      {/* Room Image */}
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img
                          src={
                            post.images && post.images.length > 0
                              ? `http://localhost:5555/${post.images[0].replace(
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
                          ${post.rent} / mo
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Available:</strong>{" "}
                          {new Date(post.availableFrom).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Type:</strong> {post.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Layout:</strong> {post.layout}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Deposit:</strong> ${post.deposit}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {post.location?.name}
                        </p>
                      </div>

                      {/* Edit and Delete buttons */}
                      <div className="flex justify-between mt-4">
                        <button
                          className=" text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition"
                          onClick={() => handleEditRoom(post)}
                          style={{
                            background:
                              "linear-gradient(to right, rgba(13, 123, 240, 0),orange)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className=" text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                          onClick={() => handleDeleteRoom(post._id)}
                          style={{
                            background:
                              "linear-gradient(to right, rgba(13, 123, 240, 0), red)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Post Form */}
            {canPostRoom && (
              <form
                onSubmit={handleRoomSubmit}
                className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mx-auto"
              >
                <h4 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                  {isEditingRoom ? "Edit Room Listing" : "Add Room Listing"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rent */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Rent
                    </label>
                    <input
                      type="number"
                      name="rent"
                      value={roomData.rent}
                      onChange={handleRoomChange}
                      required
                      className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter rent amount"
                    />
                  </div>

                  {/* Available From */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Available From
                    </label>
                    <input
                      type="date"
                      name="availableFrom"
                      value={roomData.availableFrom}
                      onChange={handleRoomChange}
                      required
                      className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={roomData.duration}
                      onChange={handleRoomChange}
                      required
                      className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter duration"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={roomData.type}
                      onChange={handleRoomChange}
                      required
                      className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter room type"
                    />
                  </div>

                  {/* Layout */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Layout
                    </label>
                    <input
                      type="text"
                      name="layout"
                      value={roomData.layout}
                      onChange={handleRoomChange}
                      required
                      className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter room layout"
                    />
                  </div>

                  {/* Deposit */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Deposit
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={roomData.deposit}
                      onChange={handleRoomChange}
                      required
                      className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter deposit amount"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={roomData.description}
                    onChange={handleRoomChange}
                    required
                    className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter room description"
                    rows="4"
                  ></textarea>
                </div>

                {/* Location */}
                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={roomData.location?.name}
                    onChange={handleRoomChange}
                    required
                    className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter location name"
                  />
                </div>

                {/* Images */}
                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Images
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="border border-gray-300 rounded-lg w-full p-3 focus:ring focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-6">
                  <button
                    type="submit"
                    className=" text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(13, 123, 240, 0), blue)",
                    }}
                  >
                    {isEditingRoom ? "Save Changes" : "Submit Room"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
