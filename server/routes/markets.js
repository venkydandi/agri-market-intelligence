const express = require('express');
const Market = require('../models/Market');
const PriceRecord = require('../models/PriceRecord');
const Crop = require('../models/Crop');
const { MARKETS, CROPS, BASE_PRICES, QUALITY_MULTIPLIERS, getDeterministicHistoricalPrice } = require('../services/seedHelper');
const { isConnected } = require('../db');

const router = express.Router();

const fallbackMarkets = MARKETS.map((m, i) => ({
  _id: `market_${i + 1}`,
  ...m,
}));

// ─── GET /api/markets/trends ──────────────────────────────────────────────────
// Returns 30-day historical prices for top markets for a selected crop
router.get('/trends', async (req, res) => {
  const { cropId, quality = 'A' } = req.query;
  const validQuality = ['A', 'B', 'C'].includes(quality) ? quality : 'A';

  // 1. Resolve crop
  let cropName = 'Tomato';
  let cropObjectId = null;

  if (cropId && cropId.startsWith('crop_')) {
    const idx = parseInt(cropId.replace('crop_', ''), 10) - 1;
    if (CROPS[idx]) cropName = CROPS[idx].name;
  } else if (cropId) {
    const matched = CROPS.find((c) => c.name.toLowerCase() === String(cropId).toLowerCase() || c._id === cropId);
    if (matched) cropName = matched.name;
  }

  // 2. If DB is connected, fetch genuine PriceRecords
  if (isConnected()) {
    try {
      let cropDoc = null;
      if (cropId && require('mongoose').Types.ObjectId.isValid(cropId)) {
        cropDoc = await Crop.findById(cropId);
      } else {
        cropDoc = await Crop.findOne({ name: cropName });
      }

      if (cropDoc) {
        cropObjectId = cropDoc._id;
        cropName = cropDoc.name;
      }

      const activeMarkets = await Market.find({ isActive: true }).limit(4);
      if (activeMarkets.length > 0 && cropObjectId) {
        const marketIds = activeMarkets.map((m) => m._id);
        const marketMap = {};
        activeMarkets.forEach((m) => {
          marketMap[m._id.toString()] = m.name;
        });

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

        const records = await PriceRecord.find({
          crop: cropObjectId,
          market: { $in: marketIds },
          quality: validQuality,
          date: { $gte: thirtyDaysAgo, $lte: now },
        })
          .sort({ date: 1 })
          .lean();

        if (records.length > 0) {
          // Group records by calendar day
          const dayMap = new Map();

          records.forEach((rec) => {
            const d = new Date(rec.date);
            const dateKey = d.toISOString().split('T')[0];
            const dateLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

            if (!dayMap.has(dateKey)) {
              dayMap.set(dateKey, {
                date: dateLabel,
                timestamp: rec.date.toISOString ? rec.date.toISOString() : new Date(rec.date).toISOString(),
                _dateObj: d,
              });
            }

            const dayObj = dayMap.get(dateKey);
            const mName = marketMap[rec.market.toString()];
            if (mName && dayObj[mName] === undefined) {
              dayObj[mName] = rec.pricePerUnit;
            }
          });

          // Sort chronologically ascending
          const sortedTrends = Array.from(dayMap.values())
            .sort((a, b) => a._dateObj - b._dateObj)
            .map(({ _dateObj, ...rest }) => rest);

          const isDemoData = records.some((r) => r.isDemoData || r.source === 'seed');

          return res.json({
            crop: cropName,
            quality: validQuality,
            markets: activeMarkets.map((m) => m.name),
            trends: sortedTrends,
            isDemoData,
            source: isDemoData ? 'seed' : 'api',
          });
        }
      }
    } catch (err) {
      console.warn('Trends DB query error, falling back to deterministic engine:', err.message);
    }
  }

  // 3. Deterministic In-Memory Historical Engine (Standalone fallback)
  // Pick top 4 representative APMC mandis
  const targetMarkets = fallbackMarkets.slice(0, 4);
  const trendPoints = [];
  const now = new Date();

  // Generate 15 intervals (every 2 days over last 30 days)
  for (let i = 14; i >= 0; i--) {
    const dayOffset = i * 2;
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(6, 0, 0, 0); // APMC morning auction time
    const dateLabel = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    const marketPrices = {};
    targetMarkets.forEach((m, idx) => {
      marketPrices[m.name] = getDeterministicHistoricalPrice(cropName, idx, validQuality, dayOffset);
    });

    trendPoints.push({
      date: dateLabel,
      timestamp: date.toISOString(),
      ...marketPrices,
    });
  }

  res.json({
    crop: cropName,
    quality: validQuality,
    markets: targetMarkets.map((m) => m.name),
    trends: trendPoints,
    isDemoData: true,
    source: 'seed',
  });
});

// ─── GET /api/markets ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { state, district, q } = req.query;

    if (isConnected()) {
      const filter = { isActive: true };
      if (state) filter.state = new RegExp(state, 'i');
      if (district) filter.district = new RegExp(district, 'i');
      if (q) {
        filter.$or = [
          { name: new RegExp(q, 'i') },
          { address: new RegExp(q, 'i') },
          { district: new RegExp(q, 'i') },
        ];
      }

      const markets = await Market.find(filter)
        .populate('supportedCrops', 'name category')
        .sort({ name: 1 });

      if (markets && markets.length > 0) {
        return res.json({ markets });
      }
    }

    let filtered = [...fallbackMarkets];
    if (district) {
      filtered = filtered.filter((m) => m.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.address.toLowerCase().includes(query) ||
          m.district.toLowerCase().includes(query)
      );
    }

    res.json({ markets: filtered });
  } catch (err) {
    res.json({ markets: fallbackMarkets });
  }
});

// ─── GET /api/markets/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    if (isConnected()) {
      const market = await Market.findById(req.params.id).populate(
        'supportedCrops',
        'name category unit'
      );
      if (market) return res.json({ market });
    }

    const market = fallbackMarkets.find((m) => m._id === req.params.id);
    if (!market) return res.status(404).json({ message: 'Market not found' });
    res.json({ market });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching market' });
  }
});

module.exports = router;
