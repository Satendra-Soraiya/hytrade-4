import React from "react";
import { formatCurrency } from "../utils/formatters";

const Summary = ({ user, holdings = [], funds = {}, positions = [], isLoading = false }) => {
  // Helper function to safely get numeric values
  const safeNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || defaultValue;
    return defaultValue;
  };

  // Calculate total P&L and values from holdings
  const calculateHoldingsSummary = () => {
    if (isLoading || !Array.isArray(holdings)) {
      return {
        totalPnl: 0,
        totalValue: 0,
        totalInvestment: 0,
        count: 0,
        pnlPercentage: 0
      };
    }

    const summary = holdings.reduce(
      (acc, holding) => {
        if (!holding || typeof holding !== 'object') return acc;
        
        const currentPrice = safeNumber(holding.currentPrice);
        const quantity = safeNumber(holding.quantity);
        const averagePrice = safeNumber(holding.averagePrice);
        
        const value = currentPrice * quantity;
        const investment = averagePrice * quantity;
        const pnl = value - investment;
        
        return {
          totalPnl: acc.totalPnl + pnl,
          totalValue: acc.totalValue + value,
          totalInvestment: acc.totalInvestment + investment,
          count: acc.count + 1
        };
      },
      { totalPnl: 0, totalValue: 0, totalInvestment: 0, count: 0 }
    );

    return {
      ...summary,
      pnlPercentage: summary.totalInvestment > 0 
        ? (summary.totalPnl / summary.totalInvestment) * 100 
        : 0
    };
  };

  const { totalPnl, totalValue, totalInvestment, count, pnlPercentage } = calculateHoldingsSummary();
  const isPnlPositive = totalPnl >= 0;
  
  // Format currency values
  const formatCurrencyWithSymbol = (value) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return `₹${formatCurrency(numValue)}`;
  };
  const formatPercentage = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  if (isLoading || !user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <div className="username">
        <h6>Hi, {user?.firstName || user?.name || 'User'}</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{formatCurrencyWithSymbol(funds.available || 0)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>{formatCurrencyWithSymbol(funds.used || 0)}</span>
            </p>
            <p>
              Opening balance <span>{formatCurrencyWithSymbol(funds.total || 0)}</span>
            </p>
          </div>
        </div>
        <div className="view-statement">
          <a href="#">View statement</a>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Commodity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{formatCurrencyWithSymbol(0)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>{formatCurrencyWithSymbol(0)}</span>
            </p>
            <p>
              Opening balance <span>{formatCurrencyWithSymbol(0)}</span>
            </p>
          </div>
        </div>
        <div className="view-statement">
          <a href="#">View statement</a>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({count})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={isPnlPositive ? 'profit' : 'loss'}>
              {formatCurrencyWithSymbol(totalPnl)} <small>{formatPercentage(pnlPercentage)}</small>
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current value <span>{formatCurrencyWithSymbol(totalValue)}</span>
            </p>
            <p>
              Investment <span>{formatCurrencyWithSymbol(totalInvestment)}</span>
            </p>
          </div>
        </div>
        <div className="current-value-display">
          <h2>{formatCurrencyWithSymbol(totalValue)}</h2>
          <div className="value-breakdown">
            <p>Current value</p>
            <p>Investment value</p>
            <p>P&L</p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Funds</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{formatCurrencyWithSymbol(funds.available || 0)}</h3>
            <p>Available balance</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Used margin <span>{formatCurrencyWithSymbol(funds.used || 0)}</span>
            </p>
            <p>
              Opening balance <span>{formatCurrencyWithSymbol(funds.total || 0)}</span>
            </p>
          </div>
        </div>
        <div className="view-statement">
          <a href="#">View statement</a>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Market overview</p>
        </span>
        <div className="market-chart">
          <div className="chart-timeline">
            <span>Jul 22</span>
            <span>Oct 22</span>
            <span>Jan 23</span>
            <span>Apr 23</span>
          </div>
          <p>NIFTY 50</p>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Positions ({positions.length})</p>
        </span>
        <div className="positions-list">
          {Array.isArray(positions) && positions.length > 0 ? (
            positions.map((position, index) => {
              // Safely extract position text from object or use as is
              const positionText = position && typeof position === 'object' 
                ? position.symbol || position.name || 'Position'
                : String(position || '');
              return (
                <div key={index} className="position-item">
                  {positionText}
                </div>
              );
            })
          ) : (
            <div className="position-item">No open positions</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Summary;
