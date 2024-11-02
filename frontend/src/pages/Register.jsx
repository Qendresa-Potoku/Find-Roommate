import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/AuthServices";
import axios from "axios";
import "../styles/Header.css";

const registerUrl = "http://localhost:5555/api/auth/register";

const Register = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const submitHandler = (event) => {
    event.preventDefault();

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      username.trim() === "" ||
      password.trim() === ""
    ) {
      setMessage("All fields required");
      return;
    }

    const requestBody = {
      name,
      email,
      username,
      password,
    };

    for (let ele of event.target.elements) {
      if (ele.name !== "") {
        requestBody[ele.name] = ele.value;
      }
    }
    if (image) {
      formData.append("image", image);
    }

    axios
      .post(registerUrl, requestBody)
      .then((response) => {
        setMessage("Registration successful");
        navigate("/login");
      })
      .catch((error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setMessage(error.response.data.message);
        } else {
          setMessage("Backend server error");
        }
      });
  };

  return (
    <div className="min-h-screen flex justify-center items-center header">
      <div className="w-full max-w-7xl bg-white p-10 rounded-lg shadow-md m-2">
        <h3 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Register
        </h3>

        <form onSubmit={submitHandler}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <input type="file" onChange={handleImageChange} accept="image/*" />
            <div>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Name
                </label>
                <input
                  placeholder="Enter your name"
                  id="name"
                  type="text"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Email
                </label>
                <input
                  placeholder="Enter your email"
                  id="email"
                  type="email"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Username
                </label>
                <input
                  placeholder="Enter your username"
                  id="username"
                  type="text"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Password
                </label>
                <input
                  placeholder="Enter your password"
                  id="password"
                  type="password"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="age"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Age
                </label>
                <input
                  placeholder="Enter your age"
                  name="age"
                  id="age"
                  type="number"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium">
                  Gender
                </label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      className="text-blue-600 focus:ring-blue-500"
                      id="sexmale"
                      value="male"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      className="text-blue-600 focus:ring-blue-500"
                      id="sexfemale"
                      value="female"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="orientation"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Orientation
                </label>
                <select
                  name="orientation"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="orientation"
                  required
                >
                  <option>Select your sexual orientation</option>
                  <option value="straight">Straight</option>
                  <option value="bisexual">Bisexual</option>
                  <option value="gay">Gay</option>
                </select>
              </div>
            </div>
            {/* Column 2 */}
            <div>
              <div className="mb-4">
                <label
                  htmlFor="diet"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Diet
                </label>
                <select
                  name="diet"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="diet"
                  required
                >
                  <option>Select your diet type</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="anything">Anything</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="education"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Education
                </label>
                <input
                  placeholder="Enter your education details"
                  name="education"
                  id="education"
                  type="text"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="income"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Income
                </label>
                <input
                  placeholder="Enter your approximate income"
                  name="income"
                  id="income"
                  type="text"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="ethnicity"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Ethnicity
                </label>
                <select
                  name="ethnicity"
                  multiple
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="ethnicity"
                >
                  <option>Select your ethnicity</option>
                  <option value="asian">Asian</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="hispanic/latin">Hispanic/Latino</option>
                  <option value="indian">Indian</option>
                  <option value="pacificislander">Pacific Islander</option>
                  <option value="middleeastern">Middle Eastern</option>
                  <option value="nativeamerican">Native American</option>
                </select>
              </div>

              <div className="mb-4 mt-7">
                <label
                  htmlFor="pets"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Pets
                </label>
                <select
                  name="pets"
                  multiple
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="pets"
                >
                  <option>Do you own any pets?</option>
                  <option value="cats">Cats</option>
                  <option value="dogs">Dogs</option>
                </select>
              </div>
            </div>

            {/* Column 3 */}
            <div>
              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Location
                </label>
                <select
                  name="location"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="location"
                  required
                >
                  <option>Select Location</option>
                  <option value="california">California</option>
                  <option value="colorado">Colorado</option>
                  <option value="new york">New York</option>
                  <option value="oregon">Oregon</option>
                  <option value="arizona">Arizona</option>
                  <option value="hawaii">Hawaii</option>
                  <option value="montana">Montana</option>
                  <option value="spain">Spain</option>
                  <option value="nevada">Nevada</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="speaks"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Languages you speak
                </label>
                <select
                  name="speaks"
                  multiple
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="speaks"
                >
                  <option>Select the languages you speak</option>
                  <option value="english">English</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                  <option value="german">German</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="smokes"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Do you smoke?
                </label>
                <select
                  name="smokes"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="smokes"
                >
                  <option>Select smoking preference</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="sometimes">Sometimes</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="drinks"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Do you drink?
                </label>
                <select
                  name="drinks"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500"
                  id="drinks"
                >
                  <option>Select drinking preference</option>
                  <option value="socially">Socially</option>
                  <option value="often">Often</option>
                  <option value="rarely">Rarely</option>
                </select>
              </div>
            </div>
          </div>

          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
