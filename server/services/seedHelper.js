const mongoose = require('mongoose');

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

// 16 Real APMC Markets across Telangana & Andhra Pradesh
const MARKETS = [
  {
    name: 'Bowenpally Market Yard',
    location: { type: 'Point', coordinates: [78.4867, 17.4739] },
    address: 'Bowenpally, Secunderabad, Telangana',
    state: 'Telangana',
    district: 'Hyderabad',
    contactInfo: '+91-40-27742525',
    operatingHours: '4:00 AM – 1:00 PM',
  },
  {
    name: 'Gaddiannaram Fruit & Veg Mandi',
    location: { type: 'Point', coordinates: [78.5480, 17.3616] },
    address: 'Gaddiannaram, Dilsukhnagar, Hyderabad, Telangana',
    state: 'Telangana',
    district: 'Hyderabad',
    contactInfo: '+91-40-24054321',
    operatingHours: '5:00 AM – 2:00 PM',
  },
  {
    name: 'Shamshabad Agri Market',
    location: { type: 'Point', coordinates: [78.4210, 17.2543] },
    address: 'Shamshabad NH 44, Ranga Reddy, Telangana',
    state: 'Telangana',
    district: 'Ranga Reddy',
    contactInfo: '+91-40-24010000',
    operatingHours: '6:00 AM – 2:00 PM',
  },
  {
    name: 'Warangal Enumamula APMC Market',
    location: { type: 'Point', coordinates: [79.5941, 17.9785] },
    address: 'Enumamula Yard, Warangal, Telangana',
    state: 'Telangana',
    district: 'Warangal',
    contactInfo: '+91-870-2570234',
    operatingHours: '5:30 AM – 3:00 PM',
  },
  {
    name: 'Nizamabad APMC Market',
    location: { type: 'Point', coordinates: [78.0941, 18.6725] },
    address: 'Main Yard, Nizamabad, Telangana',
    state: 'Telangana',
    district: 'Nizamabad',
    contactInfo: '+91-8462-220100',
    operatingHours: '5:30 AM – 1:30 PM',
  },
  {
    name: 'Karimnagar Agri Market Yard',
    location: { type: 'Point', coordinates: [79.1288, 18.4386] },
    address: 'Collectorate Road, Karimnagar, Telangana',
    state: 'Telangana',
    district: 'Karimnagar',
    contactInfo: '+91-878-2245600',
    operatingHours: '6:00 AM – 2:00 PM',
  },
  {
    name: 'Khammam APMC Chilli & Grain Mandi',
    location: { type: 'Point', coordinates: [80.1514, 17.2473] },
    address: 'Wyra Road, Khammam, Telangana',
    state: 'Telangana',
    district: 'Khammam',
    contactInfo: '+91-8742-231150',
    operatingHours: '5:00 AM – 2:30 PM',
  },
  {
    name: 'Mahbubnagar APMC Market Yard',
    location: { type: 'Point', coordinates: [77.9827, 16.7488] },
    address: 'Raichur Road, Mahbubnagar, Telangana',
    state: 'Telangana',
    district: 'Mahbubnagar',
    contactInfo: '+91-8542-225300',
    operatingHours: '6:00 AM – 1:30 PM',
  },
  {
    name: 'Nalgonda APMC Market',
    location: { type: 'Point', coordinates: [79.2674, 17.0575] },
    address: 'Clock Tower Road, Nalgonda, Telangana',
    state: 'Telangana',
    district: 'Nalgonda',
    contactInfo: '+91-8682-222800',
    operatingHours: '5:30 AM – 2:00 PM',
  },
  {
    name: 'Suryapet APMC Yard',
    location: { type: 'Point', coordinates: [79.6236, 17.1439] },
    address: 'Khammam Bypass Road, Suryapet, Telangana',
    state: 'Telangana',
    district: 'Suryapet',
    contactInfo: '+91-8684-220450',
    operatingHours: '6:00 AM – 2:00 PM',
  },
  {
    name: 'Siddipet Integrated Market Yard',
    location: { type: 'Point', coordinates: [78.8522, 18.1018] },
    address: 'Hyderabad Road, Siddipet, Telangana',
    state: 'Telangana',
    district: 'Siddipet',
    contactInfo: '+91-8457-221200',
    operatingHours: '5:30 AM – 1:00 PM',
  },
  {
    name: 'Miryalaguda Major Rice Mandi',
    location: { type: 'Point', coordinates: [79.5637, 16.8722] },
    address: 'Industrial Area, Miryalaguda, Telangana',
    state: 'Telangana',
    district: 'Nalgonda',
    contactInfo: '+91-8689-252110',
    operatingHours: '6:00 AM – 4:00 PM',
  },
  {
    name: 'Adilabad Cotton & Grain Yard',
    location: { type: 'Point', coordinates: [78.5320, 19.6641] },
    address: 'APMC Complex, Adilabad, Telangana',
    state: 'Telangana',
    district: 'Adilabad',
    contactInfo: '+91-8732-226400',
    operatingHours: '6:00 AM – 1:00 PM',
  },
  {
    name: 'Guntur Asia-Largest Mirchi Yard',
    location: { type: 'Point', coordinates: [80.4365, 16.3067] },
    address: 'Mirchi Yard Road, Guntur, Andhra Pradesh',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    contactInfo: '+91-863-2234500',
    operatingHours: '4:00 AM – 3:00 PM',
  },
  {
    name: 'Kurnool APMC Onion & Grain Yard',
    location: { type: 'Point', coordinates: [78.0373, 15.8281] },
    address: 'Bellary Road, Kurnool, Andhra Pradesh',
    state: 'Andhra Pradesh',
    district: 'Kurnool',
    contactInfo: '+91-8518-241200',
    operatingHours: '5:00 AM – 2:00 PM',
  },
  {
    name: 'Vijayawada Gollapudi Wholesale Market',
    location: { type: 'Point', coordinates: [80.5753, 16.5417] },
    address: 'Gollapudi, Vijayawada, Andhra Pradesh',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    contactInfo: '+91-866-2415800',
    operatingHours: '4:30 AM – 2:00 PM',
  },
];

