import User from "../models/userModel.js";
import Room from "../models/roomModel.js";

function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function preprocessUser(user) {
  return {
    ...user,
    gender: user.gender === "male" ? 0 : 1,
    orientation: normalize(
      user.orientation === "straight"
        ? 0
        : user.orientation === "bisexual"
        ? 1
        : 2,
      0,
      2
    ),
    ethnicity: normalize(
      user.ethnicity === "albanian"
        ? 0
        : user.ethnicity === "turk"
        ? 1
        : user.ethnicity === "romani"
        ? 2
        : user.ethnicity === "bosniak"
        ? 3
        : 4,
      0,
      4
    ),
    smokes: normalize(
      user.smokes === "yes" ? 0 : user.smokes === "no" ? 1 : 2,
      0,
      2
    ),
    drinks: normalize(
      user.drinks === "socially" ? 0 : user.drinks === "often" ? 1 : 2,
      0,
      2
    ),

    location: user.location,
    _id: user._id,
    name: user.name,
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

function calculateUserDistance(user1, user2, weights, maxLocationDistance) {
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
    console.log(
      `Distance between ${user1.location.name} (${user1.location?.coordinates}) ` +
        `and ${user2.location.name} (${user2.location?.coordinates}): ${locDist}`
    );

    const normalizedLocDist = normalize(locDist, 0, maxLocationDistance);
    distance += Math.pow(weights.location * normalizedLocDist, 2);
  }

  return Math.sqrt(distance);
}

export async function findNearestUsers(targetUserId, k = null) {
  const weights = {
    age: 0.0467,
    gender: 0.1869,
    orientation: 0.028,
    ethnicity: 0.028,
    income: 0.1121,
    location: 1.9607,
    smokes: 0.0187,
    drinks: 0.0187,
  };

  const targetUser = preprocessUser(await User.findById(targetUserId).lean());
  const allUsers = (await User.find({ _id: { $ne: targetUserId } }).lean()).map(
    preprocessUser
  );

  const ages = allUsers.map((u) => u.age).concat(targetUser.age);
  const incomes = allUsers.map((u) => u.income).concat(targetUser.income);
  const ageMin = Math.min(...ages);
  const ageMax = Math.max(...ages);
  const incomeMin = Math.min(...incomes);
  const incomeMax = Math.max(...incomes);

  allUsers.forEach((u) => {
    u.age = normalize(u.age, ageMin, ageMax);
    u.income = normalize(u.income, incomeMin, incomeMax);
  });
  targetUser.age = normalize(targetUser.age, ageMin, ageMax);
  targetUser.income = normalize(targetUser.income, incomeMin, incomeMax);

  const allCoordinates = allUsers
    .map((u) => u.location?.coordinates)
    .concat(targetUser.location?.coordinates);
  const maxLocationDistance = Math.max(
    ...allCoordinates.flatMap((coord1) =>
      allCoordinates.map((coord2) =>
        coord1 && coord2 ? haversineDistance(coord1, coord2) : 0
      )
    )
  );

  const distances = allUsers.map((user) => ({
    user,
    distance: calculateUserDistance(
      targetUser,
      user,
      weights,
      maxLocationDistance
    ),
  }));

  distances.sort((a, b) => a.distance - b.distance);

  console.log("Sorted Distances:");
  distances.forEach((entry) => {
    console.log(
      `Name: ${entry.user.name} (${entry.user._id}) | Location: ${entry.user.location?.name} | Distance: ${entry.distance}`
    );
  });

  return distances.map((entry) => entry.user);
}

export async function findNearestRooms(targetUserId, k = null) {
  const weights = {
    rent: 0.4,
    location: 0.6,
  };

  try {
    const targetUser = preprocessUser(await User.findById(targetUserId));
    if (!targetUser?.location?.coordinates) {
      console.warn(
        `Target user (${targetUserId}) has invalid or missing location.`
      );
      return [];
    }

    targetUser.income = Number(targetUser.income);
    const allRooms = await Room.find({ userId: { $ne: targetUserId } });
    if (!allRooms.length) {
      throw new Error("No rooms found in the database.");
    }

    const rents = allRooms.map((room) => Number(room.rent));
    const rentMin = Math.min(...rents);
    const rentMax = Math.max(...rents);

    const locations = allRooms
      .map((room) => room.location?.coordinates)
      .concat(targetUser.location.coordinates);
    const maxLocationDistance = Math.max(
      ...locations.flatMap((coord1) =>
        locations.map((coord2) =>
          coord1 && coord2 ? haversineDistance(coord1, coord2) : 0
        )
      )
    );

    const distances = allRooms.map((room) => {
      const roomRent = Number(room.rent);
      const rentDiff = Math.abs(targetUser.income - roomRent);
      const normalizedRentDiff = normalize(rentDiff, 0, rentMax - rentMin);

      const locDist = haversineDistance(
        targetUser.location.coordinates,
        room.location?.coordinates
      );
      const normalizedLocDist = normalize(locDist, 0, maxLocationDistance);

      const distance =
        weights.rent * normalizedRentDiff +
        weights.location * normalizedLocDist;

      console.log(
        `Room ID: ${room._id}, Rent: ${roomRent}, Location: ${room.location?.name}, ` +
          `Normalized Rent Diff: ${normalizedRentDiff}, Normalized Location Distance: ${normalizedLocDist}, ` +
          `Final Weighted Distance: ${distance}`
      );

      return { room, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);

    console.log("Sorted Rooms by Distance:");
    distances.forEach((entry) =>
      console.log(
        `Room ID: ${entry.room._id}, Rent: ${entry.room.rent}, Location: ${entry.room.location?.name}, Distance: ${entry.distance}`
      )
    );

    return distances.slice(0, k || distances.length).map((entry) => entry.room);
  } catch (error) {
    console.error("Error in findNearestRooms:", error.message);
    throw error;
  }
}
