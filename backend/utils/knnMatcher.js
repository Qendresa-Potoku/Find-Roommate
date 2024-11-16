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

function haversineDistance(coord1, coord2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function calculateRoomDistance(user, room) {
  let distance = 0;

  // Location Distance (geographic)
  if (
    user.location &&
    room.location &&
    user.location.latitude &&
    user.location.longitude &&
    room.location.latitude &&
    room.location.longitude
  ) {
    const locationDistance = haversineDistance(user.location, room.location);
    distance += locationDistance; // Higher priority to geographic location distance
  }

  // Income and rent difference as secondary priority
  const userIncome = parseInt(user.income, 10);
  if (!isNaN(userIncome)) {
    distance += Math.pow(userIncome - room.rent, 2); // (income - rent)^2
  }

  return distance; // Return the calculated distance
}

// Main function to find K nearest rooms based on user preferences
export async function findNearestRooms(targetUserId, k = 5) {
  const targetUser = await User.findById(targetUserId);
  const allRooms = await Room.find({});

  const distances = allRooms.map((room) => ({
    room,
    distance: calculateRoomDistance(targetUser, room),
  }));

  distances.sort((a, b) => a.distance - b.distance); // Sort by calculated distance

  return distances.slice(0, k).map((entry) => entry.room); // Return top K nearest rooms
}
