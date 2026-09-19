/**
 * Seed Script — AgriRoute Phase 1
 * Populates MongoDB with:
 *  - 10 crops
 *  - 5 markets in Telangana
 *  - PriceRecords for each market × crop × quality for the last 30 days
 *
 * Run: node server/scripts/seed.js
 */

// Load from server/.env (one level up from scripts/)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const Market = require('../models/Market');
const PriceRecord = require('../models/PriceRecord');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CROPS = [
  { name: 'Tomato',    aliases: ['tamatar', 'టమాట'],      unit: 'kg', category: 'vegetable' },
  { name: 'Onion',     aliases: ['pyaaz', 'ఉల్లిపాయ'],    unit: 'kg', category: 'vegetable' },
  { name: 'Potato',    aliases: ['aloo', 'బంగాళాదుంప'],   unit: 'kg', category: 'vegetable' },
  { name: 'Brinjal',   aliases: ['baingan', 'వంకాయ'],     unit: 'kg', category: 'vegetable' },
  { name: 'Chilli',    aliases: ['mirchi', 'మిర్చి'],      unit: 'kg', category: 'spice'     },
  { name: 'Turmeric',  aliases: ['haldi', 'పసుపు'],        unit: 'kg', category: 'spice'     },
  { name: 'Rice',      aliases: ['chawal', 'బియ్యం'],      unit: 'kg', category: 'grain'     },
  { name: 'Wheat',     aliases: ['gehun', 'గోధుమ'],        unit: 'kg', category: 'grain'     },
  { name: 'Maize',     aliases: ['makka', 'మొక్కజొన్న'],  unit: 'kg', category: 'grain'     },
  { name: 'Cotton',    aliases: ['kapas', 'పత్తి'],         unit: 'kg', category: 'fiber'     },
];

// 5 real APMC markets in Telangana with approximate coordinates
const MARKETS = [
  {
    name: 'Bowenpally Market',
    location: { type: 'Point', coordinates: [78.4867, 17.4739] },
    address: 'Bowenpally, Secunderabad, Telangana',
    state: 'Telangana',
    district: 'Hyderabad',
    contactInfo: '+91-40-27742525',
    operatingHours: '4:00 AM – 12:00 PM',
  },
  {
    name: 'Gaddiannaram Market',
    location: { type: 'Point', coordinates: [78.5480, 17.3616] },
    address: 'Gaddiannaram, Dilsukhnagar, Telangana',
    state: 'Telangana',
    district: 'Hyderabad',
    contactInfo: '+91-40-24054321',
    operatingHours: '5:00 AM – 1:00 PM',
  },
  {
    name: 'Shamshabad Market',
    location: { type: 'Point', coordinates: [78.4210, 17.2543] },
    address: 'Shamshabad, Ranga Reddy, Telangana',
    state: 'Telangana',
    district: 'Ranga Reddy',
    contactInfo: '+91-40-24010000',
    operatingHours: '6:00 AM – 2:00 PM',
  },
  {
    name: 'Warangal APMC Market',
    location: { type: 'Point', coordinates: [79.5941, 17.9785] },
    address: 'APMC Yard, Warangal, Telangana',
    state: 'Telangana',
    district: 'Warangal',
    contactInfo: '+91-870-2570234',
    operatingHours: '6:00 AM – 2:00 PM',
  },
  {
    name: 'Nizamabad Market',
    location: { type: 'Point', coordinates: [78.0941, 18.6725] },
    address: 'Main Market, Nizamabad, Telangana',
    state: 'Telangana',
    district: 'Nizamabad',
    contactInfo: '+91-8462-220100',
    operatingHours: '5:30 AM – 1:30 PM',
  },
];

// Base prices per crop (₹/kg) — realistic ranges for each market
// [bowenpally, gaddiannaram, shamshabad, warangal, nizamabad]
const BASE_PRICES = {
  Tomato:   [22, 24, 20, 18, 16],
  Onion:    [18, 20, 17, 15, 14],
  Potato:   [16, 17, 15, 13, 12],
  Brinjal:  [14, 16, 13, 11, 10],
  Chilli:   [90, 95, 85, 80, 75],
  Turmeric: [80, 85, 78, 72, 68],
  Rice:     [28, 30, 27, 25, 24],
  Wheat:    [22, 24, 21, 20, 19],
  Maize:    [18, 19, 17, 16, 15],
  Cotton:   [55, 58, 52, 50, 48],
};

// Quality multipliers
const QUALITY_MULTIPLIERS = { A: 1.0, B: 0.85, C: 0.70 };

// Random price variation ±10%
function randomVariation(base) {
  return Math.round(base * (0.9 + Math.random() * 0.2) * 100) / 100;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected\n');

  // Clear existing data
  console.log('🗑️   Clearing existing data...');
  await Promise.all([
    Crop.deleteMany({}),
    Market.deleteMany({}),
    PriceRecord.deleteMany({}),
  ]);

  // Insert crops
  console.log('🌾  Seeding crops...');
  const cropDocs = await Crop.insertMany(CROPS);
  const cropMap = {}; // name → document
  cropDocs.forEach((c) => (cropMap[c.name] = c));
  console.log(`   ✓ ${cropDocs.length} crops inserted`);

  // Insert markets (all crops supported by all markets)
  console.log('🏪  Seeding markets...');
  const allCropIds = cropDocs.map((c) => c._id);
  const marketDataWithCrops = MARKETS.map((m) => ({
    ...m,
    supportedCrops: allCropIds,
  }));
  const marketDocs = await Market.insertMany(marketDataWithCrops);
  console.log(`   ✓ ${marketDocs.length} markets inserted`);

  // Insert price records — 30 days of history for each market × crop × quality
  console.log('💰  Seeding price records (30 days × 5 markets × 10 crops × 3 qualities)...');
  const priceRecords = [];
  const now = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    marketDocs.forEach((market, mIdx) => {
      cropDocs.forEach((crop) => {
        const basePrices = BASE_PRICES[crop.name];
        if (!basePrices) return;
        const basePrice = basePrices[mIdx];

        ['A', 'B', 'C'].forEach((quality) => {
          const price = randomVariation(basePrice * QUALITY_MULTIPLIERS[quality]);
          priceRecords.push({
            market: market._id,
            crop: crop._id,
            pricePerUnit: price,
            quality,
            date,
            source: 'seed',
          });
        });
      });
    });
  }

  // Insert in batches to avoid memory issues
  const BATCH_SIZE = 500;
  for (let i = 0; i < priceRecords.length; i += BATCH_SIZE) {
    await PriceRecord.insertMany(priceRecords.slice(i, i + BATCH_SIZE));
  }
  console.log(`   ✓ ${priceRecords.length} price records inserted`);

  console.log('\n🎉  Seed complete!');
  console.log('\n📋  Crop IDs (use these to test /api/compare):');
  cropDocs.forEach((c) => console.log(`   ${c.name.padEnd(12)} → ${c._id}`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed error:', err);
  process.exit(1);
});
