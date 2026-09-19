<div align="center">

# 🌾 AgriRoute (Agri-Market Intelligence)
### *Enterprise Agricultural Logistics, Real-Time Mandi Arbitrage & Net-Return Optimizer*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white&style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=for-the-badge)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-000000?logo=three.js&logoColor=white&style=for-the-badge)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Eliminating middleman friction and empowering farmers with transparent, data-driven market selection and multi-vehicle freight intelligence.</b>
</p>

</div>

---

## 📌 Executive Summary

**AgriRoute** is an industrial-grade agricultural intelligence platform built to solve the **price discovery and logistics transparency gap** for farmers across South India (Telangana, Andhra Pradesh, and adjoining agricultural corridors).

Traditional market information systems only report gross market prices without accounting for transportation distances, vehicle capacity constraints, handling fees, or transit perishability. **AgriRoute calculates the true Take-Home Net Return**:

$$\text{Net Return} = (\text{Mandi Wholesale Rate} \times \text{Crop Quantity}) - \text{Total Freight Cost} - \text{Mandi Handling Fees}$$

---

## 🌟 Key Features

### 1. 🏙️ City-Based Geospatial Intelligence & GPS Geocoding
- **120+ Indexed Agricultural Hubs**: Fast fuzzy search across Telangana, Andhra Pradesh, Maharashtra, and Karnataka farm clusters.
- **Smart GPS Reverse-Lookup**: 1-click location detection automatically resolving the nearest agricultural market hub.
- **Dynamic Search Radius**: Flexible filtering from local micro-markets (50 km) to regional wholesale hubs (500 km).

### 2. 🚛 Multi-Vehicle Fleet Logistics Engine
- Precision freight calculations tailored to realistic vehicle types:
  - 🛺 **Auto Rickshaw / 3-Wheeler Cargo**: 500 kg max payload @ ₹6/km
  - 🛻 **Tata Ace / Small Commercial Pickup**: 1,500 kg max payload @ ₹8/km
  - 🚚 **Medium Commercial Truck (Eicher)**: 5,000 kg max payload @ ₹14/km
  - 🚛 **Heavy Multi-Axle Truck**: 15,000 kg max payload @ ₹22/km
- Automatic multi-trip dispatch optimization: $\lceil \text{Quantity} / \text{Payload} \rceil \times \text{Distance} \times \text{Rate}$.

### 3. 🎨 Awwwards-Caliber UI/UX & Machi-Inspired Aesthetics
- **Clean Sunny Sky Hero**: High-contrast typography (*"Bold harvest. Better moments."*), rounded pill action buttons, and commercial crop product compositions.
- **Physics-Based 3D Tilt Cards**: Specular lighting glare and realistic pointer tracking powered by Three.js and custom CSS matrix transforms.
- **Pastel Bento Grid**: 4 curated produce cards (Warm Latte, Soft Matcha, Warm Peach, Soft Blush).
- **Massive Lowercase Footer**: Iconic display watermark branding.

### 4. 📈 30-Day Historical Price Trend Analytics
- High-performance interactive SVG chart comparing daily auction trajectory across top competing APMC mandis.
- Identifies volatility, seasonal demand spikes, and peak bidding windows.

### 5. 🌦️ Real-Time Transit & Weather Advisory
- Tailored transit weather alerts for origin districts (monsoon drizzle warnings, tarpaulin recommendations, perishability indices).
- APMC auction gate timing suggestions (optimal 4:00 AM – 6:30 AM arrival windows).

