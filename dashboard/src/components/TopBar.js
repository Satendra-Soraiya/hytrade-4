import React from "react";
import Menu from "./Menu";

const TopBar = ({ user }) => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">18181.75</p>
          <p className="percent negative">-104.75 (-0.57%)</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">61560.64</p>
          <p className="percent negative">-371.83 (-0.60%)</p>
        </div>
      </div>

      <div className="user-section">
        <div className="user-info">
          <span className="welcome-text">Hi, {user.firstName}</span>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
