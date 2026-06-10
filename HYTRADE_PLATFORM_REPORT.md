# Hytrade Platform Report

**Version:** API v3 · Paper trading (NSE, INR)  
**Repository:** [github.com/Satendra-Soraiya/hytrade-4](https://github.com/Satendra-Soraiya/hytrade-4)  
**Last updated:** June 2026

---

## 1. What is Hytrade?

Hytrade is a **web-based Indian stock paper-trading platform**. Users create an account, receive a **virtual INR wallet** (default ₹1,00,000), and practice buying and selling **real NSE stock symbols** — without risking real money.

It is built for:

- Learning how trading apps work  
- Practicing portfolio and P&L tracking  
- Testing buy/sell flows with market-style prices  

**It is not a live brokerage.** No bank linking, no real orders on NSE.

---

## 2. Origin and evolution

Hytrade started as a **full-stack trading simulation project** (internally “Hytrade 4” / `hytrade-4`):

| Phase | What changed |
|-------|----------------|
| **Early** | Monolithic Node backend, generic US-style mock trading, basic landing + dashboard |
| **Rebuild (v3)** | Modular backend under `backend/src/`, INR wallet + ledger, 25 NSE instruments, Indian market focus |
| **UI refresh** | New landing page (`frontend2`), themed dashboard (`new-dashboard`), profile avatars, stock logos |
| **Production** | Hosted on Vercel (frontend + dashboard) and Render (API), domains on `hytrade.in` |

The product direction today: **credible paper trading for Indian equities**, with a clean UX and a maintainable API.

---

## 3. The three applications

Hytrade is **one product, three deployable apps**, plus one database.

```
                    ┌─────────────────────────────────────┐
                    │           MongoDB Atlas              │
                    │  users · sessions · holdings ·       │
                    │  orders · wallet ledger · watchlist  │
                    └──────────────────▲──────────────────┘
                                       │
┌──────────────┐    HTTPS + JWT    ┌───┴────────────┐
│   Landing    │ ────────────────▶ │    Backend     │
│  frontend2   │                   │    backend/    │
│  Next.js     │ ◀──────────────── │    Express     │
└──────┬───────┘                   └───▲────────────┘
       │ signup / login                     │
       │ redirect + token                   │ API calls
       ▼                                    │
┌──────────────┐ ──────────────────────────┘
│  Dashboard   │
│ new-dashboard│
│ React + Vite │
└──────────────┘
```

| App | Folder | Role |
|-----|--------|------|
| **Landing** | `frontend2/` | Marketing, About, Pricing, Sign up, Login |
| **Dashboard** | `new-dashboard/` | Trade, Portfolio, Markets, Watchlist, Profile |
| **Backend** | `backend/` | Auth, wallet, trading engine, market data, profiles |

---

## 4. Production URLs and local ports

### Production

| Service | URL | Host |
|---------|-----|------|
| Landing | https://www.hytrade.in | Vercel (`hytrade-4`) |
| Dashboard | https://dashboard.hytrade.in | Vercel (`hytrade-dashboard`) |
| API | https://api.hytrade.in | Render (`hytrade-backend`) |

### Local development

| App | Port |
|-----|------|
| Landing | 3001 |
| Dashboard | 5174 |
| Backend | 3002 |

---

## 5. Tech stack (simple breakdown)

### Landing — `frontend2`

- **Next.js 16** (React, App Router)  
- **TypeScript**, Tailwind CSS, shadcn/ui components  
- **Auth context** for login state; API calls proxied to backend in dev  
- Deployed with **pnpm** on Vercel  

### Dashboard — `new-dashboard`

- **React 18** + **Vite**  
- **Material UI** + custom **Hytrade theme** (light/dark)  
- **Recharts** for portfolio charts  
- **Tailwind** + shadcn-style components on trade/profile pages  
- Deployed with **npm** on Vercel  

### Backend — `backend`

- **Node.js 18+**, **Express**  
- **MongoDB** via **Mongoose**  
- **JWT** authentication + server-side **sessions**  
- **bcrypt** for passwords, **Helmet** + rate limits for security  
- **Sharp** for avatar image processing  
- Optional **AWS S3** for profile uploads  
- **Finnhub** for live quotes (falls back to stored reference prices if key missing)  

### Database

- **MongoDB Atlas** (cloud)  
- Collections for users, sessions, holdings, orders, wallet entries, instruments, watchlists  

---

## 6. Core engines (how the backend thinks)

These are the main logical systems inside the API.

### 6.1 Authentication engine

- **Register** → create user, hash password, create session, issue JWT  
- **Login** → verify credentials, issue JWT  
- **Verify** → dashboard checks token on load  
- **Logout** → invalidate session  
- **Profile / avatar-url** → user details and canonical profile image URL  

Sessions and tokens let the landing and dashboard know who is logged in. A shared cookie (`hytrade_token`) can work across `*.hytrade.in` subdomains.

### 6.2 Wallet engine (paper money)

- Each user has an **INR balance** backed by a **ledger** (credit/debit entries)  
- New users get **₹1,00,000** starting balance (`STARTING_BALANCE_INR`)  
- **Buy** → debit wallet  
- **Sell** → credit wallet  
- **Deposit** endpoint exists for adding paper funds (used in dev/testing)  

This keeps cash and trades consistent — you cannot buy more than your balance allows.

### 6.3 Trading engine

- Accepts **BUY** and **SELL** orders for NSE symbols  
- Uses **server-side prices** (quotes from market data service, not client-trusted prices)  
- Runs critical updates in a **transaction** (wallet + holding + order together)  
- Updates **holdings**: quantity, average price, invested amount  
- Records every **order** with timestamp and fill price  

### 6.4 Market data engine

- **25 seeded NSE instruments** (e.g. RELIANCE, TCS, HDFCBANK)  
- `GET /api/market/instruments` — search and list stocks  
- `GET /api/market/quotes` — latest prices for symbols  
- `GET /api/market/indices` — index-style summary data  
- `GET /api/market/logo/:symbol` — stock logo proxy (public, no auth)  
- Live data via **Finnhub** when `MARKET_DATA_API_KEY` is set; otherwise **reference prices** from the database  

### 6.5 Portfolio engine

- Aggregates holdings + cash into **portfolio value**  
- Computes **unrealized P&L** (current value vs cost)  
- Builds **timeline** data for charts  
- **Allocation** by symbol for pie/bar charts  
- Endpoints: `/portfolio/summary`, `/portfolio/detailed`  

### 6.6 Profile engine

- Update name; pick **default avatar** (AVATAR1–16) or **upload custom** photo  
- Images compressed with **Sharp**  
- Storage: local `/uploads/profiles/` or **S3** when configured  
- **Avatar URL** endpoint returns a stable URL for UI avatars  

### 6.7 Watchlist engine

- Add/remove symbols per user  
- Used on dashboard Markets / Watchlist pages  

---

## 7. Data flow (user journeys)

### 7.1 Sign up and enter dashboard

```
User → Landing /signup
     → POST /api/auth/register
     → MongoDB: User + Session + Wallet (₹1L)
     → JWT returned
     → Redirect to dashboard.hytrade.in?token=...
     → Dashboard stores token, calls GET /api/auth/verify
     → User sees Dashboard with real balance
```

### 7.2 Place a buy order

```
User → Dashboard /trade → selects RELIANCE, qty 10
     → POST /api/trading/order { BUY, ... }
     → Backend:
         1. Fetch quote for RELIANCE
         2. Compute total cost in INR
         3. Check wallet balance
         4. Debit wallet (ledger entry)
         5. Create/update holding
         6. Save order record
     → Response success
     → UI refreshes holdings / portfolio
```

### 7.3 View portfolio

```
Dashboard → GET /api/trading/portfolio/detailed
         → Backend loads holdings, quotes, wallet
         → Returns: total value, P&L, timeline, allocation, holdings list
         → Charts and tables render (Recharts + MUI)
```

### 7.4 Landing ↔ API (production)

The landing does not call `api.hytrade.in` directly from the browser for all routes. **Next.js rewrites** proxy `/api/*`, `/images/*`, and `/uploads/*` to the backend so cookies and CORS stay simple on `www.hytrade.in`.

---

## 8. Project structure (what lives where)

```
HYtrade/
├── frontend2/              # Landing (Next.js)
│   ├── app/                # Pages: /, /login, /signup, /about, ...
│   ├── components/         # Hero, header, footer, UI kit
│   ├── contexts/           # AuthProvider
│   └── lib/                # auth, avatar helpers
│
├── new-dashboard/          # Dashboard (Vite + React)
│   ├── src/pages/          # Dashboard, Trade, Portfolio, Markets, Profile
│   ├── src/layout/         # Sidebar, TopBar, MainLayout
│   ├── src/theme/          # Hytrade MUI theme
│   └── src/utils/          # API URL, INR format, avatars, charts
│
├── backend/
│   ├── index.js            # Entry → src/server.js
│   ├── src/
│   │   ├── app.js          # Express app, CORS, routes mount
│   │   ├── modules/
│   │   │   ├── auth/       # Login, register, sessions
│   │   │   ├── trading/    # Orders, holdings
│   │   │   ├── wallet/     # Ledger, balance
│   │   │   ├── portfolio/  # Summary, detailed, timeline
│   │   │   ├── market/     # Instruments, quotes, logos, watchlist
│   │   │   ├── profile/    # Avatar upload, defaults
│   │   │   └── users/      # User model
│   │   └── shared/         # Auth middleware, money utils, DB
│   ├── scripts/            # seed-instruments, migrate
│   └── public/images/      # Default avatars
│
├── render.yaml             # Render backend blueprint
└── .github/workflows/      # Optional CI deploy helpers
```

---

## 9. Security (high level)

- Passwords hashed with **bcrypt**  
- **JWT** in `Authorization: Bearer` header  
- **Rate limiting** on auth routes  
- **Helmet** security headers  
- **CORS** allowlist for hytrade.in domains and localhost  
- **Server-side pricing** for trades (client cannot pick arbitrary fill prices)  
- Profile image proxy **allowlist** (only trusted hosts/paths)  

---

## 10. Deployment architecture

### How code reaches production

```
Developer pushes to GitHub (branch: main)
        │
        ├──────────────────┬─────────────────────┐
        ▼                  ▼                     ▼
   Vercel Git          Vercel Git            Render Git
   (frontend2)         (new-dashboard)       (backend/)
        │                  │                     │
        ▼                  ▼                     ▼
   www.hytrade.in    dashboard.hytrade.in   api.hytrade.in
```

- **Vercel** watches the repo; each project has a **Root Directory** (`frontend2` or `new-dashboard`).  
- **Render** runs `npm start` from `backend/` (configured in `render.yaml` with `rootDir: backend`).  
- **GitHub Actions** (`.github/workflows/deploy.yml`) can optionally trigger CLI deploys if secrets are set; primary path is **native Git integration** on Vercel and Render.

### Environment variables (production)

**Landing (`frontend2`)**

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.hytrade.in` |
| `NEXT_PUBLIC_DASHBOARD_URL` | `https://dashboard.hytrade.in` |
| `NEXT_PUBLIC_APP_URL` | `https://www.hytrade.in` |

**Dashboard (`new-dashboard`)**

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://api.hytrade.in` |
| `VITE_FRONTEND_URL` | `https://www.hytrade.in` |
| `VITE_DASHBOARD_URL` | `https://dashboard.hytrade.in` |

**Backend (Render)**

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection |
| `JWT_SECRET` | Sign tokens (required) |
| `NODE_ENV` | `production` |
| `MARKET_DATA_API_KEY` | Finnhub key (optional but recommended) |
| `STARTING_BALANCE_INR` | Default paper wallet (e.g. `100000`) |
| AWS S3 vars | Optional custom avatar storage |

### Verify production health

| Check | URL / action |
|-------|----------------|
| Landing loads | https://www.hytrade.in |
| Dashboard loads | https://dashboard.hytrade.in |
| API healthy | https://api.hytrade.in/health → should show `"version":"3.0.0"` after v3 deploy |
| API status | https://api.hytrade.in/api/status |

### Database seeding (production)

After backend deploy, ensure instruments exist:

```bash
cd backend && npm run seed:instruments
```

(Run against production `MONGODB_URI` only when intentional.)

---

## 11. Key API endpoints (quick reference)

| Area | Method | Path |
|------|--------|------|
| Health | GET | `/health` |
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| Verify | GET | `/api/auth/verify` |
| Place order | POST | `/api/trading/order` |
| Holdings | GET | `/api/trading/holdings` |
| Orders history | GET | `/api/trading/orders` |
| Portfolio | GET | `/api/trading/portfolio/detailed` |
| Instruments | GET | `/api/market/instruments` |
| Quotes | GET | `/api/market/quotes` |
| Stock logo | GET | `/api/market/logo/:symbol` |
| Profile | GET/PUT | `/api/profile` |
| Avatar upload | POST | `/api/profile/upload` |

Full contract: `backend/API_CONTRACT.md`

---

## 12. What is paper trading here?

| Real brokerage | Hytrade |
|----------------|---------|
| Real money | Virtual INR wallet |
| Live NSE orders | Simulated fills at quoted prices |
| Demat account | MongoDB holdings records |
| Bank transfer | Ledger credits/debits only |

Users get realistic **UX and math** (balance, holdings, P&L) without financial risk.

---

## 13. Summary

Hytrade is a **three-tier web app**: Next.js landing, Vite dashboard, and Express API on MongoDB. The **v3 backend** powers **INR paper trading** on **25 NSE stocks** with wallet, trading, portfolio, market data, and profile engines. Production runs on **Vercel + Render** under the **hytrade.in** domain family, with deploys triggered by pushes to the **`main`** branch on GitHub.

For API endpoint details see `backend/API_CONTRACT.md`.  
For local quick start see `README.md`.

---

*Report generated for project stakeholders and developers. For questions about a specific module, start from `backend/src/modules/` or the matching page under `new-dashboard/src/pages/`.*
