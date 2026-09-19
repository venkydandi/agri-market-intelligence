const mongoose = require('mongoose');

const PriceRecordSchema = new mongoose.Schema(
  {
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: 0,
    },
    quality: {
      type: String,
      enum: ['A', 'B', 'C'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['api', 'manual', 'seed'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

// Compound index for efficient latest-price lookups
PriceRecordSchema.index({ market: 1, crop: 1, quality: 1, date: -1 });

module.exports = mongoose.model('PriceRecord', PriceRecordSchema);
