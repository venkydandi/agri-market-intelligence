import { useState } from 'react';
import { Link } from 'react-router-dom';
import TiltCard from '../components/TiltCard';
import HeroFloatingCrops from '../components/HeroFloatingCrops';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Sparkles, Navigation, CheckCircle, TrendingUp, Sun, Droplets, Zap } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  const BENTO_PRODUCTS = [
    {
      name: 'Grade A Hybrid Tomato',
      mandi: 'Bowenpally & Gaddiannaram',
      rate: '₹25/kg',
      desc: 'Firm, vine-ripened, and sorted for long-distance transit. High demand in Hyderabad wholesale yards.',
      bg: 'bg-[#f6eee3]', // Warm latte
      btnColor: 'bg-white hover:bg-gray-50 text-gray-900',
      image: '/images/tomato.jpg',
      cropId: 'crop_1',
    },
    {
      name: 'Teja Premium Chilli',
      mandi: 'Guntur Asia Mirchi Yard',
      rate: '₹120/kg',
      desc: 'High-pungency, sun-cured spice grade with continuous daily auction volumes in Guntur.',
      bg: 'bg-[#e2ede1]', // Soft matcha green
      btnColor: 'bg-white hover:bg-gray-50 text-gray-900',
      image: '/images/chilli.jpg',
      cropId: 'crop_5',
    },
    {
      name: 'Sona Masoori Rice Grain',
      mandi: 'Miryalaguda & Nizamabad',
      rate: '₹35/kg',
      desc: 'Aromatic harvested paddy ready for direct wholesale mill bidding across Telangana.',
      bg: 'bg-[#faecd8]', // Warm peach
      btnColor: 'bg-white hover:bg-gray-50 text-gray-900',
      image: '/images/wheat.jpg',
      cropId: 'crop_7',
    },
    {
      name: 'Nashik Red Onion',
      mandi: 'Kurnool & Bowenpally',
      rate: '₹24/kg',
      desc: 'Graded medium-to-large pink bulbs with steady inter-state trade and bulk demand.',
      bg: 'bg-[#f9e6e6]', // Soft blush berry
      btnColor: 'bg-white hover:bg-gray-50 text-gray-900',
      image: '/images/onion.jpg',
      cropId: 'crop_2',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-sky-500 selection:text-white">
      {/* ─── Hero Section with Sunny Sky & Floating 3D Crops ────────────────── */}
      <section className="relative pt-6 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#2594e0] via-[#43a6eb] to-[#ebf6ff] text-white">
        {/* Semi-transparent Giant Background Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
          <span className="text-[13vw] font-black uppercase text-white/10 tracking-widest whitespace-nowrap">
            HARVESTED FOR PROFIT
          </span>
        </div>

        {/* Soft Cloud Shapes Gradient Transition at bottom */}
        <div className="absolute -bottom-16 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-20 w-full my-auto">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[520px]">
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-6 pt-4 lg:pt-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-wide text-white border border-white/30 shadow-sm transition-all cursor-default">
                <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span>Smart APMC Mandi Logistics</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.04] drop-shadow-sm">
                Bold harvest.<br />
                Better moments.
              </h1>

              <p className="text-white/95 text-base sm:text-lg max-w-lg font-medium leading-relaxed mx-auto lg:mx-0 drop-shadow-sm">
                Small-batch or bulk produce, calculated and routed to the highest-bidding mandi. Smooth, data-driven, and made to brighten your day.
              </p>

              {/* Machi-style Dark Pill Buttons & Live Indicator */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/compare"
                  className="btn-pill-dark bg-gray-950 hover:bg-black text-white px-8 py-3.5 rounded-full text-sm font-extrabold shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group border border-white/10"
                >
                  <span>Explore the markets</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/markets"
                  className="bg-white/25 hover:bg-white/35 backdrop-blur-md text-white border border-white/50 px-6 py-3.5 rounded-full text-sm font-bold transition-all shadow-lg hover:scale-105"
                >
                  View 16+ Mandis
                </Link>
              </div>

              {/* Interactive Micro Telemetry */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-white/80 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  16 Live APMCs Connected
                </span>
                <span>•</span>
                <span>120+ Cities Mapped</span>
                <span>•</span>
                <span>₹0 Commission</span>
              </div>
            </div>

            {/* Right: Floating 3D Crops Visual (Tomato & Sweet Corn with Water Splash) */}
            <div className="lg:col-span-5 flex justify-center relative">
              <HeroFloatingCrops />
            </div>
          </div>
        </div>

        {/* Live APMC Price Engine Ticker Marquee */}
        <div className="relative z-20 w-full bg-black/25 backdrop-blur-md border-y border-white/15 py-2.5 text-white overflow-hidden mt-6">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee text-xs font-bold tracking-wide">
            <span className="inline-flex items-center gap-1.5 text-amber-300">
              <Zap className="w-3.5 h-3.5" /> LIVE APMC TICKER:
            </span>
            <span>🍅 Warangal Enumamula: ₹25/kg (<span className="text-emerald-300 font-extrabold">+28% Net</span>)</span>
            <span>🌶️ Guntur Asia Mirchi: ₹120/kg (<span className="text-emerald-300 font-extrabold">+41% Net</span>)</span>
            <span>🧅 Kurnool Mandi: ₹24/kg (<span className="text-emerald-300 font-extrabold">+32% Net</span>)</span>
            <span>🌾 Miryalaguda Mill: ₹35/kg (<span className="text-emerald-300 font-extrabold">+24% Net</span>)</span>
            <span>🥔 Bowenpally Yard: ₹22/kg (<span className="text-emerald-300 font-extrabold">+19% Net</span>)</span>
            <span>⚡ Automated Cold-Chain Transit Protection Active</span>
          </div>
        </div>
      </section>

      {/* ─── Bento Cards: "The fan favorites, best served cold" style ─────── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24 relative z-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900">
              The farmer favorites,<br />best sold fresh
            </h2>
          </div>

          <Link
            to="/compare"
            className="btn-secondary rounded-full text-xs font-bold px-6 py-2.5 hover:bg-gray-100"
          >
            See all products →
          </Link>
        </div>

        {/* 4 Pastel Bento Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENTO_PRODUCTS.map((prod, idx) => (
            <TiltCard key={idx} intensity={8} className="h-full rounded-3xl">
              <div
                className={`${prod.bg} rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full min-h-[460px] relative overflow-hidden transition-all duration-300 hover:shadow-xl border border-black/5`}
              >
                {/* Text Content */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {prod.mandi}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-white/70 px-2 py-0.5 rounded-full">
                      {prod.rate}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                    {prod.name}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {prod.desc}
                  </p>

                  <div className="pt-2">
                    <Link
                      to={`/compare?crop=${prod.cropId}`}
                      className={`${prod.btnColor} px-5 py-2 rounded-full text-xs font-bold shadow-sm hover:shadow transition-all inline-block`}
                    >
                      Compare rates
                    </Link>
                  </div>
                </div>

                {/* Bottom Product Image - Resting at base */}
                <div className="mt-6 -mb-7 -mx-7 flex justify-center relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-56 object-cover object-center rounded-b-3xl transform transition-transform duration-500 hover:scale-105 select-none"
                  />
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ─── Split Story / Stats Section (Machi's Right Panel Style) ──────── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-gray-100">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Story + Stats */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
              Direct APMC Logistics
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Brewed slow,<br />
              made for sunny days
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              Real mandi prices meet automated truck routing. We calculate your true take-home earnings by subtracting exact highway diesel, truck capacity, and mandi loading fees.
            </p>

            {/* 3 Metric Counters */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">16+</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">APMC Mandis</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">100%</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Transparent</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">₹0</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Broker Commission</div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/compare"
                className="btn-pill-dark bg-gray-950 hover:bg-black text-white text-xs font-extrabold px-8 py-3.5 rounded-full inline-block"
              >
                Find highest rate
              </Link>
            </div>
          </div>

          {/* Right Column: Natural Harvest Image Card with Machi pill tagline */}
          <div className="lg:col-span-6">
            <TiltCard intensity={6} className="rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 aspect-[4/3] sm:aspect-[16/10] flex items-end p-8 overflow-hidden">
                <img
                  src="/images/hero-crops.jpg"
                  alt="Fresh harvest"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="relative z-10 text-white space-y-2">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white w-fit border border-white/30">
                    Real crops. Really good returns.
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Empowering farmers with transparent market access.
                  </h3>
                  <p className="text-xs text-white/80 font-medium max-w-md">
                    From Telangana red soil to Krishna delta basins, connect directly with wholesale buyers.
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>
    </div>
  );
}
