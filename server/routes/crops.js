const express = require('express');
const Crop = require('../models/Crop');
const { CROPS } = require('../services/seedHelper');
const { isConnected } = require('../db');

const router = express.Router();

// Fallback in-memory crops with stable IDs
const fallbackCrops = CROPS.map((c, i) => ({
  _id: `crop_${i + 1}`,
  ...c,
}));

// ─── GET /api/crops ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    if (isConnected()) {
      const { category } = req.query;
      const filter = category ? { category } : {};
      const crops = await Crop.find(filter).sort({ name: 1 });
      if (crops && crops.length > 0) {
        return res.json({ crops });
      }
    }
    // Fallback to in-memory crops
    const { category } = req.query;
    const crops = category ? fallbackCrops.filter((c) => c.category === category) : fallbackCrops;
    res.json({ crops });
  } catch (err) {
    res.json({ crops: fallbackCrops });
  }
});

// ─── GET /api/crops/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    if (isConnected()) {
      const crop = await Crop.findById(req.params.id);
      if (crop) return res.json({ crop });
    }
    const crop = fallbackCrops.find((c) => c._id === req.params.id || c.name.toLowerCase() === req.params.id.toLowerCase());
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ crop });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching crop' });
  }
});

module.exports = router;
