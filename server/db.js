const mongoose = require('mongoose');
const Crop = require('./models/Crop');
const Market = require('./models/Market');
const PriceRecord = require('./models/PriceRecord');
const { autoSeedDatabase } = require('./services/seedHelper');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const isTemplateUri = !uri || uri.includes('<username>') || uri.includes('xxxxx');

  // 1. Try configured MONGODB_URI if it's not a template
  if (!isTemplateUri) {
    try {
      console.log('🔄 Connecting to configured MongoDB Atlas / URI...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB Atlas / URI');
      isConnected = true;
      await autoSeedDatabase(Crop, Market, PriceRecord);
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to configured MONGODB_URI:', err.message);
    }
  } else {
    console.log('ℹ️ MONGODB_URI is using a placeholder template.');
  }

  // 2. Try local MongoDB instance (127.0.0.1:27017)
  try {
    console.log('🔄 Checking local MongoDB instance (mongodb://127.0.0.1:27017/agri-route)...');
    await mongoose.connect('mongodb://127.0.0.1:27017/agri-route', { serverSelectionTimeoutMS: 1500 });
    console.log('✅ Connected to local MongoDB instance');
    isConnected = true;
    await autoSeedDatabase(Crop, Market, PriceRecord);
    return;
  } catch (err) {
    console.log('ℹ️ Local MongoDB instance not running.');
  }

  console.log('⚡ Running in In-Memory Standalone Mode with seeded Telangana markets & crops.');
}

module.exports = { connectDB, isConnected: () => isConnected };
