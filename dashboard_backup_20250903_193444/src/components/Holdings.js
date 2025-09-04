import React from "react";
import { VerticalGraph } from "./VerticalGraph";
import { formatCurrency, formatPercentage } from "../utils/formatters";

// Helper function to safely extract and format values
const safeGet = (obj, key, formatter = (x) => x) => {
  if (!obj || typeof obj !== 'object') return '-';
  const value = obj[key];
  if (value === undefined || value === null) return '-';
  try {
    return formatter(value);
  } catch (e) {
    console.error(`Error formatting value for key ${key}:`, e);
    return '-';
  }
};

// Helper to safely parse and format numeric values
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
};

// Helper to safely extract string values
const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  try {
    return JSON.stringify(value);
  } catch (e) {
    return defaultValue;
  }
};

const Holdings = ({ holdings = [], isLoading = false }) => {
  // Ensure holdings is an array and filter out invalid items
  const validHoldings = (Array.isArray(holdings) ? holdings : [])
    .filter(holding => holding && typeof holding === 'object' && 'symbol' in holding)
    .map(holding => ({
      // Map to ensure we have all required fields with safe defaults
      _id: safeString(holding._id, `holding-${Math.random().toString(36).substr(2, 9)}`),
      symbol: safeString(holding.symbol, 'N/A').toUpperCase(),
      name: safeString(holding.name, ''),
      quantity: safeNumber(holding.quantity, 0),
      averagePrice: safeNumber(holding.averagePrice || holding.avg, 0),
      currentPrice: safeNumber(holding.currentPrice || holding.price || holding.ltp, 0),
      currentValue: safeNumber(holding.currentValue, 0),
      pnl: safeNumber(holding.pnl, 0),
      pnlPercentage: safeNumber(holding.pnlPercentage || holding.pnlPercent, 0)
    }));
  
  // Calculate totals
  const totals = validHoldings.reduce(
    (acc, holding) => {
      const quantity = holding.quantity;
      const avgPrice = holding.averagePrice;
      const currentPrice = holding.currentPrice;
      const currentValue = holding.currentValue || (currentPrice * quantity);
      const investment = avgPrice * quantity;
      const pnl = currentValue - investment;
      
      return {
        currentValue: acc.currentValue + currentValue,
        investment: acc.investment + investment,
        pnl: acc.pnl + pnl
      };
    },
    { currentValue: 0, investment: 0, pnl: 0 }
  );

  // Prepare chart data
  const chartData = {
    labels: validHoldings.map(h => h.symbol || 'N/A'),
    datasets: [
      {
        label: "Current Value",
        data: validHoldings.map(holding => {
          return holding.currentValue || (holding.currentPrice * holding.quantity);
        }),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="holdings-container">
        <h3 className="title">Holdings</h3>
        <div className="loading">Loading holdings...</div>
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="holdings-container">
        <h3 className="title">Holdings (0)</h3>
        <div className="empty-holdings">
          <p>You don't have any holdings yet.</p>
          <button className="explore-btn">Explore Stocks</button>
        </div>
      </div>
    );
  }

  return (
    <div className="holdings-container">
      <h3 className="title">Holdings ({holdings.length})</h3>
      
      {/* Summary Row */}
      <div className="holdings-summary">
        <div className="summary-item">
          <span className="label">Invested</span>
          <span className="value">{formatCurrency(totals.investment)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Current Value</span>
          <span className="value">{formatCurrency(totals.currentValue)}</span>
        </div>
        <div className="summary-item">
          <span className="label">P&L</span>
          <span className={`value ${totals.pnl >= 0 ? 'positive' : 'negative'}`}>
            {totals.pnl >= 0 ? '+' : ''}{formatCurrency(totals.pnl)} 
            ({formatPercentage(totals.pnl / totals.investment || 0)})
          </span>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="holdings-table">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Qty.</th>
              <th>Avg. Cost</th>
              <th>LTP</th>
              <th>Cur. Val</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {validHoldings.map((holding) => (
              <tr key={holding._id}>
                <td>
                  <div className="symbol-cell">
                    <span className="symbol">{holding.symbol}</span>
                    {holding.name && <span className="name">{holding.name}</span>}
                  </div>
                </td>
                <td>{holding.quantity.toLocaleString()}</td>
                <td>{formatCurrency(holding.averagePrice)}</td>
                <td>{formatCurrency(holding.currentPrice)}</td>
                <td>{formatCurrency(holding.currentValue || (holding.currentPrice * holding.quantity))}</td>
                <td className={holding.pnl >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(holding.pnl)} ({formatPercentage(holding.pnlPercentage / 100)})
                </td>
              </tr>
            ))}
            {validHoldings.length === 0 && (
              <tr>
                <td colSpan="6" className="no-holdings">
                  No holdings data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Portfolio Distribution Chart */}
      <div className="holdings-chart">
        <h4>Portfolio Distribution</h4>
        <div className="chart-container">
          <VerticalGraph data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Holdings;
