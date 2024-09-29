import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setUserSession, getUser } from "../services/AuthServices";
import axios from "axios";
import "../styles/Header.css";

// Replace with your login API endpoint
const loginUrl = "http://localhost:5555/api/auth/login";

const Login = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const submitHandler = (event) => {
    event.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
      setErrorMessage("All fields are required");
      return;
    }

    setErrorMessage(null);

    const requestBody = { username, password };

    axios
      .post(loginUrl, requestBody)
      .then((response) => {
        const { token, user } = response.data;
        if (token && user) {
          setUserSession(user, token); // Save user and token in sessionStorage
          navigate("/dashboard"); // Redirect to dashboard
        } else {
          setErrorMessage("Invalid response from server");
        }
      })
      .catch((error) => {
        if (error.response) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("An error occurred");
        }
      });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center header overflow-x-hidden">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Login
        </h3>

        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          </div>

          {errorMessage && (
            <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
