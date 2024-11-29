import User from "../models/userModel.js";
import Room from "../models/roomModel.js";

function preprocessUser(user) {
  return {
    ...user,
    gender: user.gender === "male" ? 0 : 1,
    orientation:
      user.orientation === "straight"
        ? 0
        : user.orientation === "bisexual"
        ? 1
        : 2,
    ethnicity:
      user.ethnicity === "albanian"
        ? 0
        : user.ethnicity === "turk"
        ? 1
        : user.ethnicity === "romani"
        ? 2
        : user.ethnicity === "bosniak"
        ? 3
        : 4,
    smokes: user.smokes === "yes" ? 0 : user.smokes === "no" ? 1 : 2,
    drinks: user.drinks === "socially" ? 0 : user.drinks === "often" ? 1 : 2,
  };
}

function haversineDistance(coord1, coord2) {
  const R = 6371;
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateUserDistance(user1, user2, weights) {
  let distance = 0;

  const attributes = [
    "age",
    "gender",
    "orientation",
    "ethnicity",
    "income",
    "smokes",
    "drinks",
  ];
  attributes.forEach((attr) => {
    if (user1[attr] !== undefined && user2[attr] !== undefined) {
      distance += weights[attr] * Math.pow(user1[attr] - user2[attr], 2);
    }
  });

  if (
    user1.location &&
    user2.location &&
    user1.location.coordinates &&
    user2.location.coordinates
  ) {
    const locDist = haversineDistance(
      user1.location.coordinates,
      user2.location.coordinates
    );
    distance += Math.pow(weights.location * locDist, 2);
  }

  return Math.sqrt(distance);
}

function calculateRoomDistance(user, room, weights) {
  let distance = 0;

  if (user.income !== undefined && room.rent !== undefined) {
    distance += weights.rent * Math.pow(user.income - room.rent, 2);
  }

  if (
    user.location &&
    room.location &&
    user.location.coordinates &&
    room.location.coordinates
  ) {
    const locDist = haversineDistance(
      user.location.coordinates,
      room.location.coordinates
    );
    distance += weights.location * locDist;
  }

  return Math.sqrt(distance);
}

export async function findNearestUsers(targetUserId, k = 5) {
  const weights = {
    age: 0.5,
    gender: 1,
    orientation: 0.3,
    ethnicity: 0.3,
    income: 0.5,
    location: 2,
    smokes: 0.2,
    drinks: 0.2,
  };

  const targetUser = preprocessUser(await User.findById(targetUserId).lean());
  const allUsers = (await User.find({ _id: { $ne: targetUserId } }).lean()).map(
    preprocessUser
  );

  const distances = allUsers.map((user) => ({
    user,
    distance: calculateUserDistance(targetUser, user, weights),
  }));

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map((entry) => entry.user);
}

export async function findNearestRooms(targetUserId, k = 5) {
  const weights = {
    rent: 1,
    location: 2,
  };

  const targetUser = preprocessUser(await User.findById(targetUserId));
  const allRooms = await Room.find({});

  const distances = allRooms.map((room) => ({
    room,
    distance: calculateRoomDistance(targetUser, room, weights),
  }));

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map((entry) => entry.room);
}
