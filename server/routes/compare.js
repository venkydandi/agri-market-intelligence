const express = require('express');
const { body, validationResult } = require('express-validator');
const { compareMarkets } = require('../services/compareService');

const router = express.Router();

// ─── POST /api/compare ────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('cropId').notEmpty().withMessage('cropId is required'),
    body('quantity')
      .isFloat({ min: 1 })
      .withMessage('quantity must be a positive number'),
    body('quality')
      .isIn(['A', 'B', 'C'])
      .withMessage('quality must be A, B, or C'),
    body('location.lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude required'),
    body('location.lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cropId, quantity, quality, location, radiusKm, vehicleType, costPerKm, laborCostPerTrip } = req.body;

    try {
      const results = await compareMarkets({
        cropId,
        quantity: Number(quantity),
        quality,
        lat: location.lat,
        lng: location.lng,
        radiusKm: radiusKm ? Number(radiusKm) : 250,
        vehicleType: vehicleType || 'small_pickup',
        customRatePerKm: costPerKm ? Number(costPerKm) : undefined,
        laborCostPerTrip: laborCostPerTrip ? Number(laborCostPerTrip) : 0,
      });

      if (results.length === 0) {
        return res.json({
          message: 'No markets found with price data for this crop within the search radius.',
          results: [],
        });
      }

      res.json({ results, total: results.length });
    } catch (err) {
      console.error('Compare error:', err);
      res.status(500).json({ message: 'Server error during comparison' });
    }
  }
);

module.exports = router;
