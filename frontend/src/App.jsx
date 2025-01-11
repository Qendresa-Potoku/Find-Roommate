import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProfile from "./pages/MyProfile";
import Dashboard from "./pages/Dashboard";
import Friends from "./pages/Friends";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chats from "./pages/Chats";
import UserProfile from "./pages/UserProfile";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/:friendId" element={<Chats />} />{" "}
          <Route path="/profile/:id" element={<UserProfile />} />;
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
