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
      return res.status(400).json({
        message: errors.array().map((e) => e.msg).join(', '),
        errors: errors.array(),
      });
    }

    const {
      cropId,
      quantity,
      quality,
      location,
      radiusKm,
      vehicleType,
      costPerKm,
      laborCostPerTrip,
      loadingCostPerTrip,
      unloadingCostPerTrip,
      tollCostPerTrip,
      otherCost,
    } = req.body;

    try {
      const comparison = await compareMarkets({
        cropId,
        quantity: Number(quantity),
        quality,
        lat: Number(location.lat),
        lng: Number(location.lng),
        radiusKm: radiusKm ? Number(radiusKm) : 250,
        vehicleType: vehicleType || 'small_pickup',
        customRatePerKm: costPerKm !== undefined ? Number(costPerKm) : undefined,
        laborCostPerTrip: laborCostPerTrip ? Number(laborCostPerTrip) : 0,
        loadingCostPerTrip: loadingCostPerTrip ? Number(loadingCostPerTrip) : 0,
        unloadingCostPerTrip: unloadingCostPerTrip ? Number(unloadingCostPerTrip) : 0,
        tollCostPerTrip: tollCostPerTrip ? Number(tollCostPerTrip) : 0,
        otherCost: otherCost ? Number(otherCost) : 0,
      });

      if (!comparison.results || comparison.results.length === 0) {
        return res.json({
          message: 'No markets found with valid price data for this crop within search criteria.',
          results: [],
          total: 0,
          metadata: comparison.metadata || {},
        });
      }

      res.json({
        results: comparison.results,
        total: comparison.total,
        metadata: comparison.metadata,
      });
    } catch (err) {
      console.error('Compare error:', err);
      res.status(500).json({ message: err.message || 'Server error during comparison' });
    }
  }
);

module.exports = router;
