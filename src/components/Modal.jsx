import React from 'react';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        {children}
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0px 2px 10px rgba(0,0,0,0.3)',
  position: 'relative',
};

const closeButtonStyle = {
  marginTop: '20px',
  backgroundColor: '#dc3545',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '4px'
};

export default Modal;
