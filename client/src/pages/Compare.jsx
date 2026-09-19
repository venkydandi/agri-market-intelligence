import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import MarketCard from '../components/MarketCard';
import CompareTable from '../components/CompareTable';
import VisualRouteRadar from '../components/VisualRouteRadar';
import PriceTrendChart from '../components/PriceTrendChart';
import WeatherAdvisory from '../components/WeatherAdvisory';
import { searchCities, getNearestCity, POPULAR_CITIES } from '../data/cities';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  Search,
  MapPin,
  Truck,
  Navigation,
  Sparkles,
  Sliders,
  Share2,
  Printer,
  ChevronDown,
  Info,
  CheckCircle2,
  Award,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export default function Compare() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({
    cropId: '',
    quantity: '1000',
    quality: 'A',
    vehicleType: 'small_pickup',
    radiusKm: 250,
  });

  // City & Location State
  const [cityInput, setCityInput] = useState('Warangal');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [cityMatches, setCityMatches] = useState([]);
  const [location, setLocation] = useState({
    lat: 17.9785,
    lng: 79.5941,
    label: 'Warangal, Telangana',
    cityName: 'Warangal',
  });

  const [showManualCoords, setShowManualCoords] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'radar' | 'table' | 'trends'

  const cityDropdownRef = useRef(null);

  // Load crops for dropdown
  useEffect(() => {
    api
      .get('/crops')
      .then((res) => {
        const cropList = res.data.crops || [];
        setCrops(cropList);
        if (cropList.length > 0 && !form.cropId) {
          setForm((prev) => ({ ...prev, cropId: cropList[0]._id }));
        }
      })
      .catch(() => setError('Could not load crops. Is the server running?'));
  }, []);

  // Handle URL pre-fill from district click in directory
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      const match = searchCities(districtParam);
      if (match.length > 0) {
        handleSelectCity(match[0]);
      }
    }
  }, [searchParams]);

  // City autocomplete handler
  const handleCityInputChange = (val) => {
    setCityInput(val);
    if (val.trim().length > 0) {
      const matches = searchCities(val);
      setCityMatches(matches);
      setCityDropdownOpen(true);
    } else {
      setCityMatches(POPULAR_CITIES);
      setCityDropdownOpen(true);
    }
  };

  const handleSelectCity = (c) => {
    setCityInput(`${c.name} (${c.district})`);
    setLocation({
      lat: c.lat,
      lng: c.lng,
      label: `${c.name}, ${c.district}, ${c.state}`,
      cityName: c.name,
    });
    setCityDropdownOpen(false);
    setError('');
  };

  // Click outside to close city dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GPS Geolocation with reverse lookup
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const nearest = getNearestCity(lat, lng);

        const label = nearest
          ? `📍 Near ${nearest.name} (~${nearest.distanceKm}km away)`
          : `📍 GPS: ${lat}, ${lng}`;

        setCityInput(nearest ? nearest.name : `${lat}, ${lng}`);
        setLocation({
          lat,
          lng,
          label,
          cityName: nearest ? nearest.name : 'Your Location',
        });
        setGeoLoading(false);
        setError('');
      },
      () => {
        setError('Could not access GPS coordinates. Please select your city from the list.');
        setGeoLoading(false);
      }
    );
  };

  // Submit comparison
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!location.lat || !location.lng) {
      setError('Please select your city or farm location.');
      return;
    }
    if (!form.cropId) {
      setError('Please select a crop.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await api.post('/compare', {
        cropId: form.cropId,
        quantity: Number(form.quantity),
        quality: form.quality,
        location: { lat: Number(location.lat), lng: Number(location.lng) },
        vehicleType: form.vehicleType,
        radiusKm: Number(form.radiusKm),
      });

      setResults(res.data);

      // Trigger celebratory confetti on high net return!
      if (res.data.results && res.data.results.length > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#f59e0b'],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Selected crop details
  const selectedCrop = crops.find((c) => c._id === form.cropId) || { name: 'Crop', category: '' };

  // Calculate potential Grade A arbitrage gain
  const bestResult = results?.results?.[0];
  const gradeArbitrageGain =
    form.quality !== 'A' && bestResult
      ? Math.round(bestResult.grossRevenue * (form.quality === 'B' ? 0.17 : 0.42))
      : null;

  // 1-Click WhatsApp full report share
  const handleShareSummary = () => {
    if (!bestResult) return;
    const shareText =
      `🌾 *AgriRoute Logistics & Profit Analysis*\n\n` +
      `*Origin City:* ${location.label}\n` +
      `*Produce:* ${selectedCrop.name} (${form.quantity} kg, Grade ${form.quality})\n` +
      `*Recommended Mandi:* ${bestResult.market.name}\n` +
      `*Distance:* ${bestResult.distanceKm} km\n` +
      `*Mandi Rate:* ₹${bestResult.pricePerKg}/kg\n` +
      `*Gross Revenue:* ₹${bestResult.grossRevenue.toLocaleString('en-IN')}\n` +
      `*Est. Freight Cost:* ₹${bestResult.transportCost.toLocaleString('en-IN')}\n` +
      `*⭐ Take-Home Net Return:* ₹${bestResult.netReturn.toLocaleString('en-IN')}*\n\n` +
      `Generated via AgriRoute — Intelligent Mandi Logistics.`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Time Geospatial Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {t('compareTitle')}
        </h1>
        <p className="mt-2 text-gray-500 text-sm">{t('compareDesc')}</p>
      </div>

      {/* Main Configuration Card */}
      <div className="card mb-8 p-6 sm:p-8 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-3xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Crop Selection, Quantity, Quality Grade */}
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('cropLabel')}
              </label>
              <select
                className="input-field py-2.5 font-medium text-gray-800"
                value={form.cropId}
                onChange={(e) => setForm({ ...form, cropId: e.target.value })}
                required
              >
                <option value="">{t('selectCrop')}</option>
                {crops.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('quantityLabel')} (kg)
              </label>
              <input
                type="number"
                className="input-field py-2.5 font-medium text-gray-800"
                placeholder="e.g. 1000"
                min="10"
                step="50"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('qualityLabel')}
              </label>
              <select
                className="input-field py-2.5 font-medium text-gray-800"
                value={form.quality}
                onChange={(e) => setForm({ ...form, quality: e.target.value })}
              >
                <option value="A">{t('gradeA')}</option>
                <option value="B">{t('gradeB')}</option>
                <option value="C">{t('gradeC')}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Location by City / Geocoding Autocomplete */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t('locationLabel')}</span>
              </label>

              <button
                type="button"
                onClick={() => setShowManualCoords(!showManualCoords)}
                className="text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                {showManualCoords ? 'Hide Lat/Lng' : 'Manual Coordinates'}
              </button>
            </div>

            <div className="relative" ref={cityDropdownRef}>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="input-field pl-10 pr-4 py-2.5 font-medium text-gray-800"
                    placeholder={t('citySearchPlaceholder')}
                    value={cityInput}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    onFocus={() => {
                      if (cityMatches.length === 0) setCityMatches(POPULAR_CITIES);
                      setCityDropdownOpen(true);
                    }}
                  />
                  {cityDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 divide-y divide-gray-100 animate-fade-in">
                      {cityMatches.map((c) => (
                        <div
                          key={`${c.name}-${c.lat}`}
                          onClick={() => handleSelectCity(c)}
                          className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{c.name}</span>
                            <span className="text-gray-400 ml-1.5">
                              ({c.district}, {c.state})
                            </span>
                          </div>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {c.crops ? c.crops.slice(0, 2).join(', ') : 'APMC'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1-Click GPS Button */}
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  className="btn-secondary py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold"
                >
                  <Navigation className={`w-4 h-4 text-emerald-600 ${geoLoading ? 'animate-spin' : ''}`} />
                  <span>{geoLoading ? t('detectingGps') : t('useGps')}</span>
                </button>
              </div>

              {/* Selected Location Pill */}
              {location.label && (
                <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-xl w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected Origin: {location.label}</span>
                </div>
              )}
            </div>

            {/* Quick Cities Chips */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-gray-400 font-bold text-[11px] uppercase mr-1">
                {t('quickCities')}
              </span>
              {POPULAR_CITIES.slice(0, 7).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSelectCity(c)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    location.cityName === c.name
                      ? 'bg-gray-950 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Manual Lat/Lng Fields */}
            {showManualCoords && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 animate-slide-up">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Exact Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field py-2 text-xs rounded-xl"
                    value={location.lat}
                    onChange={(e) =>
                      setLocation({ ...location, lat: e.target.value, label: `Custom (${e.target.value}, ${location.lng})` })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Exact Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field py-2 text-xs rounded-xl"
                    value={location.lng}
                    onChange={(e) =>
                      setLocation({ ...location, lng: e.target.value, label: `Custom (${location.lat}, ${e.target.value})` })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Vehicle Type & Search Radius Controls */}
          <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('vehicleLabel')}
              </label>
              <select
                className="input-field py-2.5 text-xs font-semibold text-gray-800 rounded-2xl"
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
              >
                <option value="small_pickup">{t('smallPickup')}</option>
                <option value="auto">{t('autoCargo')}</option>
                <option value="medium_truck">{t('mediumTruck')}</option>
                <option value="heavy_truck">{t('heavyTruck')}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('radiusLabel')}: <span className="text-sky-600 font-extrabold">{form.radiusKm} km</span>
                </label>
                <span className="text-[11px] text-gray-400">Regional Reach</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={form.radiusKm}
                onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
                className="w-full accent-gray-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>50 km (Local)</span>
                <span>250 km (Regional)</span>
                <span>500 km (Interstate)</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Action - Machi Pill Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-pill-dark bg-gray-950 hover:bg-black text-white font-black text-base py-4 rounded-full shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>{t('calculating')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{t('calculateBtn')}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-fade-in">
          {/* Weather & Transit Advisory Banner */}
          <WeatherAdvisory
            cityName={location.cityName || 'Hyderabad'}
            cropName={selectedCrop.name}
          />

          {/* Quality Grade Arbitrage Alert */}
          {gradeArbitrageGain && gradeArbitrageGain > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💡</span>
                <div>
                  <span className="font-extrabold text-amber-900">Quality Arbitrage Opportunity: </span>
                  <span className="text-amber-800">
                    Grading and sorting your {selectedCrop.name} to <strong>Grade A</strong> before dispatch could earn you an extra{' '}
                    <strong className="text-emerald-700 font-black">+₹{gradeArbitrageGain.toLocaleString('en-IN')}</strong> in net profit!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, quality: 'A' });
                  handleSubmit();
                }}
                className="btn-primary py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap bg-amber-600 hover:bg-amber-700"
              >
                Upgrade to Grade A
              </button>
            </div>
          )}

          {results.results.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-xl font-bold text-gray-800">No Mandis Found Within {form.radiusKm} km</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                Try expanding the search radius slider to 350 km or 500 km to reach state-level APMC hubs.
              </p>
            </div>
          ) : (
            <>
              {/* Results Control Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {results.total} Mandi{results.total > 1 ? 's' : ''} Analyzed
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ranked by highest net return after fuel and transport deductions
                  </p>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === 'cards'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{t('viewCards')}</span>
                  </button>

                  <button
                    onClick={() => setViewMode('radar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === 'radar'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{t('viewRadar')}</span>
                  </button>

                  <button
                    onClick={() => setViewMode('trends')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === 'trends'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{t('viewTrends')}</span>
                  </button>

                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === 'table'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{t('viewTable')}</span>
                  </button>
                </div>

                {/* WhatsApp & Print Export */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareSummary}
                    className="btn-secondary py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('shareWhatsApp')}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="btn-secondary py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('printSlip')}</span>
                  </button>
                </div>
              </div>

              {/* View Content Display */}
              {viewMode === 'cards' && (
                <div className="space-y-4">
                  {results.results.map((r) => (
                    <MarketCard
                      key={r.market._id}
                      result={r}
                      originLocation={location}
                      cropName={selectedCrop.name}
                      quantity={form.quantity}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'radar' && (
                <VisualRouteRadar
                  origin={location}
                  results={results.results}
                  cropName={selectedCrop.name}
                  quantity={form.quantity}
                />
              )}

              {viewMode === 'trends' && (
                <PriceTrendChart
                  cropId={form.cropId}
                  cropName={selectedCrop.name}
                  quality={form.quality}
                />
              )}

              {viewMode === 'table' && (
                <CompareTable results={results.results} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
