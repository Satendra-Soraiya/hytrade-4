import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatters";
import { portfolioAPI } from "../services/api";

const Orders = ({ orders: propOrders = [], isLoading: propLoading = false }) => {
  const [orders, setOrders] = useState(propOrders);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState(null);

  // Fetch orders if not provided via props
  useEffect(() => {
    const fetchOrders = async () => {
      if (propOrders.length === 0) {
        try {
          setIsLoading(true);
          const response = await portfolioAPI.getOrders();
          setOrders(response.data || []);
          setError(null);
        } catch (err) {
          console.error('Error fetching orders:', err);
          setError('Failed to load orders. Please try again later.');
          setOrders([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [propOrders]);

  // Format order status for display
  const formatStatus = (status) => {
    const statusMap = {
      'COMPLETED': 'Completed',
      'PENDING': 'Pending',
      'CANCELLED': 'Cancelled',
      'REJECTED': 'Rejected',
      'EXECUTED': 'Executed',
      'PARTIALLY_FILLED': 'Partial Fill'
    };
    return statusMap[status] || status;
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('executed')) {
      return 'completed';
    } else if (statusLower.includes('pending') || statusLower.includes('open')) {
      return 'pending';
    } else if (statusLower.includes('cancel') || statusLower.includes('reject')) {
      return 'cancelled';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="orders">
        <h3 className="title">Orders</h3>
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <h3 className="title">Orders</h3>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders">
        <h3 className="title">Orders (0)</h3>
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to="/market" className="btn">
            Explore Market
          </Link>
        </div>
      </div>
    );
  }

  // Group orders by date
  const ordersByDate = orders.reduce((groups, order) => {
    const date = new Date(order.timestamp || order.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  return (
    <div className="orders">
      <h3 className="title">Orders ({orders.length})</h3>
      
      <div className="orders-container">
        {Object.entries(ordersByDate).map(([date, dateOrders]) => (
          <div key={date} className="orders-group">
            <div className="order-date">{date}</div>
            <div className="order-table">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dateOrders.map((order) => {
                    const isBuy = (order.type || order.side || '').toUpperCase() === 'BUY';
                    const value = (order.price || 0) * (order.quantity || 0);
                    const status = formatStatus(order.status || 'PENDING');
                    
                    return (
                      <tr key={order._id || order.orderId}>
                        <td>
                          <div className="symbol-cell">
                            <span className="symbol">{order.symbol || 'N/A'}</span>
                            <span className="name">{order.name || order.product}</span>
                          </div>
                        </td>
                        <td className={isBuy ? 'buy' : 'sell'}>
                          {isBuy ? 'Buy' : 'Sell'} {order.product === 'MIS' ? 'Intraday' : 'Delivery'}
                        </td>
                        <td>{order.quantity || order.filledQuantity || '0'}</td>
                        <td>{formatCurrency(order.price || order.averagePrice || 0)}</td>
                        <td>{formatCurrency(value)}</td>
                        <td className={getStatusClass(status)}>
                          {status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
