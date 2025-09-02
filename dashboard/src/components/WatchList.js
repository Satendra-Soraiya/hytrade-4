

import React, { useState, useEffect, useContext } from "react";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow, Box } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
  StarBorder,
  TrendingUp,
  TrendingDown,
  Remove
} from "@mui/icons-material";

import DoughnutChart from "./DoughnutChart";
import { marketAPI } from "../services/api";
import { formatCurrency } from "../utils/formatters";
import "./WatchList.css";

// Helper functions for data validation
const safeNumber = (val, def = 0) => {
  const num = parseFloat(val);
  return isNaN(num) ? def : num;
};

const safeString = (val, def = '') => {
  if (val === null || val === undefined) return def;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val.toString();
  try {
    return JSON.stringify(val);
  } catch {
    return def;
  }
};

const normalizeStock = (stock) => {
  if (!stock || typeof stock !== 'object') {
    return {
      _id: `stock-${Math.random().toString(36).substr(2, 9)}`,
      symbol: 'N/A',
      name: '',
      lastPrice: 0,
      change: 0,
      changePercent: '0.00%',
      isLoss: false
    };
  }

  const symbol = safeString(stock.symbol, 'N/A').toUpperCase();
  const lastPrice = safeNumber(stock.lastPrice || stock.price || 0);
  const change = safeNumber(stock.change || 0);
  
  return {
    _id: safeString(stock._id, `stock-${Math.random().toString(36).substr(2, 9)}`),
    symbol,
    name: safeString(stock.name, symbol),
    lastPrice,
    change,
    changePercent: safeString(
      stock.changePercent || 
      (change ? `${Math.abs(change).toFixed(2)}%` : '0.00%'),
      '0.00%'
    ),
    isLoss: change < 0
  };
};

