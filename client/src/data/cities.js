/**
 * Comprehensive Agricultural Cities & Mandis Database
 * Primarily focused on Telangana & Andhra Pradesh farming clusters + key national hubs
 */

export const CITIES_DATABASE = [
  // ─── Telangana Major Hubs ──────────────────────────────────────────────────
  { name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, popular: true, crops: ['Vegetables', 'Tomato', 'Onion'] },
  { name: 'Secunderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.4399, lng: 78.4983, popular: false, crops: ['Vegetables', 'Fruits'] },
  { name: 'Bowenpally', district: 'Hyderabad', state: 'Telangana', lat: 17.4739, lng: 78.4867, popular: true, crops: ['Tomato', 'Onion', 'Potato'] },
  { name: 'Shamshabad', district: 'Ranga Reddy', state: 'Telangana', lat: 17.2543, lng: 78.4210, popular: true, crops: ['Vegetables', 'Flowers'] },
  { name: 'Warangal', district: 'Warangal', state: 'Telangana', lat: 17.9785, lng: 79.5941, popular: true, crops: ['Chilli', 'Cotton', 'Turmeric', 'Rice'] },
  { name: 'Hanamkonda', district: 'Hanamkonda', state: 'Telangana', lat: 18.0135, lng: 79.5517, popular: false, crops: ['Cotton', 'Chilli', 'Grain'] },
  { name: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941, popular: true, crops: ['Turmeric', 'Rice', 'Maize'] },
  { name: 'Armoor', district: 'Nizamabad', state: 'Telangana', lat: 18.7900, lng: 78.2900, popular: false, crops: ['Turmeric', 'Sorghum'] },
  { name: 'Bodhan', district: 'Nizamabad', state: 'Telangana', lat: 18.6600, lng: 77.9000, popular: false, crops: ['Sugarcane', 'Rice'] },
  { name: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', lat: 18.4386, lng: 79.1288, popular: true, crops: ['Rice', 'Maize', 'Cotton'] },
  { name: 'Jagtial', district: 'Jagtial', state: 'Telangana', lat: 18.7950, lng: 78.9120, popular: false, crops: ['Mango', 'Turmeric', 'Rice'] },
  { name: 'Sircilla', district: 'Rajanna Sircilla', state: 'Telangana', lat: 18.3840, lng: 78.8090, popular: false, crops: ['Rice', 'Cotton'] },
  { name: 'Peddapalli', district: 'Peddapalli', state: 'Telangana', lat: 18.6160, lng: 79.3780, popular: false, crops: ['Rice', 'Maize'] },
  { name: 'Khammam', district: 'Khammam', state: 'Telangana', lat: 17.2473, lng: 80.1514, popular: true, crops: ['Chilli', 'Cotton', 'Rice'] },
  { name: 'Kothagudem', district: 'Bhadradri', state: 'Telangana', lat: 17.5520, lng: 80.6180, popular: false, crops: ['Chilli', 'Rice'] },
  { name: 'Sathupalli', district: 'Khammam', state: 'Telangana', lat: 17.2150, lng: 80.8350, popular: false, crops: ['Oil Palm', 'Chilli', 'Rice'] },
  { name: 'Mahbubnagar', district: 'Mahbubnagar', state: 'Telangana', lat: 16.7488, lng: 77.9827, popular: true, crops: ['Cotton', 'Maize', 'Castor'] },
  { name: 'Gadwal', district: 'Jogulamba Gadwal', state: 'Telangana', lat: 16.2330, lng: 77.8000, popular: false, crops: ['Cotton', 'Groundnut'] },
  { name: 'Wanaparthy', district: 'Wanaparthy', state: 'Telangana', lat: 16.3630, lng: 78.0620, popular: false, crops: ['Groundnut', 'Rice', 'Maize'] },
  { name: 'Nagarkurnool', district: 'Nagarkurnool', state: 'Telangana', lat: 16.4860, lng: 78.3320, popular: false, crops: ['Groundnut', 'Maize'] },
  { name: 'Nalgonda', district: 'Nalgonda', state: 'Telangana', lat: 17.0575, lng: 79.2674, popular: true, crops: ['Rice', 'Sweet Orange', 'Cotton'] },
  { name: 'Miryalaguda', district: 'Nalgonda', state: 'Telangana', lat: 16.8722, lng: 79.5637, popular: true, crops: ['Rice', 'Paddy', 'Pulses'] },
  { name: 'Suryapet', district: 'Suryapet', state: 'Telangana', lat: 17.1439, lng: 79.6236, popular: true, crops: ['Rice', 'Chilli', 'Cotton'] },
  { name: 'Kodad', district: 'Suryapet', state: 'Telangana', lat: 16.9960, lng: 79.9670, popular: false, crops: ['Rice', 'Pulses'] },
  { name: 'Siddipet', district: 'Siddipet', state: 'Telangana', lat: 18.1018, lng: 78.8522, popular: true, crops: ['Vegetables', 'Rice', 'Maize'] },
  { name: 'Gajwel', district: 'Siddipet', state: 'Telangana', lat: 17.8520, lng: 78.6830, popular: false, crops: ['Vegetables', 'Floriculture'] },
  { name: 'Medak', district: 'Medak', state: 'Telangana', lat: 18.0460, lng: 78.2610, popular: false, crops: ['Rice', 'Sugarcane', 'Cotton'] },
  { name: 'Sangareddy', district: 'Sangareddy', state: 'Telangana', lat: 17.6190, lng: 78.0810, popular: false, crops: ['Vegetables', 'Sugarcane'] },
  { name: 'Zaheerabad', district: 'Sangareddy', state: 'Telangana', lat: 17.6830, lng: 77.6080, popular: false, crops: ['Ginger', 'Sugarcane', 'Potato'] },
  { name: 'Adilabad', district: 'Adilabad', state: 'Telangana', lat: 19.6641, lng: 78.5320, popular: true, crops: ['Cotton', 'Soybean', 'Wheat'] },
  { name: 'Nirmal', district: 'Nirmal', state: 'Telangana', lat: 19.0960, lng: 78.3440, popular: false, crops: ['Soybean', 'Cotton'] },
  { name: 'Mancherial', district: 'Mancherial', state: 'Telangana', lat: 18.8680, lng: 79.4630, popular: false, crops: ['Rice', 'Cotton'] },
  { name: 'Bellampalli', district: 'Mancherial', state: 'Telangana', lat: 19.0560, lng: 79.4930, popular: false, crops: ['Cotton', 'Vegetables'] },
  { name: 'Kamareddy', district: 'Kamareddy', state: 'Telangana', lat: 18.3220, lng: 78.3370, popular: false, crops: ['Sugarcane', 'Rice', 'Maize'] },
  { name: 'Banswada', district: 'Kamareddy', state: 'Telangana', lat: 18.3810, lng: 77.8820, popular: false, crops: ['Sugarcane', 'Paddy'] },
  { name: 'Vikarabad', district: 'Vikarabad', state: 'Telangana', lat: 17.3360, lng: 77.9040, popular: false, crops: ['Redgram', 'Maize', 'Vegetables'] },
  { name: 'Tandur', district: 'Vikarabad', state: 'Telangana', lat: 17.2580, lng: 77.5840, popular: false, crops: ['Redgram', 'Cotton'] },
  { name: 'Bhongir', district: 'Yadadri Bhuvanagiri', state: 'Telangana', lat: 17.5110, lng: 78.8900, popular: false, crops: ['Cotton', 'Vegetables'] },
  { name: 'Jangaon', district: 'Jangaon', state: 'Telangana', lat: 17.7240, lng: 79.1550, popular: false, crops: ['Rice', 'Chilli', 'Cotton'] },
  { name: 'Mahabubabad', district: 'Mahabubabad', state: 'Telangana', lat: 17.5980, lng: 80.0030, popular: false, crops: ['Chilli', 'Cotton', 'Turmeric'] },

  // ─── Andhra Pradesh Major Hubs ─────────────────────────────────────────────
  { name: 'Vijayawada', district: 'Krishna', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, popular: true, crops: ['Rice', 'Mango', 'Chilli'] },
  { name: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, popular: true, crops: ['Chilli', 'Cotton', 'Tobacco'] },
  { name: 'Tenali', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.2430, lng: 80.6400, popular: false, crops: ['Rice', 'Blackgram'] },
  { name: 'Kurnool', district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373, popular: true, crops: ['Onion', 'Cotton', 'Groundnut'] },
  { name: 'Nandyal', district: 'Nandyal', state: 'Andhra Pradesh', lat: 15.4880, lng: 78.4840, popular: false, crops: ['Bengal Gram', 'Paddy', 'Chilli'] },
  { name: 'Adoni', district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.6320, lng: 77.2750, popular: false, crops: ['Cotton', 'Groundnut'] },
  { name: 'Rajahmundry', district: 'East Godavari', state: 'Andhra Pradesh', lat: 17.0005, lng: 81.8040, popular: false, crops: ['Paddy', 'Banana', 'Sugarcane'] },
  { name: 'Kakinada', district: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lng: 82.2475, popular: false, crops: ['Rice', 'Oil Palm', 'Cashew'] },
  { name: 'Eluru', district: 'Eluru', state: 'Andhra Pradesh', lat: 16.7107, lng: 81.0952, popular: false, crops: ['Rice', 'Coconut', 'Fish/Prawn'] },
  { name: 'Nellore', district: 'SPSR Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865, popular: false, crops: ['Rice', 'Sugar', 'Lemon'] },
  { name: 'Ongole', district: 'Prakasam', state: 'Andhra Pradesh', lat: 15.5057, lng: 80.0499, popular: false, crops: ['Tobacco', 'Chilli', 'Cotton'] },
  { name: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192, popular: false, crops: ['Groundnut', 'Sugarcane', 'Mango'] },
  { name: 'Chittoor', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.2172, lng: 79.1003, popular: false, crops: ['Mango', 'Tomato', 'Sugarcane'] },
  { name: 'Madanapalle', district: 'Annamayya', state: 'Andhra Pradesh', lat: 13.5500, lng: 78.5000, popular: true, crops: ['Tomato', 'Groundnut', 'Mango'] },
  { name: 'Anantapur', district: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006, popular: false, crops: ['Groundnut', 'Sweet Orange'] },
  { name: 'Kadapa', district: 'YSR Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lng: 78.8242, popular: false, crops: ['Turmeric', 'Onion', 'Banana'] },

  // ─── Key Regional Hubs ─────────────────────────────────────────────────────
  { name: 'Bengaluru', district: 'Bangalore Urban', state: 'Karnataka', lat: 12.9716, lng: 77.5946, popular: false, crops: ['Vegetables', 'Flowers', 'Tomato'] },
  { name: 'Kolar', district: 'Kolar', state: 'Karnataka', lat: 13.1360, lng: 78.1340, popular: false, crops: ['Tomato', 'Potato', 'Milk'] },
  { name: 'Raichur', district: 'Raichur', state: 'Karnataka', lat: 16.2076, lng: 77.3463, popular: false, crops: ['Rice', 'Cotton'] },
  { name: 'Kalaburagi (Gulbarga)', district: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lng: 76.8343, popular: false, crops: ['Redgram', 'Pigeon Pea'] },
  { name: 'Solapur', district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064, popular: false, crops: ['Pomegranate', 'Onion', 'Sorghum'] },
  { name: 'Nanded', district: 'Nanded', state: 'Maharashtra', lat: 19.1383, lng: 77.3210, popular: false, crops: ['Cotton', 'Soybean', 'Banana'] },
  { name: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, popular: false, crops: ['Orange', 'Cotton', 'Soybean'] },
  { name: 'Pune', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, popular: false, crops: ['Onion', 'Tomato', 'Vegetables'] },
  { name: 'Nashik', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, popular: false, crops: ['Onion', 'Grapes', 'Tomato'] },
];

export const POPULAR_CITIES = CITIES_DATABASE.filter((c) => c.popular);

/**
 * Fuzzy search cities database
 */
export function searchCities(query) {
  if (!query || query.trim().length === 0) return POPULAR_CITIES;
  const q = query.toLowerCase().trim();

  return CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.crops.some((crop) => crop.toLowerCase().includes(q))
  ).slice(0, 10);
}

/**
 * Find the nearest city to given coordinates using haversine
 */
export function getNearestCity(lat, lng) {
  if (!lat || !lng) return null;
  const userLat = Number(lat);
  const userLng = Number(lng);

  let nearest = null;
  let minDistance = Infinity;

  for (const city of CITIES_DATABASE) {
    const dLat = ((city.lat - userLat) * Math.PI) / 180;
    const dLng = ((city.lng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((city.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c; // Earth radius in km

    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...city, distanceKm: Math.round(dist) };
    }
  }

  return nearest;
}
