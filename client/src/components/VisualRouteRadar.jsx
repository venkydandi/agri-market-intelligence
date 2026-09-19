import { useState } from 'react';
import { Navigation, MapPin, Truck, ExternalLink, Award, Phone, Clock } from 'lucide-react';

export default function VisualRouteRadar({ origin, results = [], cropName = 'Produce', quantity = 1000 }) {
  const [selectedMarket, setSelectedMarket] = useState(results[0] || null);

  if (!results || results.length === 0) return null;

  const topMarkets = results.slice(0, 6);
  const bestMarket = results[0];

  // Calculate bounding coordinates to project into radar SVG canvas
  const originLat = Number(origin.lat) || 17.385;
  const originLng = Number(origin.lng) || 78.486;

  // Relative canvas coordinates (Center = 250, 200)
  const centerX = 260;
  const centerY = 210;
  const scale = 2.8; // px per km scale

  return (
    <div className="card border border-emerald-500/20 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-950 text-white p-6 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-lg font-extrabold text-gray-100 flex items-center gap-2">
              Geospatial Route Radar & Logistics Hub
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Visualizing dispatch from <strong className="text-emerald-400">{origin.label || 'Your Location'}</strong> to regional APMC mandis.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-gray-300">#1 Highest Return</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-gray-300">Alternate Mandis</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-center">
        {/* Radar Map Canvas */}
        <div className="lg:col-span-7 relative h-[380px] bg-gray-950/80 rounded-2xl border border-gray-800 overflow-hidden flex items-center justify-center">
          {/* Radar background circles & crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[120px] h-[120px] rounded-full border border-emerald-500/40" />
            <div className="w-[220px] h-[220px] rounded-full border border-emerald-500/30 absolute" />
            <div className="w-[320px] h-[320px] rounded-full border border-emerald-500/20 absolute" />
            <div className="w-[420px] h-[420px] rounded-full border border-emerald-500/10 absolute" />
            <div className="h-full w-[1px] bg-emerald-500/20 absolute" />
            <div className="w-full h-[1px] bg-emerald-500/20 absolute" />
          </div>

          <svg className="w-full h-full" viewBox="0 0 520 420">
            <defs>
              <linearGradient id="routeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Route Lines */}
            {topMarkets.map((r, i) => {
              const coords = r.market.coordinates || { lat: 17.5, lng: 78.5 };
              const dLng = (coords.lng - originLng) * 80;
              const dLat = -(coords.lat - originLat) * 80; // Invert lat for SVG Y
              const targetX = Math.max(40, Math.min(480, centerX + dLng));
              const targetY = Math.max(40, Math.min(380, centerY + dLat));

              const isBest = r.rank === 1;
              const isSelected = selectedMarket && selectedMarket.market._id === r.market._id;

              return (
                <g key={r.market._id} onClick={() => setSelectedMarket(r)} className="cursor-pointer">
                  {/* Route path */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={targetX}
                    y2={targetY}
                    stroke={isBest ? '#10b981' : isSelected ? '#60a5fa' : '#4b5563'}
                    strokeWidth={isBest ? 2.5 : 1.5}
                    strokeDasharray={isBest ? 'none' : '4 3'}
                    filter={isBest ? 'url(#glow)' : undefined}
                    opacity={isSelected || isBest ? 0.9 : 0.4}
                  />

                  {/* Animated truck on #1 route */}
                  {isBest && (
                    <circle r="4" fill="#34d399" filter="url(#glow)">
                      <animateMotion
                        path={`M ${centerX} ${centerY} L ${targetX} ${targetY}`}
                        dur="3.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Mandi Node Pin */}
                  <g transform={`translate(${targetX}, ${targetY})`}>
                    <circle
                      r={isBest ? 14 : 11}
                      fill={isBest ? '#065f46' : '#1f2937'}
                      stroke={isBest ? '#34d399' : isSelected ? '#60a5fa' : '#9ca3af'}
                      strokeWidth="2"
                      className="transition-transform hover:scale-125"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize={isBest ? '10' : '9'}
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      #{r.rank}
                    </text>
                    {/* Market Label */}
                    <text
                      textAnchor="middle"
                      dy={isBest ? 26 : 22}
                      fontSize="10"
                      fontWeight="600"
                      fill={isBest ? '#34d399' : '#d1d5db'}
                      className="select-none"
                    >
                      {r.market.name.split(' ')[0]} ({r.distanceKm}km)
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Farmer Origin (Center) */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <circle r="18" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="12;28" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="10" fill="#047857" stroke="#34d399" strokeWidth="2.5" />
              <text textAnchor="middle" dy="3.5" fontSize="8" fill="#ffffff" fontWeight="bold">
                YOU
              </text>
            </g>
          </svg>

          {/* Quick Route Switcher Pills */}
          <div className="absolute bottom-3 inset-x-3 flex gap-2 overflow-x-auto py-1 scrollbar-none">
            {topMarkets.map((r) => {
              const isSelected = selectedMarket && selectedMarket.market._id === r.market._id;
              return (
                <button
                  key={r.market._id}
                  onClick={() => setSelectedMarket(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  <span>#{r.rank}</span>
                  <span>{r.market.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75">({r.distanceKm}km)</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Market Logistics Details Card */}
        {selectedMarket && (
          <div className="lg:col-span-5 bg-gray-800/60 rounded-2xl p-5 border border-gray-700/80 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                      selectedMarket.rank === 1
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    Rank #{selectedMarket.rank} Recommendation
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-white mt-1">{selectedMarket.market.name}</h4>
                <p className="text-xs text-gray-400">{selectedMarket.market.district}, {selectedMarket.market.state}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">
                  ₹{selectedMarket.netReturn.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Projected Net</div>
              </div>
            </div>

            {/* Key Trip Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-gray-900/70 p-2.5 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-[10px]">Distance</div>
                <div className="font-bold text-white text-sm mt-0.5">{selectedMarket.distanceKm} km</div>
              </div>
              <div className="bg-gray-900/70 p-2.5 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-[10px]">Mandi Price</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">₹{selectedMarket.pricePerKg}/kg</div>
              </div>
              <div className="bg-gray-900/70 p-2.5 rounded-xl border border-gray-700">
                <div className="text-gray-400 text-[10px]">Freight Cost</div>
                <div className="font-bold text-red-400 text-sm mt-0.5">₹{selectedMarket.transportCost.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Mandi Timings & Contact */}
            <div className="text-xs text-gray-300 space-y-1.5 bg-gray-900/40 p-3 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Operating: <strong>{selectedMarket.market.operatingHours || '4:00 AM – 1:00 PM'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>Mandi Yard: <strong>{selectedMarket.market.contactInfo || '+91-40-27742525'}</strong></span>
              </div>
            </div>

            {/* Direct Google Maps Navigation Trigger */}
            <div className="pt-1 flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${selectedMarket.market.coordinates?.lat || originLat},${selectedMarket.market.coordinates?.lng || originLng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>
              {selectedMarket.market.contactInfo && (
                <a
                  href={`tel:${selectedMarket.market.contactInfo.replace(/[^0-9+]/g, '')}`}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2.5 rounded-xl text-xs flex items-center justify-center transition-colors"
                  title="Call APMC Mandi"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