const WatchList = ({
  watchlist: propWatchlist = [],
  isLoading = false,
  onTradeClick,
  showChart = false,
  isSidebar = false,
  maxItems = 5
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isSidebar);

  // If watchlist prop changes, update local state
  useEffect(() => {
    if (Array.isArray(propWatchlist)) {
      const normalized = propWatchlist.map(normalizeStock);
      setWatchlist(normalized);
    } else {
      setWatchlist([]);
    }
  }, [propWatchlist]);

  // Chart data will be implemented later - for now just return null
  const chartData = null;

  // Toggle watchlist expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Format price change with proper styling
  const formatChange = (change, changePercent) => {
    // Ensure we have valid numbers
    const changeNum = safeNumber(change, 0);
    let percent = '0.00%';
    
    // Safely handle changePercent which might be an object
    if (changePercent && typeof changePercent === 'object') {
      // If changePercent is an object, try to extract a numeric value
      const num = parseFloat(changePercent.value || changePercent.amount || 0);
      percent = isNaN(num) ? '0.00%' : `${Math.abs(num).toFixed(2)}%`;
    } else {
      // Handle string or number changePercent
      const num = parseFloat(changePercent);
      percent = isNaN(num) ? '0.00%' : `${Math.abs(num).toFixed(2)}%`;
    }
    
    if (changeNum === 0) {
      return (
        <span className="neutral">
          <Remove fontSize="small" /> 0.00 (0.00%)
        </span>
      );
    }
    
    const isPositive = changeNum > 0;
    const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
    const changeClass = isPositive ? 'positive' : 'negative';
    
    return (
      <span className={changeClass}>
        <ChangeIcon fontSize="small" />
        {Math.abs(changeNum).toFixed(2)} ({percent})
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="watchlist">
        <div className="watchlist__header" onClick={toggleExpand}>
          <h3>Watchlist</h3>
          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </div>
        {isExpanded && (
          <div className="watchlist__loading">
            <p>Loading watchlist data...</p>
          </div>
        )}
      </div>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="watchlist">
        <div className="watchlist__header" onClick={toggleExpand}>
          <h3>Watchlist</h3>
          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </div>
        {isExpanded && (
          <div className="watchlist__empty">
            <p>No stocks in watchlist. Add some stocks to track them here.</p>
          </div>
        )}
      </div>
    );
  }

  // Limit the number of items shown in the sidebar
  const displayWatchlist = isSidebar ? watchlist.slice(0, maxItems) : watchlist;
  
  // Render the watchlist with optional chart
  return (
    <div className={`watchlist ${isSidebar ? 'watchlist--sidebar' : ''}`}>
      <div className="watchlist__header" onClick={toggleExpand}>
        <h3>Watchlist</h3>
        <div className="watchlist__header-actions">
          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="watchlist__content">
          {/* Chart with loading and error states */}
          {showChart && (
            <Box sx={{ mt: 2, height: 250, position: 'relative' }}>
              {isLoading ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}
                >
                  Loading chart data...
                </Box>
              ) : chartData ? (
                <DoughnutChart 
                  data={chartData} 
                  options={{
                    plugins: {
                      legend: {
                        display: true,
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          padding: 10
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'text.secondary',
                    textAlign: 'center',
                    p: 2
                  }}
                >
                  No chart data available. Add stocks to your watchlist to see the distribution.
                </Box>
              )}
            </Box>
          )}
          
          <div className="watchlist__items">
            {displayWatchlist.map((stock) => {
              const normalized = normalizeStock(stock);
              return (
                <div key={normalized._id} className="watchlist__item">
                  <div className="watchlist__item-info">
                    <div className="watchlist__item-symbol">
                      <StarBorder fontSize="small" className="watchlist__star" />
                      <span>{normalized.symbol}</span>
                    </div>
                    <div className="watchlist__item-price">
                      {formatCurrency(normalized.lastPrice)}
                    </div>
                  </div>
                  <div className="watchlist__item-change">
                    {formatChange(normalized.change, normalized.changePercent)}
                  </div>
                  {onTradeClick && (
                    <button 
                      className="watchlist__trade-btn"
                      onClick={() => onTradeClick(normalized.symbol, normalized.lastPrice)}
                    >
                      Trade
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {isSidebar && watchlist.length > maxItems && (
            <div className="watchlist__view-all">
              <a href="/watchlist" className="watchlist__view-all-link">
                View All ({watchlist.length})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onTradeClick }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  // Ensure we have valid stock data
  const safeStock = stock || {};
  const lastPrice = typeof safeStock.lastPrice === 'number' ? safeStock.lastPrice : 
                  (typeof safeStock.lastPrice === 'string' ? parseFloat(safeStock.lastPrice) : 0);
  const change = typeof safeStock.change === 'number' ? safeStock.change : 
               (typeof safeStock.change === 'string' ? parseFloat(safeStock.change) : 0);
  const changePercent = typeof safeStock.changePercent === 'string' ? safeStock.changePercent :
                      (typeof change === 'number' ? `${Math.abs(change).toFixed(2)}%` : '0.00%');
  const symbol = safeStock.symbol || 'N/A';

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleTradeClick = () => {
    if (onTradeClick) {
      onTradeClick(safeStock);
    }
  };

  return (
    <li className="list-item">
      <div className="list-item-left">
        <h4 className="symbol">{symbol}</h4>
        <div className="price">
          <span className="amount">₹{lastPrice.toFixed(2)}</span>
          <span className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change.toFixed(2)} ({changePercent})
          </span>
        </div>
      </div>
      <div className="list-item-right" style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleTradeClick}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            height: '28px',
            marginRight: '8px'
          }}
        >
          <span>Trade</span>
        </button>
        <WatchListActions stock={stock} onTradeClick={onTradeClick} />
      </div>
    </li>
  );
};

const WatchListActions = ({ stock, onTradeClick }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(stock.symbol);
  };

  const handleTradeClick = () => {
    if (onTradeClick) {
      onTradeClick(stock);
    }
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
