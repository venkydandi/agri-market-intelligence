import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, MapPin, Truck, Sparkles, ExternalLink } from 'lucide-react';
import TiltCard from './TiltCard';

export default function HeroFloatingCrops() {
  const [selectedCrop, setSelectedCrop] = useState('combo'); // 'combo' | 'chilli' | 'onion' | 'wheat'
  const [isHovered, setIsHovered] = useState(false);

  const CROP_MODES = {
    combo: {
      name: 'Fresh Vine Tomato & Sweet Corn',
      mandi: 'Warangal Enumamula Yard',
      returnRate: '+28% Net',
      subtext: 'TOP APMC RETURN',
      image: '/images/hero-crops.jpg',
      arrival: '480 Qtl / Day',
      transit: '142 km • Tata Ace (1.5T)',
      link: '/compare?crop=crop_1',
    },
    chilli: {
      name: 'Teja Premium Red Chilli',
      mandi: 'Guntur Asia Mirchi Yard',
      returnRate: '+41% Net',
      subtext: 'HIGH EXPORT ARBITRAGE',
      image: '/images/chilli.jpg',
      arrival: '1,200 Bags / Day',
      transit: '280 km • Eicher 5-Ton',
      link: '/compare?crop=crop_5',
    },
    onion: {
      name: 'Nashik & Kurnool Pink Onion',
      mandi: 'Bowenpally Wholesale Yard',
      returnRate: '+32% Net',
      subtext: 'FASTEST IN-TRANSIT CLEARANCE',
      image: '/images/onion.jpg',
      arrival: '850 Bags / Day',
      transit: '68 km • Small Pickup',
      link: '/compare?crop=crop_2',
    },
    wheat: {
      name: 'Sona Masoori Paddy Grain',
      mandi: 'Miryalaguda Mill Cluster',
      returnRate: '+24% Net',
      subtext: 'DIRECT MILL BUYER CONTRACT',
      image: '/images/wheat.jpg',
      arrival: '2,400 Bags / Day',
      transit: '115 km • Heavy 10-Ton',
      link: '/compare?crop=crop_7',
    },
  };

  const active = CROP_MODES[selectedCrop];

  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto flex flex-col items-center">
      {/* 3D Tilt Card Container matching user's uploaded image exactly */}
      <TiltCard intensity={14} className="relative z-20 cursor-pointer w-full">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sky-950/25 border-4 border-white/80 bg-gradient-to-b from-[#2e9ee8] to-[#60b5f1] backdrop-blur-md transition-all duration-300 group"
        >
          {/* Subtle 3D Glass Bevel Highlight */}
          <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none border border-white/50 shadow-inner z-30" />

          {/* Floating Atmospheric Droplet Shimmer Elements */}
          <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-white/70 blur-[1px] animate-pulse pointer-events-none z-20" />
          <div className="absolute top-12 right-8 w-2 h-2 rounded-full bg-white/60 blur-[0.5px] animate-ping pointer-events-none z-20" />
          <div className="absolute bottom-28 left-8 w-2.5 h-2.5 rounded-full bg-cyan-200/80 blur-[1px] pointer-events-none z-20 animate-bounce" />

          {/* Main 3D Crop Splash Image */}
          <div className="relative w-full aspect-square overflow-hidden bg-sky-200/30">
            <img
              src={active.image}
              alt={active.name}
              className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Live Mandi Status Pill (Top Left) */}
            <div className="absolute top-5 left-5 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold border border-white/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Bidding Active</span>
            </div>

            {/* Cold Chain Quality Badge (Top Right) */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-1 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-sky-900 text-[11px] font-extrabold border border-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>98.4% Fresh</span>
            </div>
          </div>

          {/* Bottom Floating Telemetry Card (Exact Replica of User Reference) */}
          <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-[1.6rem] shadow-xl border border-white/90 z-30 transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Blue Tracking Header */}
                <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-black text-sky-600">
                  {active.subtext}
                </div>
                {/* Mandi Name in Strong Dark Sans */}
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight truncate mt-0.5">
                  {active.mandi}
                </h3>
              </div>

              {/* +28% Net Emerald Pill Badge */}
              <div className="flex-shrink-0 flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{active.returnRate}</span>
              </div>
            </div>

            {/* Extended Telemetry on Hover / Mobile Always */}
            <div
              className={`pt-3 mt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] transition-all duration-300 ${
                isHovered ? 'opacity-100 max-h-24' : 'opacity-80 max-h-12'
              }`}
            >
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{active.transit}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{active.arrival}</span>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Interactive Quick-Crop Switcher Tabs */}
      <div className="mt-5 flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/40 shadow-lg text-white max-w-full overflow-x-auto">
        <button
          onClick={() => setSelectedCrop('combo')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            selectedCrop === 'combo'
              ? 'bg-white text-gray-950 shadow-md font-extrabold'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <span>🍅🌽 Tomato & Corn</span>
        </button>
        <button
          onClick={() => setSelectedCrop('chilli')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            selectedCrop === 'chilli'
              ? 'bg-white text-gray-950 shadow-md font-extrabold'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <span>🌶️ Chilli</span>
        </button>
        <button
          onClick={() => setSelectedCrop('onion')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            selectedCrop === 'onion'
              ? 'bg-white text-gray-950 shadow-md font-extrabold'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <span>🧅 Onion</span>
        </button>
        <button
          onClick={() => setSelectedCrop('wheat')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            selectedCrop === 'wheat'
              ? 'bg-white text-gray-950 shadow-md font-extrabold'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <span>🌾 Paddy</span>
        </button>
      </div>
    </div>
  );
}
