import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Holdings from './components/Holdings';
import Positions from './components/Positions';
import Orders from './components/Orders';
import Funds from './components/Funds';
import Apps from './components/Apps';
import WatchList from './components/WatchList';
import Menu from './components/Menu';
import TopBar from './components/TopBar';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Mock user data for display
const mockUser = {
  id: "demo-user",
  firstName: "Demo",
  lastName: "User",
  email: "demo@hytrade.com",
  accountBalance: 100000
};

// Define routes component
const AppRoutes = () => {
  return (
    <div className="dashboard-container">
      <div className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Menu />
    </div>
  );
};

// Main App component
function App() {
  const [user] = useState(mockUser);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <TopBar 
            user={user}
            isAuthenticated={true}
            isLoading={false}
            onLogout={() => {}}
            onAuthSuccess={() => {}}
          />
          <AppRoutes />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
