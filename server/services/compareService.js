const Market = require('../models/Market');
const Crop = require('../models/Crop');
const PriceRecord = require('../models/PriceRecord');
const { haversineDistance } = require('./haversine');
const { MARKETS, CROPS, BASE_PRICES, QUALITY_MULTIPLIERS, getDeterministicHistoricalPrice } = require('./seedHelper');
const { isConnected } = require('../db');
const {
  VEHICLE_TYPES,
  calculateTripsRequired,
  calculateMarketFinancials,
  compareCandidateRankings,
  isValidCandidate,
  generateRecommendationReason,
  determinePriceFreshness,
} = require('./calculationEngine');

const DEFAULT_RADIUS_KM = 250;

/**
 * Resolves crop identifier to a known crop object.
 */
function resolveCrop(cropId) {
  if (!cropId) return CROPS[0];

  const str = String(cropId).trim();
  if (str.startsWith('crop_')) {
    const idx = parseInt(str.replace('crop_', ''), 10) - 1;
    if (CROPS[idx]) return { ...CROPS[idx], _id: str };
  }

  const matched = CROPS.find(
    (c) =>
      c.name.toLowerCase() === str.toLowerCase() ||
      c._id === str ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase() === str.toLowerCase()))
  );

  return matched ? { ...matched, _id: matched._id || str } : { ...CROPS[0], _id: 'crop_1' };
}

/**
 * In-memory candidate evaluation
 */
function compareInMemory({
  cropId,
  quantity,
  quality = 'A',
  lat,
  lng,
  radiusKm = DEFAULT_RADIUS_KM,
  vehicleType = 'small_pickup',
  customRatePerKm,
  laborCostPerTrip = 0,
  loadingCostPerTrip = 0,
  unloadingCostPerTrip = 0,
  tollCostPerTrip = 0,
  otherCost = 0,
}) {
  const crop = resolveCrop(cropId);
  const cropName = crop.name;
  const validQuality = ['A', 'B', 'C'].includes(quality) ? quality : 'A';

  const candidates = [];

  MARKETS.forEach((market, idx) => {
    // GeoJSON coordinates are [longitude, latitude]
    const [marketLng, marketLat] = market.location.coordinates;
    const distanceKm = haversineDistance(lat, lng, marketLat, marketLng);

    // Apply quality multiplier strictly once via deterministic historical generator
    const pricePerKg = getDeterministicHistoricalPrice(cropName, idx, validQuality, 0);

    if (!pricePerKg || pricePerKg <= 0) {
      return; // Skip invalid or unsupported markets
    }

    const financials = calculateMarketFinancials({
      pricePerKg,
      quantity,
      distanceKm,
      vehicleType,
      customRatePerKm,
      laborCostPerTrip,
      loadingCostPerTrip,
      unloadingCostPerTrip,
      tollCostPerTrip,
      otherCost,
    });

    const isWithinRadius = distanceKm <= radiusKm;
    const freshness = determinePriceFreshness(new Date(), true);

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
      ...financials,
      quality: validQuality,
      priceDate: new Date(),
      priceAvailable: true,
      withinRequestedRadius: isWithinRadius,
      priceFreshness: freshness.priceFreshness,
      isDemoData: freshness.isDemoData,
      source: freshness.source,
      priceAgeHours: freshness.priceAgeHours,
    };

    if (isValidCandidate(record)) {
      candidates.push(record);
    }
  });

  // Radius filtering
  let validCandidates = candidates.filter((c) => c.distanceKm <= radiusKm);
  let withinRequestedRadius = true;

  if (validCandidates.length === 0) {
    // Graceful fallback to nearest markets outside radius, explicitly flagged
    withinRequestedRadius = false;
    validCandidates = [...candidates].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
    validCandidates.forEach((c) => {
      c.withinRequestedRadius = false;
    });
  }

  // Sort candidates by deterministic ranking
  validCandidates.sort(compareCandidateRankings);

  // Assign ranks and dynamic recommendation reasons
  const ranked = validCandidates.map((r, i) => {
    const rankedRecord = { ...r, rank: i + 1 };
    rankedRecord.recommendationReason = generateRecommendationReason(rankedRecord, validCandidates);
    return rankedRecord;
  });

  // Calculate potential Grade A arbitrage gain if user queried Grade B or C
  let gradeArbitrageGain = null;
  if (validQuality !== 'A' && ranked.length > 0) {
    const topMarketIdx = MARKETS.findIndex((m) => m.name === ranked[0].market.name);
    const gradeAPrice = getDeterministicHistoricalPrice(cropName, topMarketIdx >= 0 ? topMarketIdx : 0, 'A', 0);
    const gradeAFinancials = calculateMarketFinancials({
      pricePerKg: gradeAPrice,
      quantity,
      distanceKm: ranked[0].distanceKm,
      vehicleType,
      customRatePerKm,
      laborCostPerTrip,
      loadingCostPerTrip,
      unloadingCostPerTrip,
      tollCostPerTrip,
      otherCost,
    });
    gradeArbitrageGain = Math.max(0, gradeAFinancials.netReturn - ranked[0].netReturn);
  }

  return {
    results: ranked,
    total: ranked.length,
    metadata: {
      withinRequestedRadius,
      searchRadiusKm: radiusKm,
      cropName,
      quality: validQuality,
      quantity,
      gradeArbitrageGain,
      isDemoData: true,
      mode: 'standalone_memory',
    },
  };
}

