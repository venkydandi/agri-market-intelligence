import TiltCard from './TiltCard';
import { MapPin, Truck, Phone, Navigation, Clock, Share2, TrendingUp, IndianRupee } from 'lucide-react';

const RANK_BADGES = {
  1: { badge: '🥇 #1 BEST RETURN', bg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white', border: 'border-emerald-400 ring-2 ring-emerald-400/30' },
  2: { badge: '🥈 #2 RECOMMENDED', bg: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white', border: 'border-gray-300' },
  3: { badge: '🥉 #3 OPTION', bg: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white', border: 'border-amber-300' },
};

function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function MarketCard({ result, originLocation = { lat: 17.385, lng: 78.486, label: '' }, cropName = 'Crop', quantity = 1000 }) {
  const {
    rank,
    market,
    pricePerKg,
    distanceKm,
    grossRevenue,
    transportCost,
    netReturn,
    quality,
    tripsNeeded = 1,
    vehicleName,
    profitMarginPercent,
  } = result;

  const style = RANK_BADGES[rank] || {
    badge: `#${rank} MARKET`,
    bg: 'bg-gray-100 text-gray-700',
    border: 'border-gray-200',
  };

  const marketLat = market.coordinates?.lat || 17.4739;
  const marketLng = market.coordinates?.lng || 78.4867;
  const originLat = originLocation.lat || 17.385;
  const originLng = originLocation.lng || 78.486;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${marketLat},${marketLng}&travelmode=driving`;

  const handleShare = () => {
    const text = `🌾 *AgriRoute Mandi Recommendation*\n\n` +
      `*Crop:* ${cropName} (${quantity} kg, Grade ${quality})\n` +
      `*Recommended Mandi:* ${market.name} (${market.district})\n` +
      `*Mandi Price:* ₹${pricePerKg}/kg\n` +
      `*Distance:* ${distanceKm} km\n` +
      `*Est. Transport Cost:* ₹${transportCost.toLocaleString('en-IN')}\n` +
      `*Gross Revenue:* ₹${grossRevenue.toLocaleString('en-IN')}\n` +
      `⭐ *Net Return:* ₹${netReturn.toLocaleString('en-IN')}*\n\n` +
      `Directions: ${googleMapsUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <TiltCard intensity={8} className="rounded-2xl">
      <div
        className={`card border-2 ${style.border} ${
          rank === 1 ? 'bg-gradient-to-b from-white to-emerald-50/40 shadow-xl' : 'bg-white shadow-sm'
        } p-6 transition-all duration-200 hover:shadow-xl rounded-2xl relative`}
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
          <div className="flex items-start gap-3">
            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${style.bg} shadow-sm self-start`}>
              {style.badge}
            </span>
            <div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">{market.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{market.district}, {market.state} • <span className="text-gray-400">{market.address}</span></span>
              </div>
            </div>
          </div>

          {/* Mandi Rate & Quality Grade */}
          <div className="text-left sm:text-right bg-emerald-50/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
            <div className="text-2xl font-black text-emerald-700">
              {formatCurrency(pricePerKg)}
              <span className="text-xs font-normal text-gray-500"> / kg</span>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center justify-start sm:justify-end gap-1.5">
              <span>Grade {quality} Rate</span>
              {result.isDemoData && (
                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100">
            <div className="flex items-center justify-center text-gray-400 mb-1">
              <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">{distanceKm} km</div>
            <div className="text-[11px] text-gray-400 font-medium">Road Distance</div>
          </div>

          <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100">
            <div className="flex items-center justify-center text-gray-400 mb-1">
              <Truck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">{tripsNeeded} Trip{tripsNeeded > 1 ? 's' : ''}</div>
            <div className="text-[11px] text-gray-400 font-medium">{vehicleName ? vehicleName.split(' ')[0] : 'Truck'}</div>
          </div>

          <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100">
            <div className="flex items-center justify-center text-gray-400 mb-1">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">{formatCurrency(grossRevenue)}</div>
            <div className="text-[11px] text-gray-400 font-medium">Gross Revenue</div>
          </div>

          <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100">
            <div className="flex items-center justify-center text-gray-400 mb-1">
              <Truck className="w-4 h-4 text-red-500" />
            </div>
            <div className="font-extrabold text-sm text-red-600">-{formatCurrency(transportCost)}</div>
            <div className="text-[11px] text-gray-400 font-medium">Freight Cost</div>
          </div>
        </div>

        {/* Net Return Highlight Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl px-5 py-3.5 shadow-md mb-4 gap-2">
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-100 block">
              💵 Final Take-Home Net Return (After All Costs)
            </span>
            {profitMarginPercent !== undefined && (
              <span className="text-[11px] text-emerald-200">
                Estimated Net Margin: <strong>{profitMarginPercent}%</strong>
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {formatCurrency(netReturn)}
          </div>
        </div>

        {/* Dynamic Recommendation Reasoning */}
        {result.recommendationReason?.primary && (
          <div className="bg-gray-50/90 border border-gray-100/90 rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{result.recommendationReason.primary}</span>
            </div>
            {result.recommendationReason.priceAdvantage && (
              <p className="text-[11px] text-gray-500">{result.recommendationReason.priceAdvantage}</p>
            )}
          </div>
        )}

        {/* Mandi Timings, Contact & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {market.operatingHours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> {market.operatingHours}
              </span>
            )}
            {market.contactInfo && (
              <a
                href={`tel:${market.contactInfo.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> {market.contactInfo}
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="btn-secondary py-2 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-dark py-2 px-5 rounded-full text-xs flex items-center gap-1.5 bg-gray-950 hover:bg-black text-white font-extrabold shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </a>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

