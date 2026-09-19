const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      unique: true,
    },
    aliases: {
      type: [String], // multilingual aliases e.g. ["tamatar", "టమాట"]
      default: [],
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal'],
      default: 'kg',
    },
    category: {
      type: String,
      enum: ['vegetable', 'fruit', 'grain', 'spice', 'oilseed', 'fiber'],
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', CropSchema);
