import { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const MARKET_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

export default function PriceTrendChart({ cropId, cropName = 'Crop', quality = 'A' }) {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (!cropId) return;
    setLoading(true);
    api
      .get(`/markets/trends?cropId=${cropId}&quality=${quality}`)
      .then((res) => {
        setTrendsData(res.data);
      })
      .catch((err) => {
        console.warn('Could not fetch price trends:', err);
      })
      .finally(() => setLoading(false));
  }, [cropId, quality]);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading 30-day APMC historical price trends...</p>
      </div>
    );
  }

  if (!trendsData || !trendsData.trends || trendsData.trends.length === 0) {
    return null;
  }

  const { markets, trends } = trendsData;

  // Compute min & max prices across all markets
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  trends.forEach((t) => {
    markets.forEach((m) => {
      const val = t[m];
      if (val !== undefined) {
        if (val < minPrice) minPrice = val;
        if (val > maxPrice) maxPrice = val;
      }
    });
  });

  const padding = (maxPrice - minPrice) * 0.15 || 5;
  const yMin = Math.max(0, Math.floor(minPrice - padding));
  const yMax = Math.ceil(maxPrice + padding);
  const yRange = yMax - yMin || 1;

  const chartWidth = 640;
  const chartHeight = 220;
  const margin = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const getX = (idx) => margin.left + (idx / (trends.length - 1)) * innerWidth;
  const getY = (val) => margin.top + innerHeight - ((val - yMin) / yRange) * innerHeight;

  // Active hover point or default to last trend point
  const activeData = hoveredPoint || trends[trends.length - 1];

  return (
    <div className="card border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-gray-800 text-lg">
              30-Day APMC Price Trends — {cropName} (Grade {quality})
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare wholesale rates (₹/kg) across leading mandis to identify peak selling windows.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {markets.map((m, i) => (
            <div key={m} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: MARKET_COLORS[i % MARKET_COLORS.length] }}
              />
              <span className="text-gray-700 font-medium">{m.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto max-h-[300px] select-none"
        >
          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const yVal = Math.round(yMin + ratio * yRange);
            const yPos = getY(yVal);
            return (
              <g key={ratio}>
                <line
                  x1={margin.left}
                  y1={yPos}
                  x2={chartWidth - margin.right}
                  y2={yPos}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9ca3af"
                  fontWeight="600"
                >
                  ₹{yVal}
                </text>
              </g>
            );
          })}

          {/* X-axis labels (every 3rd point) */}
          {trends.map((t, idx) => {
            if (idx % 3 !== 0 && idx !== trends.length - 1) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={chartHeight - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontWeight="500"
              >
                {t.date}
              </text>
            );
          })}

          {/* Price Lines per Market */}
          {markets.map((marketName, mIdx) => {
            const color = MARKET_COLORS[mIdx % MARKET_COLORS.length];
            const points = trends.map((t, idx) => {
              const val = t[marketName];
              return `${getX(idx)},${getY(val)}`;
            });

            const pathD = `M ${points.join(' L ')}`;

            return (
              <g key={marketName}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots on points */}
                {trends.map((t, idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(t[marketName])}
                    r={hoveredPoint && hoveredPoint.date === t.date ? 5 : 2.5}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(t)}
                  />
                ))}
              </g>
            );
          })}

          {/* Hover indicator vertical line */}
          {hoveredPoint && (
            <line
              x1={getX(trends.indexOf(hoveredPoint))}
              y1={margin.top}
              x2={getX(trends.indexOf(hoveredPoint))}
              y2={margin.top + innerHeight}
              stroke="#6b7280"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>

      {/* Interactive Tooltip Card */}
      {activeData && (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Recorded on: {activeData.date}</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {markets.map((m, i) => (
              <div key={m} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: MARKET_COLORS[i % MARKET_COLORS.length] }}
                />
                <span className="text-gray-600">{m.split(' ')[0]}:</span>
                <strong className="text-gray-900 font-extrabold">₹{activeData[m]}/kg</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
