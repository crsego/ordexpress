import React from 'react';

function Notification({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      zIndex: 1000,
      minWidth: '250px',
      fontSize: '16px'
    }}>
      {message}
      <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: 'white',
        float: 'right',
        fontSize: '20px',
        marginLeft: '10px',
        cursor: 'pointer'
      }}>×</button>
    </div>
  );
}

export default Notification;
