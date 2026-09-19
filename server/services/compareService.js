const Market = require('../models/Market');
const Crop = require('../models/Crop');
const PriceRecord = require('../models/PriceRecord');
const { haversineDistance } = require('./haversine');
const { MARKETS, CROPS, BASE_PRICES } = require('./seedHelper');
const { isConnected } = require('../db');

// Vehicle specification defaults
const VEHICLE_TYPES = {
  auto:          { name: 'Auto Cargo / 3-Wheeler',   capacityKg: 500,   costPerKm: 6  },
  small_pickup:  { name: 'Tata Ace / Small Pickup',  capacityKg: 1500,  costPerKm: 8  },
  medium_truck:  { name: 'Medium Truck (Eicher)',    capacityKg: 5000,  costPerKm: 14 },
  heavy_truck:   { name: 'Heavy Multi-Axle Truck',   capacityKg: 15000, costPerKm: 22 },
};

const DEFAULT_RADIUS_KM = 250;
const QUALITY_MULTIPLIERS = { A: 1.0, B: 0.85, C: 0.70 };

/**
 * Fallback in-memory comparison when MongoDB is not active or for instant calculation
 */
function compareInMemory({ cropId, quantity, quality, lat, lng, radiusKm = DEFAULT_RADIUS_KM, vehicleType = 'small_pickup', customRatePerKm, laborCostPerTrip = 0 }) {
  // Find crop name
  let cropName = 'Tomato';
  if (cropId && cropId.startsWith('crop_')) {
    const idx = parseInt(cropId.replace('crop_', ''), 10) - 1;
    if (CROPS[idx]) cropName = CROPS[idx].name;
  } else {
    const matched = CROPS.find((c) => c.name.toLowerCase() === String(cropId).toLowerCase() || c._id === cropId);
    if (matched) cropName = matched.name;
  }

  const basePrices = BASE_PRICES[cropName] || BASE_PRICES.Tomato;
  const qualityMultiplier = QUALITY_MULTIPLIERS[quality] || 1.0;

  const vehicle = VEHICLE_TYPES[vehicleType] || VEHICLE_TYPES.small_pickup;
  const effectiveCostPerKm = customRatePerKm ? Number(customRatePerKm) : vehicle.costPerKm;
  const vehicleCapacity = vehicle.capacityKg;

  const allResults = [];

  MARKETS.forEach((market, idx) => {
    const [marketLng, marketLat] = market.location.coordinates;
    const distanceKm = haversineDistance(lat, lng, marketLat, marketLng);

    const basePrice = basePrices[idx] || basePrices[idx % basePrices.length] || 20;
    const pricePerKg = Math.round(basePrice * qualityMultiplier * 100) / 100;
    const tripsNeeded = Math.ceil(quantity / vehicleCapacity);
    const transportCost = Math.round(distanceKm * effectiveCostPerKm * tripsNeeded + (tripsNeeded * Number(laborCostPerTrip)));
    const grossRevenue = Math.round(pricePerKg * quantity);
    const netReturn = grossRevenue - transportCost;
    const profitMarginPercent = grossRevenue > 0 ? Math.round((netReturn / grossRevenue) * 100) : 0;

    const record = {
      market: {
        _id: `market_${idx + 1}`,
        name: market.name,
        address: market.address,
        district: market.district,
        state: market.state,
        contactInfo: market.contactInfo,
        operatingHours: market.operatingHours,
        coordinates: { lat: marketLat, lng: marketLng },
      },
      pricePerKg,
      quality,
      priceDate: new Date(),
      distanceKm: Math.round(distanceKm * 10) / 10,
      tripsNeeded,
      vehicleType,
      vehicleName: vehicle.name,
      transportCost,
      grossRevenue,
      netReturn,
      profitMarginPercent,
    };

    allResults.push(record);
  });

  // Filter by radius
  let filtered = allResults.filter((r) => r.distanceKm <= radiusKm);

  // If none within radius, return top 3 nearest
  if (filtered.length === 0) {
    filtered = [...allResults].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
  }

  filtered.sort((a, b) => b.netReturn - a.netReturn);
  return filtered.map((r, i) => ({ ...r, rank: i + 1 }));
}

