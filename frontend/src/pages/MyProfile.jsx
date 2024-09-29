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
    location: "",
    pets: "",
    smokes: "",
    speaks: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

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
      .then((response) => {
        setUserData(response.data.user);
      })
      .catch((error) => {
        setMessage("Error fetching user data. Please log in again.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You need to log in to update your profile.");
      return;
    }

    axios
      .put("http://localhost:5555/api/auth/update", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMessage("Profile updated successfully.");
        setIsEditing(false);
      })
      .catch((error) => {
        setMessage("Error updating profile. Please try again.");
      });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center header">
      <div className="w-full max-w-7xl bg-white p-10 rounded-lg shadow-md m-2">
        <h3 className="text-3xl font-bold text-center text-blue-700 mb-6">
          My Profile
        </h3>

        {message && <p className="text-red-500 text-center">{message}</p>}

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Display user profile fields */}
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
    </div>
  );
};

export default MyProfile;
