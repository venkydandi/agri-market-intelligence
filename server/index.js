require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, isConnected } = require('./db');

const authRoutes = require('./routes/auth');
const compareRoutes = require('./routes/compare');
const cropRoutes = require('./routes/crops');
const marketRoutes = require('./routes/markets');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isConnected() ? 'database' : 'standalone_memory',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/markets', marketRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  AgriRoute server running on http://localhost:${PORT}`);
  });
}

start();
