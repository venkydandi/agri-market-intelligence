/**
 * Weather Service for AgriRoute
 * Fetches live weather if WEATHER_API_KEY is configured; otherwise provides
 * deterministic regional estimates explicitly flagged as demo/fallback.
 */

async function getCityWeather(cityName = 'Hyderabad', lat, lng) {
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey && apiKey.trim().length > 0 && !apiKey.includes('your_')) {
    try {
      let url = '';
      if (lat && lng) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)},IN&appid=${apiKey}&units=metric`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const temp = Math.round(data.main.temp);
        const humidity = data.main.humidity;
        const windSpeed = Math.round((data.wind.speed * 3.6)); // m/s to km/h
        const condition = data.weather?.[0]?.main || 'Clear';
        const isRainRisk = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle');

        return {
          cityName: data.name || cityName,
          temp,
          humidity,
          windSpeed,
          condition,
          isRainRisk,
          isDemo: false,
          source: 'OpenWeatherMap',
        };
      }
    } catch (err) {
      console.warn('Weather API fetch failed, falling back to deterministic estimate:', err.message);
    }
  }

  // Deterministic realistic regional weather based on city name hash
  const hash = cityName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const temp = 27 + (hash % 8);
  const humidity = 50 + (hash % 30);
  const windSpeed = 10 + (hash % 12);
  const isRainRisk = hash % 5 === 0;

  return {
    cityName,
    temp,
    humidity,
    windSpeed,
    condition: isRainRisk ? 'Light Showers' : 'Clear',
    isRainRisk,
    isDemo: true,
    source: 'regional_estimate',
  };
}

module.exports = { getCityWeather };
