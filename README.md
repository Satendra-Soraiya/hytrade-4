# Hytrade 4 - Modern Trading Platform

![Hytrade Logo](https://via.placeholder.com/150x50?text=Hytrade+Logo)

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

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3001
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
├── new-dashboard/     # Vite dashboard application
│   ├── public/        # Static files
│   └── src/           # React components and logic
│
├── frontend2/         # Next.js landing app
│   ├── public/        # Static files
│   └── app/           # Next.js app router pages/components
│
├── bootstrap-local-dev.sh  # New guided local setup script
└── README.md          # This file
```

## 🛠 Development

### Available Scripts

#### Backend
```bash
cd backend
npm start       # Start the backend server
npm run dev     # Start in development mode with nodemon
npm test        # Run tests
```

#### Dashboard
```bash
cd dashboard
npm start       # Start the dashboard in development mode
npm run build   # Build for production
npm test        # Run tests
```

#### Frontend
```bash
cd frontend
npm start       # Start the frontend in development mode
npm run build   # Build for production
npm test        # Run tests
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
   cd frontend && npm run build && cd ..
   cd dashboard && npm run build && cd ..
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
