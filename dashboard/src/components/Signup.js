import React from 'react';

const Signup = () => {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Dashboard Access</h2>
        <p>This dashboard is now open access. No signup required.</p>
        <p>You can access all features directly.</p>
        <div className="auth-footer">
          <a href="/">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
