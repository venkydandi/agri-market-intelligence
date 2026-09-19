import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import TiltCard from '../components/TiltCard';
import { Search, MapPin, Phone, Clock, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MarketsExplorer() {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/markets')
      .then((res) => {
        setMarkets(res.data.markets || []);
      })
      .catch((err) => {
        console.error('Failed to fetch markets:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const districts = ['All', ...new Set(markets.map((m) => m.district).filter(Boolean))];

  const filteredMarkets = markets.filter((m) => {
    const matchesDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q) ||
      m.state.toLowerCase().includes(q) ||
      m.address.toLowerCase().includes(q);
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200 mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Government APMC Mandis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {t('directoryTitle')}
        </h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed">
          {t('directoryDesc')}
        </p>
      </div>

      {/* Search & District Filter Controls */}
      <div className="card mb-8 p-4 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            placeholder={t('searchMandi')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* District Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-gray-400 font-semibold uppercase text-[10px] whitespace-nowrap mr-1">
            District:
          </span>
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedDistrict === d
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d === 'All' ? t('allDistricts') : d}
            </button>
          ))}
        </div>
      </div>

      {/* Markets Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading APMC Mandi database...</p>
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-gray-700">No mandis found matching your filter</h3>
          <p className="text-sm text-gray-400 mt-1">Try searching another district or reset your query.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDistrict('All');
            }}
            className="mt-4 btn-secondary text-xs py-2 px-4 inline-block"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((m) => {
            const coords = m.location?.coordinates || [78.48, 17.47];
            const [lng, lat] = coords;
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

            return (
              <TiltCard key={m._id} intensity={6} className="h-full rounded-2xl">
                <div className="card border border-gray-200/80 p-6 flex flex-col justify-between h-full bg-white hover:border-emerald-400 hover:shadow-lg transition-all rounded-2xl">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase">
                        {m.state}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">{m.district}</span>
                    </div>

                    <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{m.name}</h3>

                    <div className="mt-3 text-xs text-gray-500 space-y-2 border-t border-gray-100 pt-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{m.address}</span>
                      </div>

                      {m.operatingHours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>{m.operatingHours}</span>
                        </div>
                      )}

                      {m.contactInfo && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <a
                            href={`tel:${m.contactInfo.replace(/[^0-9+]/g, '')}`}
                            className="font-bold text-gray-700 hover:text-emerald-600 hover:underline"
                          >
                            {m.contactInfo}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Map</span>
                    </a>

                    <Link
                      to={`/compare?district=${encodeURIComponent(m.district)}`}
                      className="btn-primary py-1.5 px-3 rounded-xl font-bold flex items-center gap-1 text-xs"
                    >
                      <span>Compare Here</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
