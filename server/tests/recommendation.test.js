const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateTripsRequired,
  calculateMarketFinancials,
  compareCandidateRankings,
  isValidCandidate,
  generateRecommendationReason,
  QUALITY_MULTIPLIERS,
} = require('../services/calculationEngine');

const { compareInMemory } = require('../services/compareService');
const { getDeterministicHistoricalPrice, BASE_PRICES } = require('../services/seedHelper');

describe('AgriRoute Recommendation & Calculation Engine Tests', () => {
  // Test Case 1: quantity = 2000 kg, vehicle capacity = 1500 kg -> trips = 2
  test('Test Case 1: 2000 kg with 1500 kg capacity requires 2 trips', () => {
    const trips = calculateTripsRequired(2000, 1500);
    assert.equal(trips, 2, '2000 kg payload in 1500 kg capacity must yield 2 trips');
  });

  // Test Case 2: Market A (price = 30, dist = 20km) vs Market B (price = 32, dist = 200km)
  test('Test Case 2: Ranking is strictly based on net return, not gross price', () => {
    const quantity = 1000; // 1 trip for small_pickup (1500kg cap)
    const costPerKm = 8;

    const marketA = calculateMarketFinancials({
      pricePerKg: 30,
      quantity,
      distanceKm: 20,
      vehicleType: 'small_pickup',
      customRatePerKm: costPerKm,
    });

    const marketB = calculateMarketFinancials({
      pricePerKg: 32,
      quantity,
      distanceKm: 200,
      vehicleType: 'small_pickup',
      customRatePerKm: costPerKm,
    });

    // Market A: Gross = 30,000, Transport = 20 * 8 * 1 = 160 -> Net = 29,840
    // Market B: Gross = 32,000, Transport = 200 * 8 * 1 = 1600 -> Net = 30,400
    assert.equal(marketA.grossRevenue, 30000);
    assert.equal(marketA.transportCost, 160);
    assert.equal(marketA.netReturn, 29840);

    assert.equal(marketB.grossRevenue, 32000);
    assert.equal(marketB.transportCost, 1600);
    assert.equal(marketB.netReturn, 30400);

    const candidates = [marketA, marketB];
    candidates.sort(compareCandidateRankings);

    assert.equal(candidates[0], marketB, 'Market B has higher net return (30,400 > 29,840) and must be ranked #1');

    // Now test where transport costs outweigh the price advantage:
    // Market C: price = 31, dist = 250km -> Gross = 31,000, Transport = 2000 -> Net = 29,000 (< Market A's 29,840)
    const marketC = calculateMarketFinancials({
      pricePerKg: 31,
      quantity,
      distanceKm: 250,
      vehicleType: 'small_pickup',
      customRatePerKm: costPerKm,
    });

    const compareAC = [marketC, marketA];
    compareAC.sort(compareCandidateRankings);
    assert.equal(compareAC[0], marketA, 'Market A has higher net return (29,840 > 29,000) despite Market C having higher price');
  });

  // Test Case 3: Same price, different distance -> closer market has lower logistics cost
  test('Test Case 3: Same price, different distance gives lower logistics cost to closer market', () => {
    const marketClose = calculateMarketFinancials({
      pricePerKg: 25,
      quantity: 1000,
      distanceKm: 30,
      vehicleType: 'small_pickup',
    });

    const marketFar = calculateMarketFinancials({
      pricePerKg: 25,
      quantity: 1000,
      distanceKm: 150,
      vehicleType: 'small_pickup',
    });

    assert.ok(marketClose.totalLogisticsCost < marketFar.totalLogisticsCost, 'Closer market must have lower logistics cost');
    assert.ok(marketClose.netReturn > marketFar.netReturn, 'Closer market with identical price must have higher net return');
  });

  // Test Case 4: Same distance, higher price -> higher gross and net return
  test('Test Case 4: Same distance, higher price yields higher gross and net return', () => {
    const marketLow = calculateMarketFinancials({
      pricePerKg: 20,
      quantity: 1000,
      distanceKm: 50,
      vehicleType: 'small_pickup',
    });

    const marketHigh = calculateMarketFinancials({
      pricePerKg: 26,
      quantity: 1000,
      distanceKm: 50,
      vehicleType: 'small_pickup',
    });

    assert.ok(marketHigh.grossRevenue > marketLow.grossRevenue, 'Higher price market must have higher gross revenue');
    assert.ok(marketHigh.netReturn > marketLow.netReturn, 'Higher price market must have higher net return when distance is identical');
    assert.equal(marketHigh.totalLogisticsCost, marketLow.totalLogisticsCost, 'Logistics costs must be identical when distances and vehicle match');
  });

  // Test Case 5: Missing price -> market must not be ranked
  test('Test Case 5: Missing or invalid price candidate is excluded from ranking', () => {
    const validCandidate = {
      priceAvailable: true,
      pricePerKg: 25,
      distanceKm: 50,
      grossRevenue: 25000,
      netReturn: 24600,
      tripsNeeded: 1,
      market: { coordinates: { lat: 17.5, lng: 78.5 } },
    };

    const invalidPriceCandidate = {
      priceAvailable: false,
      pricePerKg: 0,
      distanceKm: 50,
      grossRevenue: 0,
      netReturn: 0,
      tripsNeeded: 1,
      market: { coordinates: { lat: 17.5, lng: 78.5 } },
    };

    const nullPriceCandidate = {
      priceAvailable: true,
      pricePerKg: null,
      distanceKm: 50,
      market: { coordinates: { lat: 17.5, lng: 78.5 } },
    };

    assert.equal(isValidCandidate(validCandidate), true, 'Valid candidate must pass validation');
    assert.equal(isValidCandidate(invalidPriceCandidate), false, 'Candidate with priceAvailable: false must be rejected');
    assert.equal(isValidCandidate(nullPriceCandidate), false, 'Candidate with null price must be rejected');
  });

  // Test Case 6: Invalid quantity -> calculation engine rejects request
  test('Test Case 6: Invalid quantity is rejected with error', () => {
    assert.throws(
      () => {
        calculateMarketFinancials({
          pricePerKg: 25,
          quantity: -50,
          distanceKm: 30,
        });
      },
      /Quantity must be a positive number/,
      'Non-positive quantity must throw an error'
    );

    assert.throws(
      () => {
        calculateMarketFinancials({
          pricePerKg: 25,
          quantity: 'invalid',
          distanceKm: 30,
        });
      },
      /Quantity must be a positive number/,
      'NaN quantity must throw an error'
    );
  });

  // Test Case 7: Quality B -> quality adjustment occurs exactly once
  test('Test Case 7: Quality B multiplier (0.85) applied exactly once and Grade A > Grade B', () => {
    const cropName = 'Tomato';
    const marketIdx = 0;
    const priceA = getDeterministicHistoricalPrice(cropName, marketIdx, 'A', 0);
    const priceB = getDeterministicHistoricalPrice(cropName, marketIdx, 'B', 0);

    assert.ok(priceA > priceB, `Grade A (${priceA}) must be strictly higher than Grade B (${priceB})`);

    const expectedB = Math.max(3.0, Math.round(priceA * QUALITY_MULTIPLIERS.B * 10) / 10);
    assert.equal(
      priceB,
      expectedB,
      `Grade B must be derived from Grade A with 0.85 multiplier applied once: expected ${expectedB}, got ${priceB}`
    );
  });

  // Test Case 8: Quality C -> quality adjustment occurs exactly once
  test('Test Case 8: Quality C multiplier (0.70) applied exactly once and Grade B > Grade C', () => {
    const cropName = 'Tomato';
    const marketIdx = 0;
    const priceA = getDeterministicHistoricalPrice(cropName, marketIdx, 'A', 0);
    const priceB = getDeterministicHistoricalPrice(cropName, marketIdx, 'B', 0);
    const priceC = getDeterministicHistoricalPrice(cropName, marketIdx, 'C', 0);

    assert.ok(priceB > priceC, `Grade B (${priceB}) must be strictly higher than Grade C (${priceC})`);
    assert.ok(priceA > priceC, `Grade A (${priceA}) must be strictly higher than Grade C (${priceC})`);

    const expectedC = Math.max(3.0, Math.round(priceA * QUALITY_MULTIPLIERS.C * 10) / 10);
    assert.equal(
      priceC,
      expectedC,
      `Grade C must be derived from Grade A with 0.70 multiplier applied once: expected ${expectedC}, got ${priceC}`
    );
  });

  // Test Case 9: 4,000 kg with 1,500 kg capacity -> 3 trips
  test('Test Case 9: 4000 kg payload in 1500 kg capacity requires exactly 3 trips', () => {
    const trips = calculateTripsRequired(4000, 1500);
    assert.equal(trips, 3, 'ceil(4000 / 1500) = 3 trips');
  });

  // Test Case 10: Two markets with equal net return -> deterministic tie-breaking
  test('Test Case 10: Equal net return tie-breaker prefers lower logistics cost, higher price, shorter distance', () => {
    // Market 1: Net = 50,000, Logistics = 2,000, Price = 26, Dist = 50km
    const market1 = {
      market: { _id: 'm1', name: 'Mandi One' },
      netReturn: 50000,
      totalLogisticsCost: 2000,
      pricePerKg: 26,
      distanceKm: 50,
    };

    // Market 2: Net = 50,000, Logistics = 3,000, Price = 26.5, Dist = 75km
    const market2 = {
      market: { _id: 'm2', name: 'Mandi Two' },
      netReturn: 50000,
      totalLogisticsCost: 3000,
      pricePerKg: 26.5,
      distanceKm: 75,
    };

    const candidates = [market2, market1];
    candidates.sort(compareCandidateRankings);

    assert.equal(
      candidates[0],
      market1,
      'When net return is tied, market with lower logistics cost must win'
    );

    // If both net return and logistics cost are identical:
    const market3 = {
      market: { _id: 'm3', name: 'Mandi Three' },
      netReturn: 50000,
      totalLogisticsCost: 2000,
      pricePerKg: 27,
      distanceKm: 40,
    };

    const tieBreak = [market1, market3];
    tieBreak.sort(compareCandidateRankings);
    assert.equal(
      tieBreak[0],
      market3,
      'When net return and logistics are tied, market with higher price must win'
    );
  });

  // Additional End-to-End comparison test
  test('compareInMemory produces valid, complete financial response with dynamic reasoning', () => {
    const response = compareInMemory({
      cropId: 'crop_1',
      quantity: 1000,
      quality: 'A',
      lat: 17.9785,
      lng: 79.5941,
      radiusKm: 250,
      vehicleType: 'small_pickup',
    });

    assert.ok(response.results.length > 0, 'Results must contain ranked markets');
    assert.equal(response.results[0].rank, 1, 'Top candidate must have rank 1');
    assert.ok(response.results[0].recommendationReason, 'Rank 1 must have recommendationReason');
    assert.ok(response.results[0].recommendationReason.primary.length > 0, 'primary reason must be non-empty');
    assert.ok(response.results[0].netReturnPerKg > 0, 'netReturnPerKg must be calculated');
    assert.ok(response.results[0].netReturnPerQuintal > 0, 'netReturnPerQuintal must be calculated');
    assert.equal(response.metadata.cropName, 'Tomato');
  });

  // Test Case 11: Geolocation coordinate handling and Haversine ordering
  test('Test Case 11: Coordinates are verified with [lng, lat] GeoJSON and (lat, lng) Haversine order', () => {
    const { haversineDistance } = require('../services/haversine');
    const { MARKETS } = require('../services/seedHelper');

    // Warangal Enumamula: lat 17.9785, lng 79.5941 -> coordinates: [79.5941, 17.9785]
    const warangal = MARKETS.find((m) => m.name.includes('Warangal'));
    assert.ok(warangal, 'Warangal APMC must exist');
    assert.equal(warangal.location.coordinates[0], 79.5941, 'First element of GeoJSON coordinates must be Longitude');
    assert.equal(warangal.location.coordinates[1], 17.9785, 'Second element of GeoJSON coordinates must be Latitude');

    // Bowenpally Market: lat 17.4739, lng 78.4867
    const bowenpally = MARKETS.find((m) => m.name.includes('Bowenpally'));
    const distKm = haversineDistance(
      warangal.location.coordinates[1],
      warangal.location.coordinates[0],
      bowenpally.location.coordinates[1],
      bowenpally.location.coordinates[0]
    );

    // Approximate distance Warangal to Secunderabad is ~130-140 km
    assert.ok(distKm > 120 && distKm < 155, `Warangal to Bowenpally distance should be ~130-145 km, got ${distKm.toFixed(1)} km`);
  });

  // Test Case 12: Radius filtering and outside-radius fallback metadata
  test('Test Case 12: Search radius filters correctly and sets withinRequestedRadius: false on fallback', () => {
    // 1. From Warangal with a 50 km radius: should find Warangal APMC
    const tightRadiusResp = compareInMemory({
      cropId: 'crop_1',
      quantity: 1000,
      quality: 'A',
      lat: 17.9785,
      lng: 79.5941,
      radiusKm: 50,
      vehicleType: 'small_pickup',
    });

    assert.ok(tightRadiusResp.results.length > 0, 'Should find at least 1 market in 50 km radius');
    assert.equal(tightRadiusResp.metadata.withinRequestedRadius, true, 'Metadata withinRequestedRadius must be true');
    tightRadiusResp.results.forEach((r) => {
      assert.ok(r.distanceKm <= 50, `All returned markets must be <= 50 km, found ${r.distanceKm} km`);
      assert.equal(r.withinRequestedRadius, true);
    });

    // 2. From New Delhi (far from AP/Telangana) with 50 km radius: triggers fallback with withinRequestedRadius: false
    const distantLocationResp = compareInMemory({
      cropId: 'crop_1',
      quantity: 1000,
      quality: 'A',
      lat: 28.6139,
      lng: 77.2090,
      radiusKm: 50,
      vehicleType: 'small_pickup',
    });

    assert.ok(distantLocationResp.results.length > 0, 'Should return fallback nearest markets');
    assert.equal(distantLocationResp.metadata.withinRequestedRadius, false, 'Metadata withinRequestedRadius must be false for fallback');
    distantLocationResp.results.forEach((r) => {
      assert.equal(r.withinRequestedRadius, false, 'Fallback results must have withinRequestedRadius: false');
    });
  });
});
