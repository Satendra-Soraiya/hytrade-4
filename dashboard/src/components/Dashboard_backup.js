import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import { GeneralContextProvider } from "./GeneralContext";
import Summary from "./Summary";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Funds from "./Funds";
import "./Dashboard.css";

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [funds, setFunds] = useState({ available: 100000, used: 0, total: 100000 });
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for testing
  useEffect(() => {
    const mockHoldings = [
      {
        name: "RELIANCE",
        qty: 10,
        avg: 2500,
        price: 2650,
        net: "+6.00%",
        day: "+1.50%"
      }
    ];

    const mockOrders = [
      {
        name: "INFY",
        qty: 5,
        price: 1500,
        mode: "BUY",
        status: "COMPLETE"
      }
    ];

    setHoldings(mockHoldings);
    setOrders(mockOrders);
    setIsLoading(false);
  }, []);

  const contextValue = {
    holdings,
    orders,
    positions,
    funds,
    watchlist,
    isLoading
  };

  return (
    <GeneralContextProvider value={contextValue}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ bgcolor: '#fff', color: '#000' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Hytrade Dashboard
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ pt: 8, flex: 1 }}>
          <Routes>
            <Route 
              index 
              element={
                <Summary 
                  user={user} 
                  holdings={holdings}
                  funds={funds}
                  positions={positions}
                  watchlist={watchlist}
                  isLoading={isLoading}
                />
              } 
            />
            <Route 
              path="orders" 
              element={<Orders orders={orders} isLoading={isLoading} />} 
            />
            <Route 
              path="holdings" 
              element={<Holdings holdings={holdings} isLoading={isLoading} />} 
            />
            <Route 
              path="positions" 
              element={<Positions positions={positions} isLoading={isLoading} />} 
            />
            <Route 
              path="funds" 
              element={<Funds funds={funds} isLoading={isLoading} />} 
            />
          </Routes>
        </Box>
      </Box>
    </GeneralContextProvider>
  );
};

export default Dashboard;
