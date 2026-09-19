const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Market name is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    supportedCrops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
      },
    ],
    contactInfo: {
      type: String,
      default: '',
    },
    operatingHours: {
      type: String,
      default: '6:00 AM – 2:00 PM',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geospatial index — required for $nearSphere queries
MarketSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Market', MarketSchema);
