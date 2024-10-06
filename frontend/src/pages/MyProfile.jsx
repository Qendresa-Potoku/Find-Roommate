import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Header.css"; // Keeping your existing styles

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
    location: "",
    pets: "",
    smokes: "",
    speaks: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [canPostRoom, setCanPostRoom] = useState(false); // Switch for room post form
  const [userPosts, setUserPosts] = useState([]); // User's room posts
  const [activeTab, setActiveTab] = useState("profile"); // Tab state
  const [isEditingRoom, setIsEditingRoom] = useState(false); // State for editing rooms
  const [editRoomId, setEditRoomId] = useState(null); // Store the room ID to edit
  const [roomData, setRoomData] = useState({
    rent: "",
    availableFrom: "",
    duration: "",
    type: "",
    layout: "",
    deposit: "",
    description: "",
    location: "",
    images: [],
  });

  // Fetch user profile on load
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

  // Fetch user's room posts when switching to "My Posts"
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

  // Handle input changes for room post form
  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomData({ ...roomData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileUrls = files.map((file) => URL.createObjectURL(file));
    setRoomData({ ...roomData, images: fileUrls });
  };

  // Submit room post
  const handleRoomSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    // Check if we are editing or adding a new room
    const apiUrl = isEditingRoom
      ? `http://localhost:5555/api/rooms/update/${editRoomId}` // Correct URL for updating
      : "http://localhost:5555/api/rooms/add"; // URL for adding

    axios
      .post(apiUrl, roomData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMessage(response.data.message);
        setCanPostRoom(false);
        setRoomData({
          rent: "",
          availableFrom: "",
          duration: "",
          type: "",
          layout: "",
          deposit: "",
          description: "",
          location: "",
          images: [],
        });
        setIsEditingRoom(false); // Exit edit mode after submitting

        if (isEditingRoom) {
          // If editing, update the post in the userPosts array
          setUserPosts((prev) =>
            prev.map((room) =>
              room._id === editRoomId ? response.data.room : room
            )
          );
        } else {
          // If adding, append the new post
          setUserPosts((prev) => [...prev, response.data.room]);
        }
      })
      .catch(() => setMessage("Error posting room."));
  };

  // Handle profile edits (unchanged)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    axios
      .put("http://localhost:5555/api/auth/update", userData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMessage("Profile updated successfully.");
        setIsEditing(false);
      })
      .catch(() => setMessage("Error updating profile."));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  // Edit an existing room
  const handleEditRoom = (room) => {
    setRoomData({
      rent: room.rent,
      availableFrom: new Date(room.availableFrom).toISOString().substr(0, 10), // Format date for input
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
    setCanPostRoom(true); // Show the form for editing
  };

  // Delete a room post
  const handleDeleteRoom = (roomId) => {
    console.log("Deleting room with ID:", roomId); // Log roomId
    const token = sessionStorage.getItem("token");
    axios
      .delete(`http://localhost:5555/api/rooms/delete/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessage("Room deleted successfully.");
        setUserPosts(userPosts.filter((room) => room._id !== roomId)); // Remove room from list
      })
      .catch((error) => {
        console.error("Error deleting room:", error); // Log the error
        setMessage("Error deleting room.");
      });
  };

  return (
    <div className="min-h-screen flex justify-center items-center header">
      <div className="w-full max-w-7xl bg-white p-10 rounded-lg shadow-md m-2">
        {/* Tab Navigation */}
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

        {/* My Profile Section */}
        {activeTab === "profile" && (
          <div>
            <h3 className="text-3xl font-bold text-center text-blue-700 mb-6">
              My Profile
            </h3>

            {message && <p className="text-red-500 text-center">{message}</p>}

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
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
                    <strong>Location:</strong> {userData.location}
                  </p>
                  <p>
                    <strong>Education:</strong> {userData.education}
                  </p>
                  <p>
                    <strong>Income:</strong> {userData.income}
                  </p>
                </div>
                <div className="flex justify-center mt-6 col-span-3">
                  <button
                    className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition"
                    onClick={toggleEdit}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              // Edit form similar to Register design
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div>
                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                <div>
                  <div className="mb-4">
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

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium">
                      Location
                    </label>
                    <select
                      name="location"
                      value={userData.location}
                      onChange={handleChange}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                    >
                      <option value="california">California</option>
                      <option value="new york">New York</option>
                      <option value="colorado">Colorado</option>
                      <option value="oregon">Oregon</option>
                    </select>
                  </div>

                  <div className="mb-4">
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

                  <div className="mb-4">
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
                </div>

                <div>
                  <div className="mb-4">
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
                      <option value="asian">Asian</option>
                      <option value="white">White</option>
                      <option value="black">Black</option>
                      <option value="hispanic">Hispanic/Latin</option>
                      <option value="indian">Indian</option>
                    </select>
                  </div>

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                <div className="flex justify-between col-span-3">
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
                    Save Changes
                  </button>
                </div>
              </form>
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
                    setIsEditingRoom(false); // Ensure we're not in edit mode
                    setRoomData({
                      rent: "",
                      availableFrom: "",
                      duration: "",
                      type: "",
                      layout: "",
                      deposit: "",
                      description: "",
                      location: "",
                      images: [],
                    }); // Clear the form
                  }}
                >
                  Add New Room
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="card p-4 bg-gray-100 rounded shadow"
                    >
                      <img
                        src={post.images[0]}
                        alt="Room"
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                      <h4 className="font-bold text-lg">${post.rent} / mo</h4>
                      <p>
                        <strong>Available:</strong>{" "}
                        {new Date(post.availableFrom).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Type:</strong> {post.type}
                      </p>
                      <p>
                        <strong>Layout:</strong> {post.layout}
                      </p>
                      <p>
                        <strong>Deposit:</strong> ${post.deposit}
                      </p>
                      <p>
                        <strong>Location:</strong> {post.location}
                      </p>

                      {/* Edit and Delete buttons */}
                      <div className="flex justify-between mt-4">
                        <button
                          className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition"
                          onClick={() => handleEditRoom(post)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                          onClick={() => handleDeleteRoom(post._id)}
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
              <form onSubmit={handleRoomSubmit} className="mt-6">
                <h4 className="text-xl mb-4">
                  {isEditingRoom ? "Edit Room Listing" : "Add Room Listing"}
                </h4>
                <div>
                  <label>Rent</label>
                  <input
                    type="number"
                    name="rent"
                    value={roomData.rent}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Available From</label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={roomData.availableFrom}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={roomData.duration}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Type</label>
                  <input
                    type="text"
                    name="type"
                    value={roomData.type}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Layout</label>
                  <input
                    type="text"
                    name="layout"
                    value={roomData.layout}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Deposit</label>
                  <input
                    type="number"
                    name="deposit"
                    value={roomData.deposit}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={roomData.description}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={roomData.location}
                    onChange={handleRoomChange}
                    required
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Images</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="border p-2 w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-8 rounded mt-4"
                >
                  {isEditingRoom ? "Save Changes" : "Submit Room"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
