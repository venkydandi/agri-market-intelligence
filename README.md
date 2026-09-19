# 🌾 AgriRoute

**AgriRoute** helps farmers find the most profitable nearby market for their crops by ranking markets based on **net return** (price minus transport cost).

---

## 🗂️ Project Structure

```
agri-route/
├── client/          # React + Vite + Tailwind CSS frontend
├── server/          # Node.js + Express + MongoDB backend
├── .env.example     # Environment variable template
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://cloud.mongodb.com/) M0 cluster

### 1. Clone & Setup Environment

```bash
git clone <your-repo-url>
cd agri-route
cp .env.example server/.env
# Edit server/.env and fill in your MONGODB_URI and JWT_SECRET
```

### 2. Install & Start the Server

```bash
cd server
npm install
node scripts/seed.js    # Seed mock data (run once)
npm run dev             # Starts on http://localhost:5000
```

### 3. Install & Start the Client

```bash
cd client
npm install
npm run dev             # Starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 API Endpoints (Phase 1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login + get JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/crops` | None | List all crops |
| GET | `/api/markets` | None | List all markets |
| POST | `/api/compare` | None | Rank markets by net return |

### Compare Request Body
```json
{
  "cropId": "<crop_id>",
  "quantity": 500,
  "quality": "A",
  "location": { "lat": 17.385, "lng": 78.486 }
}
```

---

## 🧮 Net Return Algorithm

```
distance        = haversine(farmer_location, market_location)      [km]
transport_cost  = distance × ₹8/km × ceil(quantity / 1000)        [₹]
gross_revenue   = price_per_kg × quantity                          [₹]
net_return      = gross_revenue − transport_cost                   [₹]
```

Markets within **150 km** are considered and ranked by **net return (descending)**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State/Auth | React Context + JWT |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |

---

## 📋 Phase Roadmap

- **Phase 1** ✅ Core MVP (this release)
- **Phase 2** 🔜 Buyer Module + Enhanced Auth
- **Phase 3** 🔜 Maps + Charts + Deployment
- **Phase 4** 🔜 AI/ML + Voice + Telugu Support

---

## 📄 License

MIT
