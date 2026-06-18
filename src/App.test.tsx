import React from 'react';

// Minimal test component
function TestApp() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#2563EB' }}>🎉 StegaGen Secure - System Check</h1>
      <p>If you see this, React is working!</p>
      <ul>
        <li>✅ React rendering works</li>
        <li>✅ HTML loaded</li>
        <li>✅ JavaScript executing</li>
      </ul>
      <p style={{ color: '#22C55E', fontWeight: 'bold' }}>
        System is functional! Now checking full app...
      </p>
    </div>
  );
}

export default TestApp;