/**
 * Database comparison using MongoDB collections with automatic fallback
 */
async function compareMarkets({
  cropId,
  quantity,
  quality = 'A',
  lat,
  lng,
  radiusKm = DEFAULT_RADIUS_KM,
  vehicleType = 'small_pickup',
  customRatePerKm,
  laborCostPerTrip = 0,
  loadingCostPerTrip = 0,
  unloadingCostPerTrip = 0,
  tollCostPerTrip = 0,
  otherCost = 0,
}) {
  const qty = Number(quantity);
  const userLat = Number(lat);
  const userLng = Number(lng);
  const userRadius = Number(radiusKm) || DEFAULT_RADIUS_KM;
  const validQuality = ['A', 'B', 'C'].includes(quality) ? quality : 'A';

  if (!isConnected()) {
    return compareInMemory({
      cropId,
      quantity: qty,
      quality: validQuality,
      lat: userLat,
      lng: userLng,
      radiusKm: userRadius,
      vehicleType,
      customRatePerKm,
      laborCostPerTrip,
      loadingCostPerTrip,
      unloadingCostPerTrip,
      tollCostPerTrip,
      otherCost,
    });
  }

  try {
    // GeoJSON point: [longitude, latitude]
    const nearbyMarkets = await Market.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [userLng, userLat],
          },
          $maxDistance: userRadius * 1000,
        },
      },
      isActive: true,
    }).populate('supportedCrops', 'name category');

    if (!nearbyMarkets || nearbyMarkets.length === 0) {
      return compareInMemory({
        cropId,
        quantity: qty,
        quality: validQuality,
        lat: userLat,
        lng: userLng,
        radiusKm: userRadius,
        vehicleType,
        customRatePerKm,
        laborCostPerTrip,
        loadingCostPerTrip,
        unloadingCostPerTrip,
        tollCostPerTrip,
        otherCost,
      });
    }

    const marketIds = nearbyMarkets.map((m) => m._id);

    let cropObjectId;
    let cropDoc = null;
    try {
      if (require('mongoose').Types.ObjectId.isValid(cropId)) {
        cropObjectId = new (require('mongoose').Types.ObjectId)(cropId);
        cropDoc = await Crop.findById(cropObjectId);
      } else {
        const resolved = resolveCrop(cropId);
        cropDoc = await Crop.findOne({ name: resolved.name });
        if (cropDoc) cropObjectId = cropDoc._id;
      }
    } catch {
      // Fallback
    }

    if (!cropObjectId) {
      return compareInMemory({
        cropId,
        quantity: qty,
        quality: validQuality,
        lat: userLat,
        lng: userLng,
        radiusKm: userRadius,
        vehicleType,
        customRatePerKm,
        laborCostPerTrip,
        loadingCostPerTrip,
        unloadingCostPerTrip,
        tollCostPerTrip,
        otherCost,
      });
    }

    // Fetch latest price records per market for this crop and quality
    // Note: prices in DB are already quality-specific, so quality multiplier is NOT applied again
    const latestPrices = await PriceRecord.aggregate([
      {
        $match: {
          market: { $in: marketIds },
          crop: cropObjectId,
          quality: validQuality,
        },
      },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: '$market',
          pricePerUnit: { $first: '$pricePerUnit' },
          date: { $first: '$date' },
          quality: { $first: '$quality' },
          source: { $first: '$source' },
          isDemoData: { $first: '$isDemoData' },
        },
      },
    ]);

    if (!latestPrices || latestPrices.length === 0) {
      return compareInMemory({
        cropId,
        quantity: qty,
        quality: validQuality,
        lat: userLat,
        lng: userLng,
        radiusKm: userRadius,
        vehicleType,
        customRatePerKm,
        laborCostPerTrip,
        loadingCostPerTrip,
        unloadingCostPerTrip,
        tollCostPerTrip,
        otherCost,
      });
    }

    const priceMap = {};
    latestPrices.forEach((p) => {
      priceMap[p._id.toString()] = p;
    });

    const candidates = [];

    for (const market of nearbyMarkets) {
      const priceRecord = priceMap[market._id.toString()];
      if (!priceRecord || !priceRecord.pricePerUnit || priceRecord.pricePerUnit <= 0) {
        continue; // Exclude markets without valid price
      }

      // GeoJSON [lng, lat]
      const [marketLng, marketLat] = market.location.coordinates;
      const distanceKm = haversineDistance(userLat, userLng, marketLat, marketLng);

      const financials = calculateMarketFinancials({
        pricePerKg: priceRecord.pricePerUnit,
        quantity: qty,
        distanceKm,
        vehicleType,
        customRatePerKm,
        laborCostPerTrip,
        loadingCostPerTrip,
        unloadingCostPerTrip,
        tollCostPerTrip,
        otherCost,
      });

      const freshness = determinePriceFreshness(priceRecord.date, priceRecord.isDemoData || priceRecord.source === 'seed');
      const isWithinRadius = distanceKm <= userRadius;

      const record = {
        market: {
          _id: market._id.toString(),
          name: market.name,
          address: market.address,
          district: market.district,
          state: market.state,
          contactInfo: market.contactInfo,
          operatingHours: market.operatingHours,
          coordinates: { lat: marketLat, lng: marketLng },
        },
        ...financials,
        quality: validQuality,
        priceDate: priceRecord.date,
        priceAvailable: true,
        withinRequestedRadius: isWithinRadius,
        priceFreshness: freshness.priceFreshness,
        isDemoData: freshness.isDemoData,
        source: freshness.source,
        priceAgeHours: freshness.priceAgeHours,
      };

      if (isValidCandidate(record)) {
        candidates.push(record);
      }
    }

    if (candidates.length === 0) {
      return compareInMemory({
        cropId,
        quantity: qty,
        quality: validQuality,
        lat: userLat,
        lng: userLng,
        radiusKm: userRadius,
        vehicleType,
        customRatePerKm,
        laborCostPerTrip,
        loadingCostPerTrip,
        unloadingCostPerTrip,
        tollCostPerTrip,
        otherCost,
      });
    }

    candidates.sort(compareCandidateRankings);

    const ranked = candidates.map((r, i) => {
      const rankedRecord = { ...r, rank: i + 1 };
      rankedRecord.recommendationReason = generateRecommendationReason(rankedRecord, candidates);
      return rankedRecord;
    });

    return {
      results: ranked,
      total: ranked.length,
      metadata: {
        withinRequestedRadius: true,
        searchRadiusKm: userRadius,
        cropName: cropDoc?.name || 'Crop',
        quality: validQuality,
        quantity: qty,
        isDemoData: ranked.some((r) => r.isDemoData),
        mode: 'database',
      },
    };
  } catch (err) {
    console.warn('⚠️ Compare DB error, falling back to memory algorithm:', err.message);
    return compareInMemory({
      cropId,
      quantity: qty,
      quality: validQuality,
      lat: userLat,
      lng: userLng,
      radiusKm: userRadius,
      vehicleType,
      customRatePerKm,
      laborCostPerTrip,
      loadingCostPerTrip,
      unloadingCostPerTrip,
      tollCostPerTrip,
      otherCost,
    });
  }
}

module.exports = {
  compareMarkets,
  compareInMemory,
  resolveCrop,
  VEHICLE_TYPES,
  QUALITY_MULTIPLIERS,
};
