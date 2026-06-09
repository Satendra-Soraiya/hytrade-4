# Hytrade API Contract (v3)

Base URL: `/api`

## Auth (`/api/auth`)

| Method | Path | Auth | Response envelope |
|--------|------|------|-------------------|
| POST | `/register` | No | `{ success, token, user, session }` |
| POST | `/login` | No | `{ success, token, user, session }` |
| GET | `/verify` | Bearer | `{ success, user }` |
| POST | `/logout` | Bearer | `{ success }` |
| GET | `/profile` | Bearer | `{ success, user }` |
| GET | `/avatar-url` | Bearer | `{ success, url }` |

`user.accountBalance` is INR paper-trading balance from wallet.

## Trading (`/api/trading`)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/order` | MARKET orders use server LTP; body: `{ stockSymbol, stockName, orderType, quantity, price, orderMode }` |
| GET | `/holdings` | `{ success, data: { holdings, pagination, summary } }` |
| GET | `/orders` | `{ success, data: { orders, pagination } }` |
| GET | `/portfolio/summary` | `{ success, data }` |
| GET | `/portfolio/detailed` | `{ success, data }` |
| POST | `/portfolio/deposit` | Dev only |
| GET | `/markets` | Indian indices + movers |
| GET | `/stats` | Trading stats |

## Market (`/api/market`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/instruments` | `?search=&exchange=&limit=` |
| GET | `/quotes` | `?symbols=RELIANCE,TCS` |
| GET | `/indices` | NIFTY, SENSEX, etc. |

## Profile (`/api/profile`)

Unchanged paths for avatar upload and proxy.
