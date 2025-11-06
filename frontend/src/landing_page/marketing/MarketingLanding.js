import React from 'react';

function MarketingLanding() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 960, width: '100%' }}>
        <h1 style={{ marginBottom: 12 }}>Hytrade Marketing Landing (Preview)</h1>
        <p style={{ color: '#4b5563' }}>
          This is a safe preview route (/preview). I will integrate the Lovable page contents here next
          without affecting the current homepage. Once approved, we will switch the root (/) to this page.
        </p>
      </div>
    </div>
  );
}

export default MarketingLanding;
