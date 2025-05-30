import React from 'react';

const CartModal = ({ itemsDelCarrito, enIncremento, enReduccion, isOpen, onClose, }) => {
  if (!isOpen) return null;


  const calcularTotal = () => {
    return itemsDelCarrito.reduce((suma, item) => suma + (parseFloat(item.precio) * item.cantidad), 0);
  };

  if (!itemsDelCarrito || itemsDelCarrito.length === 0) {
    return (
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
        <h2 style={{ textAlign: 'center', color: '#334155' }}>Carrito de Compras 🛒</h2>
        <p style={{ textAlign: 'center', color: '#64748b' }}>No hay productos agregados al carrito.</p>
      </div>
    );
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{
          textAlign: 'center',
          color: '#1e293b',
          marginBottom: '25px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '15px'
        }}>
          Productos Agregados 🛒
        </h2>
        {itemsDelCarrito.map(item => (
          <div
            key={item.productoId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f1f5f9'
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '0.95rem' }}>{item.nombre}</h4>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#64748b' }}>
                Precio: ${parseFloat(item.precio)?.toLocaleString() || '0'} c/u
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 15px' }}>
              <button
                onClick={() => enReduccion(item.productoId)}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <span style={{ fontSize: '0.9rem', color: '#1e293b', minWidth: '20px', textAlign: 'center' }}>{item.cantidad}</span>
              <button
                onClick={() => enIncremento(item.productoId)}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
            <div style={{ minWidth: '90px', textAlign: 'right' }}>
              <p style={{ margin: '0', fontWeight: '600', color: '#10b981', fontSize: '0.95rem' }}>
                ${(parseFloat(item.precio) * item.cantidad).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div style={{
          marginTop: '25px',
          textAlign: 'right',
          borderTop: '2px solid #cbd5e1',
          paddingTop: '20px'
        }}>
          <h3 style={{ margin: '0', color: '#1e293b', fontSize: '1.2rem' }}>
            Total: <span style={{ color: '#3b82f6' }}>${calcularTotal().toLocaleString()}</span>
          </h3>
        </div>
      </div>
    </div>
  );
};

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

export default CartModal;