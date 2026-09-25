<div align="center">

# 🌾 AgriRoute (Agri-Market Intelligence)
### *Agricultural Logistics, Mandi Arbitrage & Net-Return Optimizer*

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

**AgriRoute** is an agricultural logistics intelligence platform built to solve the **price discovery and transport cost gap** for farmers across South India (Telangana, Andhra Pradesh, and adjoining corridors).

Traditional market reporting displays gross mandi rates without accounting for road distances, vehicle payload capacities, handling fees, or transit perishability. **AgriRoute calculates the true Take-Home Net Return**:

$$\text{Net Return} = (\text{Mandi Wholesale Rate} \times \text{Crop Quantity}) - \text{Total Logistics Cost}$$

Where:

$$\text{Trips Required} = \left\lceil \frac{\text{Quantity}}{\text{Vehicle Payload Capacity}} \right\rceil$$

$$\text{Total Logistics Cost} = (\text{Distance} \times \text{Rate/km} \times \text{Trips Required}) + \text{Labor} + \text{Handling}$$

---

## 🌟 Key Features

### 1. 🏙️ Origin Geocoding & APMC Mandi Index
- **120+ Origin Cities & Farm Clusters**: Fast autocomplete across Telangana, Andhra Pradesh, Maharashtra, and Karnataka farm centers for origin pinpointing.
- **Smart GPS Reverse-Lookup**: 1-click location detection automatically resolving the nearest town coordinates.
- **16 Verified APMC Mandis**: Seeded benchmark market dataset across Telangana and Andhra Pradesh (Bowenpally, Gaddiannaram, Warangal, Nizamabad, Guntur, Kurnool, etc.) with calibrated modal pricing.
- **Search Radius Control**: Flexible radius filtering (50 km to 500 km) with explicit outside-radius fallback indicators (`withinRequestedRadius: false`).

### 2. 🚛 Multi-Vehicle Fleet Logistics Engine
- Precision freight calculations tailored to realistic vehicle types:
  - 🛺 **Auto Rickshaw / 3-Wheeler Cargo**: 500 kg max payload @ ₹6/km
  - 🛻 **Tata Ace / Small Commercial Pickup**: 1,500 kg max payload @ ₹8/km
  - 🚚 **Medium Commercial Truck (Eicher)**: 5,000 kg max payload @ ₹14/km
  - 🚛 **Heavy Multi-Axle Truck**: 15,000 kg max payload @ ₹22/km
- Automatic multi-trip dispatch optimization: $\lceil \text{Quantity} / \text{Payload} \rceil \times \text{Distance} \times \text{Rate}$.

### 3. 🎨 Visual Experience & Responsive UI
- **Sunny Sky Hero**: High-contrast typography (*"Bold harvest. Better moments."*), rounded pill action buttons, and commercial crop product compositions.
- **3D Tilt Cards**: Specular lighting glare and realistic pointer tracking powered by Three.js and custom CSS matrix transforms.
- **Pastel Bento Grid**: 4 curated produce cards (Warm Latte, Soft Matcha, Warm Peach, Soft Blush).
- **Display Footer**: Watermark branding.

### 4. 📈 30-Day Historical Price Trend Analytics
- Interactive SVG chart comparing daily auction trajectory across top competing APMC mandis.
- When MongoDB is active, aggregates actual historical price records; in standalone mode, computes deterministic chronological trends with strict $\text{Grade A} > \text{Grade B} > \text{Grade C}$ guarantees.

### 5. 🌦️ Route & Weather Advisory
- Transit weather guidance for dispatch corridors.
- Supports live **OpenWeatherMap** API feeds when `WEATHER_API_KEY` is configured; automatically identifies regional estimates (`isDemo: true`) when operating in standalone mode.
- APMC auction gate timing suggestions (optimal 4:00 AM – 6:30 AM arrival windows).

### 6. 🗣️ Trilingual Localization & WhatsApp Dispatch
- Native support for **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)** with instant in-memory language switching.
- **1-Click WhatsApp Mandi Slip**: Preformatted summary for drivers and commission agents with direct Google Maps navigation deep links.

---

## 🏛️ System Architecture & Data Modes

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
│                                  │ Axios REST Client (/api)             │
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
│   │  • calculationEngine (Net Return, Multi-Trip Trips, Rankings)   │   │
│   │  • compareService (Geospatial Filtering & Dynamic Reasoning)    │   │
│   │  • weatherService (OpenWeatherMap Live / Deterministic Est.)    │   │
│   │  • haversine (Great-Circle Distance Matrix)                     │   │
│   │  • seedHelper (16 APMC Mandis & Deterministic Price Data)       │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────┐
          │               DATA RESOLUTION MODES             │
          │                                                 │
          │  1. Standalone In-Memory Mode (Zero-Config):    │
          │     Seeded 16 APMC mandis, 10 crops, and        │
          │     deterministic calibrated rates (Demo).      │
          │                                                 │
          │  2. Database Mode (MongoDB Atlas / Local):      │
          │     Connects via MONGODB_URI and queries        │
          │     persisted PriceRecord & Market collections. │
          └─────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
