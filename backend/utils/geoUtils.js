import axios from "axios";

export const getCoordinates = async (location) => {
  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      location
    )}&key=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    console.error("Error getting coordinates:", error.message);
    throw error;
  }
};
