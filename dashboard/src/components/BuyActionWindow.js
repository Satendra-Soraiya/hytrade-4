import React, { useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const handleBuyClick = () => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // Check if user is logged in
    if (!token) {
      alert('Please log in first to place orders!');
      window.location.href = 'http://localhost:3001/login';
      return;
    }
    
    // Validate inputs
    if (!stockQuantity || stockQuantity <= 0) {
      alert('Please enter a valid quantity!');
      return;
    }
    
    if (!stockPrice || stockPrice <= 0) {
      alert('Please enter a valid price!');
      return;
    }
    
    console.log('Placing order:', { name: uid, qty: stockQuantity, price: stockPrice, mode: 'BUY' });
    
    axios.post("http://localhost:3003/custom/order", {
      stockSymbol: uid,
      stockName: uid, // Using symbol as name for now
      orderType: "BUY",
      quantity: stockQuantity,
      price: stockPrice,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      console.log('Order placed successfully:', response.data);
      alert(`Order placed successfully! Bought ${stockQuantity} shares of ${uid} at ₹${stockPrice}`);
      // Close the buy window first
      GeneralContext.closeBuyWindow();
      // Then refresh to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }).catch((error) => {
      console.error('Error placing order:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        window.location.href = 'http://localhost:3001/login';
      } else {
        alert(`Error placing order: ${error.response?.data?.message || error.message}`);
      }
    });
  };

  const handleCancelClick = () => {
    GeneralContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <Link className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
