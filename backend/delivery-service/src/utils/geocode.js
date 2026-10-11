import fetch from "node-fetch";

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const GEOCODE_COUNTRY = process.env.GEOCODE_COUNTRY || 'lk';

export async function geocodeAddress(address) {
  if (!OPENCAGE_API_KEY) throw new Error('OPENCAGE_API_KEY is not set');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&countrycode=${GEOCODE_COUNTRY}&key=${OPENCAGE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry;
    return [lng, lat]; // [longitude, latitude]
  } else {
    throw new Error('Address not found');
  }
}
