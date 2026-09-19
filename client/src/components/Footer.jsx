import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
        {/* Top Newsletter & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          {/* Newsletter Column */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="font-extrabold text-sm text-gray-900">
              Smooth, honest mandi intel, straight to your farm.
            </h4>
            <p className="text-gray-500 font-medium text-xs">
              Subscribe for weekly price movements and monsoon transit warnings.
            </p>
            <div className="flex gap-2 max-w-sm pt-1">
              <input
                type="email"
                placeholder="Enter your phone or email"
                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button className="btn-pill-dark bg-gray-950 text-white px-5 py-2.5 rounded-full font-bold text-xs">
                Sign up
              </button>
            </div>
          </div>

          {/* Products Column */}
          <div className="md:col-span-3 space-y-2.5 md:pl-6">
            <div className="font-extrabold text-gray-900 uppercase text-[11px] tracking-wider mb-2">
              Products
            </div>
            <div><Link to="/compare" className="text-gray-600 hover:text-black font-medium">Market Compare</Link></div>
            <div><Link to="/markets" className="text-gray-600 hover:text-black font-medium">APMC Directory</Link></div>
            <div><Link to="/compare" className="text-gray-600 hover:text-black font-medium">Route Radar</Link></div>
            <div><Link to="/compare" className="text-gray-600 hover:text-black font-medium">30-Day Trends</Link></div>
          </div>

          {/* Company Column */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="font-extrabold text-gray-900 uppercase text-[11px] tracking-wider mb-2">
              Company
            </div>
            <div><span className="text-gray-600 font-medium">Our Story</span></div>
            <div><span className="text-gray-600 font-medium">Verified Mandis</span></div>
            <div><span className="text-gray-600 font-medium">Careers</span></div>
            <div><span className="text-gray-600 font-medium">Contact Superintendents</span></div>
          </div>
        </div>

        {/* Machi-Style Massive Lowercase Typographic Watermark */}
        <div className="select-none text-center">
          <h1 className="text-[18vw] font-black text-gray-950 tracking-tighter leading-[0.8] hover:text-gray-900 transition-colors">
            agriroute
          </h1>
        </div>

        {/* Bottom copyright & legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-6">
          <div>
            © {new Date().getFullYear()} AgriRoute Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-600 cursor-pointer">Privacy policy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms of service</span>
            <span className="text-sky-600 font-bold">Made for Indian Farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
