import User from "../models/userModel.js";
import Room from "../models/roomModel.js";

function calculateEuclideanDistance(user1, user2) {
  const preferences = [
    "age",
    "gender",
    "orientation",
    "diet",
    "drinks",
    "education",
    "ethnicity",
    "income",
    "location",
    "pets",
    "smokes",
    "speaks",
  ];

  let distance = 0;

  preferences.forEach((key) => {
    if (user1[key] !== undefined && user2[key] !== undefined) {
      if (typeof user1[key] === "number" && typeof user2[key] === "number") {
        distance += Math.pow(user1[key] - user2[key], 2);
      } else if (user1[key] === user2[key]) {
        distance += 0;
      } else {
        distance += 1;
      }
    }
  });

  return Math.sqrt(distance);
}

// Main function to find K nearest neighbors for users
export async function findNearestNeighbors(targetUserId, k = 5) {
  const targetUser = await User.findById(targetUserId);
  const allUsers = await User.find({ _id: { $ne: targetUserId } });

  const distances = allUsers.map((user) => ({
    user,
    distance: calculateEuclideanDistance(targetUser, user),
  }));

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map((entry) => entry.user);
}

// Main function to find K nearest rooms based on location
export async function findNearestRooms(targetLocation, k = 5) {
  const allRooms = await Room.find({});

  const distances = allRooms.map((room) => {
    const distance = room.location === targetLocation ? 0 : 1;
    return { room, distance };
  });

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map((entry) => entry.room);
}