/**
 * Core market comparison algorithm with automatic DB / memory switching
 */
async function compareMarkets({ cropId, quantity, quality, lat, lng, radiusKm = DEFAULT_RADIUS_KM, vehicleType = 'small_pickup', customRatePerKm, laborCostPerTrip = 0 }) {
  if (!isConnected()) {
    return compareInMemory({ cropId, quantity, quality, lat, lng, radiusKm, vehicleType, customRatePerKm, laborCostPerTrip });
  }

  try {
    const nearbyMarkets = await Market.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      isActive: true,
    }).populate('supportedCrops', 'name');

    if (nearbyMarkets.length === 0) {
      return compareInMemory({ cropId, quantity, quality, lat, lng, radiusKm, vehicleType, customRatePerKm, laborCostPerTrip });
    }

    const marketIds = nearbyMarkets.map((m) => m._id);

    let cropObjectId;
    try {
      cropObjectId = new (require('mongoose').Types.ObjectId)(cropId);
    } catch {
      return compareInMemory({ cropId, quantity, quality, lat, lng, radiusKm, vehicleType, customRatePerKm, laborCostPerTrip });
    }

    const latestPrices = await PriceRecord.aggregate([
      {
        $match: {
          market: { $in: marketIds },
          crop: cropObjectId,
          quality,
        },
      },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$market',
          pricePerUnit: { $first: '$pricePerUnit' },
          date: { $first: '$date' },
          quality: { $first: '$quality' },
        },
      },
    ]);

    if (latestPrices.length === 0) {
      return compareInMemory({ cropId, quantity, quality, lat, lng, radiusKm, vehicleType, customRatePerKm, laborCostPerTrip });
    }

    const priceMap = {};
    latestPrices.forEach((p) => {
      priceMap[p._id.toString()] = p;
    });

    const vehicle = VEHICLE_TYPES[vehicleType] || VEHICLE_TYPES.small_pickup;
    const effectiveCostPerKm = customRatePerKm ? Number(customRatePerKm) : vehicle.costPerKm;
    const vehicleCapacity = vehicle.capacityKg;

    const results = [];

    for (const market of nearbyMarkets) {
      const priceRecord = priceMap[market._id.toString()];
      if (!priceRecord) continue;

      const [marketLng, marketLat] = market.location.coordinates;
      const distanceKm = haversineDistance(lat, lng, marketLat, marketLng);

      const tripsNeeded = Math.ceil(quantity / vehicleCapacity);
      const transportCost = Math.round(distanceKm * effectiveCostPerKm * tripsNeeded + (tripsNeeded * Number(laborCostPerTrip)));
      const grossRevenue = Math.round(priceRecord.pricePerUnit * quantity);
      const netReturn = grossRevenue - transportCost;
      const profitMarginPercent = grossRevenue > 0 ? Math.round((netReturn / grossRevenue) * 100) : 0;

      results.push({
        market: {
          _id: market._id,
          name: market.name,
          address: market.address,
          district: market.district,
          state: market.state,
          contactInfo: market.contactInfo,
          operatingHours: market.operatingHours,
          coordinates: { lat: marketLat, lng: marketLng },
        },
        pricePerKg: priceRecord.pricePerUnit,
        quality: priceRecord.quality,
        priceDate: priceRecord.date,
        distanceKm: Math.round(distanceKm * 10) / 10,
        tripsNeeded,
        vehicleType,
        vehicleName: vehicle.name,
        transportCost,
        grossRevenue,
        netReturn,
        profitMarginPercent,
      });
    }

    results.sort((a, b) => b.netReturn - a.netReturn);
    return results.map((r, i) => ({ ...r, rank: i + 1 }));
  } catch (err) {
    console.warn('⚠️ Compare DB error, falling back to memory algorithm:', err.message);
    return compareInMemory({ cropId, quantity, quality, lat, lng, radiusKm, vehicleType, customRatePerKm, laborCostPerTrip });
  }
}

module.exports = { compareMarkets, VEHICLE_TYPES };

