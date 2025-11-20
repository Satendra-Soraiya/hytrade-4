# Hytrade 4 - Modern Trading Platform

![Hytrade Logo](frontend2/public/logo.png)

Hytrade 4 is a comprehensive trading platform with a modern, responsive interface for managing your investments, tracking market data, and executing trades.

## 🌟 Features

- **User Authentication** - Secure signup and login system
- **Real-time Market Data** - Live stock prices and market trends
- **Portfolio Management** - Track your investments and performance
- **Interactive Watchlist** - Monitor your favorite stocks
- **Trading Interface** - Buy and sell stocks with ease
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Quick Start (New)

### One-command Local Setup

- Run the bootstrap script to configure env files, install deps, and optionally start all services:
  ```bash
  chmod +x bootstrap-local-dev.sh
  ./bootstrap-local-dev.sh
  ```
  - Prompts for your `MONGODB_URI` and auto-generates a `JWT_SECRET`.
  - Writes `backend/.env`, `frontend2/.env.local`, and `new-dashboard/.env` for local dev.
  - Installs dependencies for `backend`, `frontend2`, and `new-dashboard`.
  - Optionally starts all dev servers.

### Windows One-click Local Setup

- Double-click `bootstrap-local-dev-windows.bat`
- Or run from Command Prompt: `bootstrap-local-dev-windows.bat`
- Requires Node.js 18+ on PATH; the script opens three windows:
  - Backend on `3002`
  - Landing (Next.js) on `3001`
  - Dashboard (Vite) on `5174`

### Manual Start (if you prefer)

1. **Backend**
   ```bash
   cd backend && npm install
   PORT=3002 NODE_ENV=development npm start
   ```

2. **Landing (Next.js)**
   ```bash
   cd frontend2 && npm install
   npm run dev -- -p 3001
   ```

3. **Dashboard (Vite)**
   ```bash
   cd new-dashboard && npm install
   npm run dev -- --port 5174
   ```

## 🔗 Application URLs

- **Landing (Next.js)**: http://localhost:3001
- **Dashboard (Vite)**: http://localhost:5174
- **Backend API**: http://localhost:3002
- **MongoDB**: http://localhost:27017

## 📂 Project Structure (Cleaned)

```
Hytrade-4/
├── backend/           # Node.js/Express API server
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── index.js       # Main server file
│
├── new-dashboard/     # Vite dashboard application (port 5174 by default)
│   ├── public/        # Static files
│   └── src/           # React components and logic
│
├── frontend2/         # Next.js landing app (port 3001 by default)
│   ├── public/        # Static files
│   └── app/           # Next.js app router pages/components
│
├── bootstrap-local-dev.sh  # New guided local setup script
├── bootstrap-local-dev-windows.bat  # One-click Windows setup
└── README.md          # This file
```

## 🔧 Environment Variables

The local bootstrap writes env files with sensible defaults. You can edit these as needed:

- `backend/.env`
  - `PORT=3002`
  - `NODE_ENV=development`
  - `MONGODB_URI=mongodb://localhost:27017/hytrade` (or your Atlas URI)
  - `JWT_SECRET=<generated>`

- `frontend2/.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:3002`
  - `NEXT_PUBLIC_DASHBOARD_URL=http://localhost:5174`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3001`

- `new-dashboard/.env`
  - `VITE_API_URL=http://localhost:3002`
  - `VITE_FRONTEND_URL=http://localhost:3001`
  - `VITE_DASHBOARD_URL=http://localhost:5174`

## 🛠 Development

### Available Scripts

#### Backend (Express)
```bash
cd backend
npm start       # Start the backend server
npm run dev     # Start in development mode with nodemon
npm test        # Run tests
```

#### Dashboard (Vite)
```bash
cd new-dashboard
npm run dev     # Start the dashboard in development mode (Vite)
npm run build   # Build for production
npm run preview # Preview the production build
```

#### Landing (Next.js)
```bash
cd frontend2
npm run dev     # Start the landing app in development mode (Next.js)
npm run build   # Build for production
npm start       # Start the production server
```

## 🔒 Authentication

### Test Account
- **Email**: test@example.com
- **Password**: password123

### API Authentication
All API requests (except auth endpoints) require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🌐 Deployment

### Production Build
1. Build all applications:
   ```bash
   cd frontend2 && npm run build && cd ..
   cd new-dashboard && npm run build && cd ..
   ```

2. Set `NODE_ENV=production` in your environment variables

3. Start the production server:
   ```bash
   cd backend
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Node.js, Express, and MongoDB
- Uses Material-UI for UI components
- Chart.js for data visualization
- And all the amazing open-source libraries we depend on!

## 🧩 Troubleshooting

- Next.js warnings about `eslint` in `next.config.mjs` and workspace root may appear if multiple lockfiles exist. You can remove redundant lockfiles or set `turbopack.root` in `next.config.mjs`.
- If `npm install` fails in `frontend2` due to peer dependency conflicts (React 19 with certain UI libs), use:
  ```bash
  npm install --legacy-peer-deps
  ```
  Alternatively, align React/Next versions with library peer requirements.
- If ports are busy, free them on macOS/Linux: `lsof -ti :3001 -ti :3002 -ti :5174 | xargs kill -9`.
