/**
 * Centralized Financial & Recommendation Calculation Engine for AgriRoute
 * Single source of truth for all logistics, revenue, net return, ranking, and reasoning calculations.
 */

const VEHICLE_TYPES = {
  auto:          { name: 'Auto Cargo / 3-Wheeler',   capacityKg: 500,   costPerKm: 6  },
  small_pickup:  { name: 'Tata Ace / Small Pickup',  capacityKg: 1500,  costPerKm: 8  },
  medium_truck:  { name: 'Medium Truck (Eicher)',    capacityKg: 5000,  costPerKm: 14 },
  heavy_truck:   { name: 'Heavy Multi-Axle Truck',   capacityKg: 15000, costPerKm: 22 },
};

const QUALITY_MULTIPLIERS = {
  A: 1.00,
  B: 0.85,
  C: 0.70,
};

/**
 * Calculates number of trips required for a given payload.
 * Trips = ceil(quantity / vehicleCapacity)
 */
function calculateTripsRequired(quantityKg, vehicleCapacityKg) {
  const qty = Number(quantityKg);
  const cap = Number(vehicleCapacityKg);
  if (!qty || qty <= 0 || !cap || cap <= 0) return 0;
  return Math.ceil(qty / cap);
}

/**
 * Calculates full financial breakdown for a candidate market.
 */
function calculateMarketFinancials({
  pricePerKg,
  quantity,
  distanceKm,
  vehicleType = 'small_pickup',
  customRatePerKm,
  laborCostPerTrip = 0,
  loadingCostPerTrip = 0,
  unloadingCostPerTrip = 0,
  tollCostPerTrip = 0,
  otherCost = 0,
}) {
  const qty = Number(quantity);
  const price = Number(pricePerKg);
  const dist = Number(distanceKm);

  if (isNaN(qty) || qty <= 0) {
    throw new Error('Quantity must be a positive number');
  }
  if (isNaN(price) || price < 0) {
    throw new Error('Price per kg must be a non-negative number');
  }
  if (isNaN(dist) || dist < 0) {
    throw new Error('Distance must be a non-negative number');
  }

  const vehicle = VEHICLE_TYPES[vehicleType] || VEHICLE_TYPES.small_pickup;
  const effectiveCostPerKm = customRatePerKm !== undefined && customRatePerKm !== null && !isNaN(customRatePerKm)
    ? Number(customRatePerKm)
    : vehicle.costPerKm;

  const vehicleCapacity = vehicle.capacityKg;
  const tripsNeeded = calculateTripsRequired(qty, vehicleCapacity);

  const transportCost = Math.round(dist * effectiveCostPerKm * tripsNeeded);
  const laborCost = Math.round(Number(laborCostPerTrip || 0) * tripsNeeded);
  const loadingCost = Math.round(Number(loadingCostPerTrip || 0) * tripsNeeded);
  const unloadingCost = Math.round(Number(unloadingCostPerTrip || 0) * tripsNeeded);
  const tollCost = Math.round(Number(tollCostPerTrip || 0) * tripsNeeded);
  const extraCost = Math.round(Number(otherCost || 0));

  const totalLogisticsCost = transportCost + laborCost + loadingCost + unloadingCost + tollCost + extraCost;
  const grossRevenue = Math.round(price * qty);
  const netReturn = grossRevenue - totalLogisticsCost;

  const netReturnPerKg = qty > 0 ? Math.round((netReturn / qty) * 100) / 100 : 0;
  const netReturnPerQuintal = qty > 0 ? Math.round((netReturn / (qty / 100)) * 100) / 100 : 0;
  const profitMarginPercent = grossRevenue > 0 ? Math.round((netReturn / grossRevenue) * 100) : 0;

  return {
    pricePerKg: Math.round(price * 100) / 100,
    quantity: qty,
    distanceKm: Math.round(dist * 10) / 10,
    vehicleType,
    vehicleName: vehicle.name,
    vehicleCapacityKg: vehicleCapacity,
    costPerKm: effectiveCostPerKm,
    tripsNeeded,
    transportCost,
    laborCost,
    loadingCost,
    unloadingCost,
    tollCost,
    otherCost: extraCost,
    totalLogisticsCost,
    grossRevenue,
    netReturn,
    netReturnPerKg,
    netReturnPerQuintal,
    profitMarginPercent,
  };
}

/**
 * Deterministic tie-breaker comparator:
 * 1. Higher net return
 * 2. Lower total logistics cost
 * 3. Higher price per kg
 * 4. Shorter distance (km)
 * 5. Deterministic alphanumeric sort by market name
 */
function compareCandidateRankings(a, b) {
  // 1. Higher net return
  if (b.netReturn !== a.netReturn) {
    return b.netReturn - a.netReturn;
  }
  // 2. Lower logistics cost
  const aLogistics = a.totalLogisticsCost !== undefined ? a.totalLogisticsCost : a.transportCost;
  const bLogistics = b.totalLogisticsCost !== undefined ? b.totalLogisticsCost : b.transportCost;
  if (aLogistics !== bLogistics) {
    return aLogistics - bLogistics;
  }
  // 3. Higher price
  if (b.pricePerKg !== a.pricePerKg) {
    return b.pricePerKg - a.pricePerKg;
  }
  // 4. Shorter distance
  if (a.distanceKm !== b.distanceKm) {
    return a.distanceKm - b.distanceKm;
  }
  // 5. Deterministic fallback by market name / id
  const aName = a.market?.name || String(a.market?._id || '');
  const bName = b.market?.name || String(b.market?._id || '');
  return aName.localeCompare(bName);
}

