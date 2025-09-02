import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
import { fundsAPI } from "../services/api";

const Funds = ({ funds: propFunds, isLoading: propLoading = false }) => {
  const [funds, setFunds] = useState(propFunds || {});
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState(null);

  // Fetch funds if not provided via props
  useEffect(() => {
    const fetchFunds = async () => {
      if (!propFunds) {
        try {
          setIsLoading(true);
          const response = await fundsAPI.getFunds();
          setFunds(response.data || {});
          setError(null);
        } catch (err) {
          console.error('Error fetching funds:', err);
          setError('Failed to load funds information. Please try again later.');
          setFunds({});
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFunds();
  }, [propFunds]);

  // Default values for funds data
  const {
    equity = {
      available_margin: 0,
      used_margin: 0,
      available_cash: 0,
      opening_balance: 0,
      payin: 0,
      span: 0,
      delivery_margin: 0,
      exposure: 0,
      options_premium: 0,
      collateral_liquid_funds: 0,
      collateral_equity: 0,
      total_collateral: 0
    },
    commodity = {
      has_account: false,
      available_margin: 0,
      used_margin: 0,
      available_cash: 0
    }
  } = funds;

  if (isLoading) {
    return (
      <div className="funds-container">
        <div className="loading">Loading funds information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="funds-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="funds-container">
      <div className="funds-header">
        <p>Instant, zero-cost fund transfers with UPI</p>
        <div className="funds-actions">
          <Link className="btn btn-green">Add funds</Link>
          <Link className="btn btn-blue">Withdraw</Link>
        </div>
      </div>

      <div className="funds-row">
        {/* Equity Funds */}
        <div className="funds-column">
          <div className="funds-section">
            <h3>Equity</h3>
            <div className="funds-table">
              <div className="funds-data">
                <p>Available Margin</p>
                <p className="highlight colored">{formatCurrency(equity.available_margin)}</p>
              </div>
              <div className="funds-data">
                <p>Used Margin</p>
                <p className="highlight">{formatCurrency(equity.used_margin)}</p>
              </div>
              <div className="funds-data">
                <p>Available Cash</p>
                <p className="highlight">{formatCurrency(equity.available_cash)}</p>
              </div>
              <hr className="divider" />
              <div className="funds-data">
                <p>Opening Balance</p>
                <p>{formatCurrency(equity.opening_balance)}</p>
              </div>
              <div className="funds-data">
                <p>Payin</p>
                <p>{formatCurrency(equity.payin)}</p>
              </div>
              <div className="funds-data">
                <p>SPAN</p>
                <p>{formatCurrency(equity.span)}</p>
              </div>
              <div className="funds-data">
                <p>Delivery Margin</p>
                <p>{formatCurrency(equity.delivery_margin)}</p>
              </div>
              <div className="funds-data">
                <p>Exposure</p>
                <p>{formatCurrency(equity.exposure)}</p>
              </div>
              <div className="funds-data">
                <p>Options Premium</p>
                <p>{formatCurrency(equity.options_premium)}</p>
              </div>
              <hr className="divider" />
              <div className="funds-data">
                <p>Collateral (Liquid Funds)</p>
                <p>{formatCurrency(equity.collateral_liquid_funds)}</p>
              </div>
              <div className="funds-data">
                <p>Collateral (Equity)</p>
                <p>{formatCurrency(equity.collateral_equity)}</p>
              </div>
              <div className="funds-data">
                <p>Total Collateral</p>
                <p className="highlight">{formatCurrency(equity.total_collateral)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commodity Funds */}
        <div className="funds-column">
          {commodity.has_account ? (
            <div className="funds-section">
              <h3>Commodity</h3>
              <div className="funds-table">
                <div className="funds-data">
                  <p>Available Margin</p>
                  <p className="highlight colored">{formatCurrency(commodity.available_margin)}</p>
                </div>
                <div className="funds-data">
                  <p>Used Margin</p>
                  <p className="highlight">{formatCurrency(commodity.used_margin)}</p>
                </div>
                <div className="funds-data">
                  <p>Available Cash</p>
                  <p className="highlight">{formatCurrency(commodity.available_cash)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="funds-section no-account">
              <div className="no-account-content">
                <p>You don't have a commodity account</p>
                <Link className="btn btn-blue">Open Account</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Funds;