### 6. 🗣️ Trilingual Localization & WhatsApp Dispatch
- Native support for **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)** with instant in-memory language switching.
- **1-Click WhatsApp Mandi Slip**: Preformatted summary for drivers and commission agents with direct Google Maps navigation deep links.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React 18 + Vite)                      │
│                                                                         │
│   ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐   │
│   │ 3D Tilt Hero &   │  │ City Geocoder &  │  │ Route Radar & SVG   │   │
│   │ Machi Bento Grid │  │ GPS Autocomplete │  │ Price Trend Charts  │   │
│   └─────────┬────────┘  └────────┬─────────┘  └──────────┬──────────┘   │
│             │                    │                       │              │
│             └────────────────────┼───────────────────────┘              │
│                                  │ Axios REST Client                    │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │ HTTP / JSON
┌──────────────────────────────────┼──────────────────────────────────────┐
│                                  ▼                                      │
│                      SERVER (Node.js + Express)                         │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Express Routing Layer (/api/compare, /api/markets, /api/crops) │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                      │
│   ┌──────────────────────────────┴──────────────────────────────────┐   │
│   │  Core Services:                                                 │   │
│   │  • compareService (Vehicle Fleet Cost & Net Margin Ranking)     │   │
│   │  • haversine (Great-Circle Distance Matrix)                     │   │
│   │  • seedHelper (16 APMC Mandis + Auto Fallback Data Engine)       │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │ Mongoose ODM / In-Memory Mock
┌──────────────────────────────────┼──────────────────────────────────────┐
│                                  ▼                                      │
│                  DATABASE (MongoDB Atlas / Standalone)                  │
│       [Users]  •  [Crops]  •  [Markets (16 APMCs)]  •  [PriceRecords]   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
agri-market-intelligence/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   │   └── images/             # Crop product & hero imagery
│   ├── src/
│   │   ├── components/         # Reusable UI & 3D components
│   │   │   ├── HeroFloatingCrops.jsx  # Hero 3D showcase & pill telemetry
│   │   │   ├── TiltCard.jsx           # 3D perspective mouse tilt container
│   │   │   ├── VisualRouteRadar.jsx   # Geospatial radar visualizer
│   │   │   ├── PriceTrendChart.jsx    # 30-day SVG trend chart
│   │   │   ├── WeatherAdvisory.jsx    # Real-time transit weather alerts
│   │   │   ├── Navbar.jsx             # Floating pill navigation
│   │   │   └── Footer.jsx             # Watermark display footer
│   │   ├── context/            # Auth & Trilingual Language contexts
│   │   ├── data/               # 120+ Indian cities & vernacular dictionaries
│   │   ├── pages/              # Home, Compare, MarketsExplorer, Auth
│   │   └── services/           # Axios API service client
│   └── vite.config.js          # Optimized Rollup & Three.js chunk configuration
│
├── server/                     # Backend API (Node.js + Express)
│   ├── models/                 # Mongoose schemas (Crop, Market, PriceRecord, User)
│   ├── routes/                 # API controllers (auth, crops, markets, compare)
│   ├── services/               # Arbitrage calculation, routing & seed helpers
│   ├── db.js                   # Resilient database connection manager
│   └── index.js                # Express entrypoint with automatic fallback seeding
│
├── .env.example                # Configuration template
└── README.md                   # Enterprise documentation
```

---

## 🔌 API Reference

### 1. Market Net-Return Arbitrage
- **`POST /api/compare`**
  - **Body**: `{ "cropId": "crop_1", "quantity": 1000, "userLat": 17.97, "userLng": 79.59, "quality": "A", "vehicleType": "tata_ace", "maxDistance": 250 }`
  - **Response**: Array of ranked markets sorted by `netReturn` with complete freight and revenue breakdown.

### 2. Historical Price Trends
- **`GET /api/markets/trends?cropId=crop_1&quality=A`**
  - **Response**: 15-day to 30-day chronological auction price history across competing wholesale yards.

### 3. APMC Directory & Search
- **`GET /api/markets?city=Warangal&district=Warangal`**
  - **Response**: List of APMC yards with exact GPS coordinates, operating timings, and phone contacts.

### 4. Crop Registry
- **`GET /api/crops`**
  - **Response**: Supported crop varieties with baseline modal pricing and quality grading tiers.

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/venkydandi/agri-market-intelligence.git
cd agri-market-intelligence

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory (or use default auto-fallback):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agriroute
JWT_SECRET=your_super_secret_jwt_key_here
```

> **Note**: If MongoDB is not running locally, the server automatically operates in **In-Memory Seed Mode**, pre-populating all 16 APMC mandis and 10 crop varieties out of the box with zero setup required.

### 3. Run Development Servers

```bash
# Terminal 1 — Start Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2 — Start Frontend Application (Port 5173)
cd client
npm run dev
```

Open [**http://localhost:5173**](http://localhost:5173) in your browser.

---

## 🧪 Production Build & Validation

```bash
cd client
npm run build
```
- Fully tree-shaken production bundle with dedicated Three.js vendor chunking (`dist/assets/three-*.js`).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ for Indian Farmers & APMC Wholesale Traders</b>
</div>