// // src/components/CartModal.jsx
// import React, { useState } from 'react';

// const CartModal = ({ cart = [], dispatch, total = 0, formatCurrency = amount => amount }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const openModal = () => setIsOpen(true);
//   const closeModal = () => setIsOpen(false);

//   const modalContent = (
//     <div style={modalOverlayStyle} onClick={closeModal}>
//       <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
//         <div style={headerStyle}>
//           <h2 style={titleStyle}>Carrito de Compras 🛒</h2>
//           <button onClick={closeModal} style={closeButtonStyle} aria-label="Cerrar modal">×</button>
//         </div>

//         {cart.length === 0 ? (
//           <p style={emptyTextStyle}>No hay productos agregados al carrito.</p>
//         ) : (
//           <>
//             {cart.map(item => (
//               <div key={item.id} style={itemRowStyle}>
//                 <div style={{ flexGrow: 1 }}>
//                   <h4 style={itemNameStyle}>{item.name}</h4>
//                   <p style={itemPriceStyle}>{formatCurrency(item.price)}</p>
//                 </div>
//                 <div style={quantityControlStyle}>
//                   <button
//                     onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
//                     style={qtyButtonStyle}
//                   >-</button>
//                   <span style={quantityTextStyle}>{item.quantity}</span>
//                   <button
//                     onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
//                     style={qtyButtonStyle}
//                   >+</button>
//                 </div>
//                 <div style={itemTotalStyle}>{formatCurrency(item.price * item.quantity)}</div>
//               </div>
//             ))}

//             <div style={totalContainerStyle}>
//               <h3 style={totalTextStyle}>Total: {formatCurrency(total)}</h3>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <button onClick={openModal} style={fabCartStyle} aria-label="Abrir carrito">
//         🛒 {cart.length}
//       </button>
//       {isOpen && modalContent}
//     </>
//   );
// };

// // Estilos del modal y botón flotante
// const fabCartStyle = {
//   position: 'fixed',
//   bottom: '20px',
//   right: '20px',
//   backgroundColor: '#3b82f6',
//   color: '#fff',
//   border: 'none',
//   borderRadius: '50%',
//   width: '50px',
//   height: '50px',
//   fontSize: '1.2rem',
//   cursor: 'pointer',
//   zIndex: 1001
// };
// const modalOverlayStyle = {
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: 'rgba(0,0,0,0.5)',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   zIndex: 1000
// };
// const modalContentStyle = {
//   backgroundColor: '#fff',
//   padding: '20px',
//   borderRadius: '8px',
//   width: '400px',
//   maxHeight: '80vh',
//   overflowY: 'auto',
//   boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
// };
// const headerStyle = {
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   marginBottom: '15px',
//   borderBottom: '1px solid #e2e8f0',
//   paddingBottom: '10px'
// };
// const titleStyle = { margin: 0, fontSize: '1.25rem', color: '#1e293b' };
// const closeButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' };
// const emptyTextStyle = { textAlign: 'center', color: '#64748b', fontSize: '0.95rem' };
// const itemRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
// const itemNameStyle = { margin: '0 0 5px 0', fontSize: '1rem', color: '#334155' };
// const itemPriceStyle = { margin: 0, fontSize: '0.85rem', color: '#64748b' };
// const quantityControlStyle = { display: 'flex', alignItems: 'center', gap: '10px' };
// const qtyButtonStyle = { padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f1f5f9', fontWeight: 'bold' };
// const quantityTextStyle = { minWidth: '25px', textAlign: 'center', fontSize: '0.95rem' };
// const itemTotalStyle = { minWidth: '80px', textAlign: 'right', fontWeight: 600, color: '#10b981' };
// const totalContainerStyle = { marginTop: '20px', textAlign: 'right', borderTop: '2px solid #cbd5e1', paddingTop: '10px' };
// const totalTextStyle = { margin: 0, fontSize: '1.2rem', color: '#1e293b' };

// export default CartModal;

// src/components/CartModal.jsx
import React from 'react';

const CartModal = ({ isOpen, onClose, itemsDelCarrito = [], enIncremento, enReduccion }) => {
  if (!isOpen) return null;

  const calcularTotal = () =>
    itemsDelCarrito.reduce(
      (suma, item) => suma + (parseFloat(item.precio) || 0) * (item.cantidad || 0),
      0
    );

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Carrito de Compras 🛒</h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Cerrar modal">×</button>
        </div>

        {itemsDelCarrito.length === 0 ? (
          <p style={emptyTextStyle}>No hay productos en el carrito.</p>
        ) : (
          <>
            {itemsDelCarrito.map(item => (
              <div key={item.productoId} style={itemRowStyle}>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={itemNameStyle}>{item.nombre}</h4>
                  <p style={itemPriceStyle}>Precio unitario: ${parseFloat(item.precio)?.toLocaleString()}</p>
                </div>
                <div style={quantityControlStyle}>
                  <button onClick={() => enReduccion(item.productoId)} style={qtyButtonStyle}>-</button>
                  <span style={quantityTextStyle}>{item.cantidad}</span>
                  <button onClick={() => enIncremento(item.productoId)} style={qtyButtonStyle}>+</button>
                </div>
                <div style={itemTotalStyle}>${((parseFloat(item.precio)||0) * item.cantidad).toLocaleString()}</div>
              </div>
            ))}

            <div style={totalContainerStyle}>
              <h3 style={totalTextStyle}>Total: <span style={{ color: '#3b82f6' }}>${calcularTotal().toLocaleString()}</span></h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContentStyle = {
  backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
  width: '400px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
};
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'
};
const titleStyle = { margin: 0, fontSize: '1.25rem', color: '#1e293b' };
const closeButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' };
const emptyTextStyle = { textAlign: 'center', color: '#64748b', fontSize: '0.95rem' };
const itemRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const itemNameStyle = { margin: '0 0 5px 0', color: '#334155', fontSize: '0.95rem' };
const itemPriceStyle = { margin: 0, fontSize: '0.8rem', color: '#64748b' };
const quantityControlStyle = { display: 'flex', alignItems: 'center', gap: '12px' };
const qtyButtonStyle = {
  padding: '6px 10px', cursor: 'pointer', backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0', color: '#334155', borderRadius: '4px', fontWeight: 'bold'
};
const quantityTextStyle = { fontSize: '0.9rem', color: '#1e293b', minWidth: '20px', textAlign: 'center' };
const itemTotalStyle = { minWidth: '90px', textAlign: 'right', fontWeight: 600, color: '#10b981', fontSize: '0.95rem' };
const totalContainerStyle = { marginTop: '25px', textAlign: 'right', borderTop: '2px solid #cbd5e1', paddingTop: '20px' };
const totalTextStyle = { margin: 0, color: '#1e293b', fontSize: '1.2rem' };

export default CartModal;
