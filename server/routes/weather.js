const express = require('express');
const { getCityWeather } = require('../services/weatherService');

const router = express.Router();

router.get('/', async (req, res) => {
  const { city = 'Hyderabad', lat, lng } = req.query;
  try {
    const weather = await getCityWeather(city, lat, lng);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving weather' });
  }
});

module.exports = router;
