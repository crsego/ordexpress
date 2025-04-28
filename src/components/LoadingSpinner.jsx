// src/components/LoadingSpinner.jsx
import React from 'react';

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '10px', fontSize: '18px', color: '#555' }}>Cargando...</p>
      <style>
        {`
          .spinner {
            width: 60px;
            height: 60px;
            border: 6px solid #ccc;
            border-top: 6px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default LoadingSpinner;
