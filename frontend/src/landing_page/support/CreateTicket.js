import React, { useState } from 'react';
import './CreateTicket.css'; // Custom styles if needed

function CreateTicket() {
  const [open, setOpen] = useState({
    opening: false,
    account: false,
    kite: false,
    funds: false,
    console: false,
    coin: false
  });

  const toggleSection = (key) => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">

          {/* Section 1 */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('opening')}>
              Account Opening <span>{open.opening ? '−' : '+'}</span>
            </div>
            {open.opening && (
              <div className="section-body">
                <ul>
                  <li>Minor</li>
                  <li>Non Resident Indian</li>
                  <li>Company, Partnership, HUF, and LLP</li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 2 */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('account')}>
              Your Hytrade Account <span>{open.account ? '−' : '+'}</span>
            </div>
            {open.account && (
              <div className="section-body">
                <ul>
                  <li>Your profile</li>
                  <li>Account Modification</li>
                  <li>Nomination</li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('kite')}>
              Kite <span>{open.kite ? '−' : '+'}</span>
            </div>
            {open.kite && (
              <div className="section-body">
                <ul>
                  <li>Trading FAQs</li>
                  <li>Charts and Orders</li>
                  <li>IPO</li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 4 */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('funds')}>
              Funds <span>{open.funds ? '−' : '+'}</span>
            </div>
            {open.funds && (
              <div className="section-body">
                <ul>
                  <li>Add Money</li>
                  <li>Withdraw Money</li>
                  <li>Add bank accounts</li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 5 */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('console')}>
              Console <span>{open.console ? '−' : '+'}</span>
            </div>
            {open.console && (
              <div className="section-body">
                <ul>
                  <li>Profile</li>
                  <li>Funds statement</li>
                  <li>Reports</li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 6 */}
          <div className="section">
            <div className="section-header" onClick={() => toggleSection('coin')}>
              Coin <span>{open.coin ? '−' : '+'}</span>
            </div>
            {open.coin && (
              <div className="section-body">
                <ul>
                  <li>Features of Coin</li>
                  <li>Fixed Deposit</li>
                  <li>Mutual Funds</li>
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
