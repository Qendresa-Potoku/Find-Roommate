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

      setMessage("Profile updated successfully.");
      setIsEditing(false);
      setUserData(response.data.user);
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
          <div>
            <h3 className="text-3xl font-bold text-center text-blue-700 mb-6">
              My Profile
            </h3>

            {message && <p className="text-red-500 text-center">{message}</p>}

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
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
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />

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
                    <strong>Location:</strong> {userData.location?.name}
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
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="mb-4">
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
                      required
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
                      <option value="albanian">Albanian</option>
                      <option value="turk">Turk</option>
                      <option value="romani">Romani</option>
                      <option value="bosniaks">Bosniaks</option>
                      <option value="serbs">Serbs</option>
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
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition"
                  >
                    Save Profile
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map((post) => (
                    <div
                      key={post._id}
                      className="card p-4 bg-gray-100 rounded shadow"
                    >
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
                        <strong>Location:</strong> {post.location?.name}
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
                    value={roomData.location?.name}
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