agri-market-intelligence/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI & 3D components
│   │   │   ├── TiltCard.jsx           # 3D perspective mouse tilt container
│   │   │   ├── VisualRouteRadar.jsx   # Geospatial radar visualizer
│   │   │   ├── PriceTrendChart.jsx    # 30-day SVG trend chart
│   │   │   ├── WeatherAdvisory.jsx    # Transit weather alerts (Live / Demo)
│   │   │   ├── CompareTable.jsx       # Sortable comparative breakdown table
│   │   │   └── MarketCard.jsx         # Recommendation card with reasoning
│   │   ├── context/            # Auth & Language contexts
│   │   ├── data/               # 120+ Indian origin cities & dictionaries
│   │   ├── pages/              # Home, Compare, MarketsExplorer, Auth
│   │   └── services/           # Axios API client
│   └── vite.config.js          # Vite configuration with /api proxy
│
├── server/                     # Backend API (Node.js + Express)
│   ├── models/                 # Mongoose schemas (Crop, Market, PriceRecord, User)
│   ├── routes/                 # Express routers (compare, markets, crops, weather, auth)
│   ├── services/
│   │   ├── calculationEngine.js # Centralized logistics math & ranking comparator
│   │   ├── compareService.js    # Market comparison & dynamic reasoning
│   │   ├── weatherService.js    # Weather integration & regional fallback
│   │   ├── haversine.js         # Great-circle distance calculations
│   │   └── seedHelper.js        # APMC mandis & deterministic historical prices
│   ├── tests/
│   │   └── recommendation.test.js # Test suite for recommendation engine
│   ├── db.js                   # Database connection manager with fallback
│   └── index.js                # Express application entrypoint
│
├── .github/
│   └── workflows/
│       └── webpack.yml         # GitHub Actions CI workflow (Node 18.x, 20.x, 22.x)
├── .env.example                # Environment variables template
└── README.md                   # Project documentation
```

---

## 🔌 API Reference

### 1. Market Net-Return Arbitrage
- **`POST /api/compare`**
  - **Body**:
    ```json
    {
      "cropId": "crop_1",
      "quantity": 1000,
      "quality": "A",
      "location": { "lat": 17.9785, "lng": 79.5941 },
      "radiusKm": 250,
      "vehicleType": "small_pickup"
    }
    ```
  - **Response**: Array of candidate mandis sorted strictly by `netReturn` with multi-trip calculations, logistics breakdown, and dynamic structured reasoning (`recommendationReason`).

### 2. Historical Price Trends
- **`GET /api/markets/trends?cropId=crop_1&quality=A`**
  - **Response**: 30-day chronological auction price history across competing wholesale yards.

### 3. Route Weather & Advisory
- **`GET /api/weather?city=Warangal`**
  - **Response**: Current weather and dispatch recommendations (`isDemo: false` when API key configured, otherwise `isDemo: true`).

### 4. APMC Mandi Directory
- **`GET /api/markets`**
  - **Response**: List of 16 APMC yards with GPS coordinates, operating timings, and phone contacts.

### 5. Crop Registry
- **`GET /api/crops`**
  - **Response**: Supported crop varieties with categories and unit metadata.

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
# Clone the repository
git clone https://github.com/venkydandi/agri-market-intelligence.git
cd agri-market-intelligence

# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in the root and/or `server` directory:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agri-route
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
WEATHER_API_KEY=
```

> **Note**: If MongoDB is not running locally, the server automatically operates in **Standalone In-Memory Mode** using verified APMC mandis and calibrated benchmark price data.

### 3. Run Development Servers

```bash
# Run both backend and frontend concurrently from root:
npm run dev

# Or run independently:
npm --prefix server run dev   # Express API on http://localhost:5000
npm --prefix client run dev   # Vite frontend on http://localhost:5173
```

Open [**http://localhost:5173**](http://localhost:5173) in your browser.

---

## 🧪 Testing & Production Build

### Run Backend Unit & Financial Engine Tests
```bash
npm --prefix server test
```
Executes the test suite covering multi-trip dispatch math, net return ranking, deterministic tie-breaking, quality multipliers, and candidate validation.

### Build Frontend Production Bundle
```bash
npm --prefix client run build
```
Generates production assets in `client/dist/`.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.