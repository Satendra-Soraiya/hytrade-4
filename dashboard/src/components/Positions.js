import React from "react";
import { formatCurrency, formatPercentage } from "../utils/formatters";

const Positions = ({ positions = [], isLoading = false }) => {
  // Calculate totals
  const totals = positions.reduce(
    (acc, position) => {
      const currentValue = position.currentValue || position.lastPrice * position.quantity;
      const investment = position.averagePrice * position.quantity;
      const pnl = currentValue - investment;
      const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;
      const dayPnl = position.dayPnl || 0;
      const dayPnlPercentage = position.dayPnlPercentage || 0;
      
      return {
        currentValue: acc.currentValue + currentValue,
        investment: acc.investment + investment,
        pnl: acc.pnl + pnl,
        dayPnl: acc.dayPnl + dayPnl,
        pnlPercentage: acc.pnlPercentage + pnlPercentage,
        dayPnlPercentage: acc.dayPnlPercentage + dayPnlPercentage
      };
    },
    { currentValue: 0, investment: 0, pnl: 0, dayPnl: 0, pnlPercentage: 0, dayPnlPercentage: 0 }
  );

  if (isLoading) {
    return (
      <div className="positions-container">
        <h3 className="title">Positions</h3>
        <div className="loading">Loading your positions...</div>
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="positions-container">
        <h3 className="title">Positions (0)</h3>
        <div className="no-positions">
          <p>You don't have any open positions</p>
          <button className="explore-btn">Explore Stocks</button>
        </div>
      </div>
    );
  }

  return (
    <div className="positions-container">
      <h3 className="title">Positions ({positions.length})</h3>
      
      {/* Summary Row */}
      <div className="positions-summary">
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
        <div className="summary-item">
          <span className="label">Day's P&L</span>
          <span className={`value ${totals.dayPnl >= 0 ? 'positive' : 'negative'}`}>
            {totals.dayPnl >= 0 ? '+' : ''}{formatCurrency(totals.dayPnl)}
          </span>
        </div>
      </div>

      {/* Positions Table */}
      <div className="positions-table">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Avg. Price</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Day Chg.</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => {
              const currentValue = position.currentValue || position.lastPrice * position.quantity;
              const investment = position.averagePrice * position.quantity;
              const pnl = currentValue - investment;
              const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;
              const dayPnl = position.dayPnl || 0;
              const dayPnlPercentage = position.dayPnlPercentage || 0;
              
              return (
                <tr key={position._id || index}>
                  <td>
                    <div className="symbol-cell">
                      <span className="symbol">{position.symbol}</span>
                      <span className="name">{position.name || position.tradingSymbol}</span>
                    </div>
                  </td>
                  <td>{position.product || 'CNC'}</td>
                  <td>{position.quantity}</td>
                  <td>{formatCurrency(position.averagePrice)}</td>
                  <td>{formatCurrency(position.lastPrice)}</td>
                  <td className={pnl >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(pnl)} ({formatPercentage(pnlPercentage / 100)})
                  </td>
                  <td className={dayPnl >= 0 ? 'positive' : 'negative'}>
                    {dayPnl >= 0 ? '+' : ''}{formatCurrency(dayPnl)}
                    {dayPnlPercentage !== 0 && (
                      <span> ({formatPercentage(dayPnlPercentage / 100)})</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Positions;