// Base prices per crop (₹/kg) across all 16 markets
const BASE_PRICES = {
  Tomato:   [24, 25, 22, 20, 18, 19, 21, 18, 20, 21, 22, 19, 17, 26, 23, 27],
  Onion:    [22, 23, 20, 18, 16, 17, 19, 17, 18, 19, 20, 17, 16, 21, 24, 22],
  Potato:   [18, 19, 17, 15, 14, 15, 16, 14, 15, 16, 17, 15, 13, 20, 18, 21],
  Brinjal:  [16, 17, 15, 13, 12, 14, 14, 12, 13, 14, 15, 13, 11, 18, 16, 19],
  Chilli:   [95, 98, 90, 88, 80, 82, 105, 84, 86, 92, 88, 85, 78, 120, 92, 110],
  Turmeric: [85, 88, 80, 78, 92, 82, 79, 74, 76, 78, 81, 75, 70, 90, 82, 94],
  Rice:     [32, 33, 30, 28, 27, 29, 28, 27, 29, 30, 31, 35, 26, 31, 29, 34],
  Wheat:    [25, 26, 24, 22, 21, 23, 22, 22, 23, 24, 25, 22, 21, 27, 25, 28],
  Maize:    [21, 22, 19, 18, 17, 19, 18, 17, 18, 19, 20, 18, 16, 22, 20, 23],
  Cotton:   [62, 64, 58, 60, 56, 59, 61, 55, 57, 58, 60, 56, 68, 65, 59, 66],
};

const QUALITY_MULTIPLIERS = { A: 1.0, B: 0.85, C: 0.70 };

function randomVariation(base) {
  return Math.round(base * (0.92 + Math.random() * 0.16) * 100) / 100;
}

async function autoSeedDatabase(Crop, Market, PriceRecord) {
  const count = await Crop.countDocuments();
  if (count > 0) {
    return; // Already seeded
  }

  console.log('🌾 Initializing and auto-seeding mock markets and crops...');
  const cropDocs = await Crop.insertMany(CROPS);
  const allCropIds = cropDocs.map((c) => c._id);
  const marketDataWithCrops = MARKETS.map((m) => ({
    ...m,
    supportedCrops: allCropIds,
  }));
  const marketDocs = await Market.insertMany(marketDataWithCrops);

  const priceRecords = [];
  const now = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    marketDocs.forEach((market, mIdx) => {
      cropDocs.forEach((crop) => {
        const basePrices = BASE_PRICES[crop.name];
        if (!basePrices) return;
        const basePrice = basePrices[mIdx] || basePrices[0];

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

  const BATCH_SIZE = 500;
  for (let i = 0; i < priceRecords.length; i += BATCH_SIZE) {
    await PriceRecord.insertMany(priceRecords.slice(i, i + BATCH_SIZE));
  }
  console.log(`✅ Auto-seed complete: ${cropDocs.length} crops, ${marketDocs.length} markets, ${priceRecords.length} prices.`);
}

module.exports = { autoSeedDatabase, CROPS, MARKETS, BASE_PRICES, QUALITY_MULTIPLIERS };

