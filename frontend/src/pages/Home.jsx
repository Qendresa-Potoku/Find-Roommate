import React from "react";
import { getUser } from "../services/AuthServices";
import Dashboard from "./Dashboard";

const Home = () => {
  const user = getUser();

  if (user) {
    return (
      <div>
        <Dashboard />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
      <p>This is the landing page for your app. Please login or register.</p>
    </div>
  );
};

export default Home;
