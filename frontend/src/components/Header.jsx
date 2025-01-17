import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, resetUserSession } from "../services/AuthServices";
import {
  FaHome,
  FaUserFriends,
  FaUserAlt,
  FaComments,
  FaSignOutAlt,
} from "react-icons/fa"; // Import icons
import logo from "../assets/images/black.png";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    resetUserSession();
    navigate("/login");
  };

  return (
    <header className="header text-white py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-8" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-300 flex items-center">
            <FaHome className="mr-2" /> Home
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="hover:text-blue-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-300">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/friends"
                className="hover:text-blue-300 flex items-center"
              >
                <FaUserFriends className="mr-2" /> Friends
              </Link>
              <Link
                to="/my-profile"
                className="hover:text-blue-300 flex items-center"
              >
                <FaUserAlt className="mr-2" /> My Profile
              </Link>
              <Link
                to="/chats"
                className="hover:text-blue-300 flex items-center"
              >
                <FaComments className="mr-2" /> Chats
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-900 text-white py-2 px-4 rounded flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
