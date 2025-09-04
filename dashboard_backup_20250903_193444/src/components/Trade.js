import React, { useState, useContext } from 'react';
import GeneralContext from './GeneralContext';
import { portfolioAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Trade = ({ symbol: initialSymbol = '', onClose }) => {
  const { user, refreshData } = useContext(GeneralContext);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState('BUY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!symbol || !quantity || !price) {
      setError('Please fill in all fields');
      return;
    }

    const orderData = {
      stockSymbol: symbol,
      stockName: symbol, // In a real app, you'd look up the company name
      orderType,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price)
    };

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const response = await portfolioAPI.placeOrder(orderData);
      
      if (response.data && response.data.success) {
        setSuccess(`Order placed successfully: ${orderType} ${quantity} ${symbol} @ ${formatCurrency(price)}`);
        // Refresh data in parent components
        if (refreshData) {
          await refreshData();
        }
        // Reset form
        setQuantity('');
        setPrice('');
      } else {
        setError(response.data?.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trade-container" style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <h2 style={{ margin: 0 }}>{orderType} {symbol || 'Stock'}</h2>
        {onClose && (
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            &times;
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          marginBottom: '15px',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #ddd'
        }}>
          <button
            type="button"
            onClick={() => setOrderType('BUY')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              backgroundColor: orderType === 'BUY' ? '#4CAF50' : '#f5f5f5',
              color: orderType === 'BUY' ? 'white' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setOrderType('SELL')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              backgroundColor: orderType === 'SELL' ? '#F44336' : '#f5f5f5',
              color: orderType === 'SELL' ? 'white' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            SELL
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '500',
              color: '#555'
            }}>
              Stock Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="e.g. RELIANCE"
              disabled={!!initialSymbol}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '500',
              color: '#555'
            }}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
              min="1"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="0"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '500',
              color: '#555'
            }}>
              Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="0.00"
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '0.9rem'
            }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: orderType === 'BUY' ? '#4CAF50' : '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? (
              'Placing Order...'
            ) : (
              `${orderType} ${symbol || 'Stock'}`
            )}
          </button>
        </form>
      </div>

      {user && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: '#555'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Available Balance:</span>
            <span style={{ fontWeight: '500' }}>₹{formatCurrency(user.accountBalance || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Investment:</span>
            <span style={{ fontWeight: '500' }}>₹{formatCurrency(user.totalInvestment || 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trade;