/**
 * Validates candidate market result.
 * Returns true if candidate is mathematically valid for ranking.
 */
function isValidCandidate(candidate) {
  if (!candidate) return false;
  if (!candidate.priceAvailable) return false;
  if (typeof candidate.pricePerKg !== 'number' || isNaN(candidate.pricePerKg) || candidate.pricePerKg <= 0) return false;
  if (typeof candidate.distanceKm !== 'number' || isNaN(candidate.distanceKm) || candidate.distanceKm < 0) return false;
  if (typeof candidate.grossRevenue !== 'number' || isNaN(candidate.grossRevenue)) return false;
  if (typeof candidate.netReturn !== 'number' || isNaN(candidate.netReturn)) return false;
  if (typeof candidate.tripsNeeded !== 'number' || isNaN(candidate.tripsNeeded) || candidate.tripsNeeded <= 0) return false;
  if (!candidate.market || !candidate.market.coordinates) return false;
  const { lat, lng } = candidate.market.coordinates;
  if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) return false;
  if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Generates dynamic, structured recommendation reasoning from calculated figures.
 */
function generateRecommendationReason(result, allRankedResults = []) {
  const rank = result.rank;
  const isTopRank = rank === 1;

  // Find nearest market and highest price market for comparative context
  let nearestMarket = allRankedResults[0];
  let highestPriceMarket = allRankedResults[0];
  for (const item of allRankedResults) {
    if (item.distanceKm < nearestMarket.distanceKm) nearestMarket = item;
    if (item.pricePerKg > highestPriceMarket.pricePerKg) highestPriceMarket = item;
  }

  const priceDiffVsNearest = nearestMarket
    ? Math.round((result.pricePerKg - nearestMarket.pricePerKg) * 100) / 100
    : 0;

  const netDiffVsNearest = nearestMarket
    ? result.netReturn - nearestMarket.netReturn
    : 0;

  const logisticsPercentOfGross = result.grossRevenue > 0
    ? Math.round((result.totalLogisticsCost / result.grossRevenue) * 1000) / 10
    : 0;

  let primary = '';
  let priceAdvantage = '';
  let logisticsImpact = '';
  let distanceImpact = '';

  if (isTopRank) {
    primary = `Highest estimated net return of ₹${result.netReturn.toLocaleString('en-IN')} (₹${result.netReturnPerKg.toFixed(2)}/kg net take-home).`;
    if (nearestMarket && nearestMarket.market._id !== result.market._id) {
      if (netDiffVsNearest > 0) {
        priceAdvantage = `Wholesale price is ₹${result.pricePerKg}/kg (${priceDiffVsNearest >= 0 ? '+' : ''}₹${priceDiffVsNearest}/kg vs closest mandi ${nearestMarket.market.name}), yielding ₹${netDiffVsNearest.toLocaleString('en-IN')} extra take-home profit after accounting for additional road freight.`;
      } else {
        priceAdvantage = `Wholesale rate of ₹${result.pricePerKg}/kg delivers superior economics over competing yards.`;
      }
    } else {
      priceAdvantage = `Optimal balance: Lowest transit distance (${result.distanceKm} km) and solid wholesale mandi rate (₹${result.pricePerKg}/kg).`;
    }
    logisticsImpact = `Logistics & freight total ₹${result.totalLogisticsCost.toLocaleString('en-IN')} (${logisticsPercentOfGross}% of gross revenue) across ${result.tripsNeeded} trip(s).`;
    distanceImpact = `${result.distanceKm} km transit via ${result.vehicleName}.`;
  } else {
    const diffFromFirst = allRankedResults[0] ? allRankedResults[0].netReturn - result.netReturn : 0;
    primary = `Rank #${rank} option with net return of ₹${result.netReturn.toLocaleString('en-IN')} (₹${diffFromFirst.toLocaleString('en-IN')} lower than #1 ${allRankedResults[0]?.market?.name || 'top market'}).`;
    priceAdvantage = `Wholesale mandi rate is ₹${result.pricePerKg}/kg.`;
    logisticsImpact = `Logistics cost is ₹${result.totalLogisticsCost.toLocaleString('en-IN')} (${logisticsPercentOfGross}% of revenue).`;
    distanceImpact = `${result.distanceKm} km transit distance requires ${result.tripsNeeded} trip(s).`;
  }

  return {
    primary,
    priceAdvantage,
    logisticsImpact,
    distanceImpact,
  };
}

/**
 * Determines price freshness label and age in hours.
 */
function determinePriceFreshness(date, isSeed = false) {
  if (isSeed) {
    return {
      priceFreshness: 'DEMO',
      priceAgeHours: 0,
      isDemoData: true,
      source: 'seed',
    };
  }

  if (!date) {
    return {
      priceFreshness: 'DEMO',
      priceAgeHours: 0,
      isDemoData: true,
      source: 'seed',
    };
  }

  const recordTime = new Date(date).getTime();
  const now = Date.now();
  const ageHours = Math.max(0, Math.round((now - recordTime) / (1000 * 60 * 60)));

  let priceFreshness = 'LIVE';
  if (ageHours > 72) {
    priceFreshness = 'STALE';
  } else if (ageHours > 24) {
    priceFreshness = 'RECENT';
  }

  return {
    priceFreshness,
    priceAgeHours: ageHours,
    isDemoData: false,
    source: 'api',
  };
}

module.exports = {
  VEHICLE_TYPES,
  QUALITY_MULTIPLIERS,
  calculateTripsRequired,
  calculateMarketFinancials,
  compareCandidateRankings,
  isValidCandidate,
  generateRecommendationReason,
  determinePriceFreshness,
};
