// src/components/CartModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/url';

const CartModal = ({ itemsDelCarrito = [], onCartUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localItems, setLocalItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [estadoPedido, setEstadoPedido] = useState('NEW');
  const [pagado, setPagado] = useState(false);
  const [userName, setUserName] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const pedidoIdRef = useRef(null);

  // Alterna apertura del modal
  const toggleModal = () => {
    if (!isOpen) {
      setLoading(true);
      setLocalItems([]);
    }
    setIsOpen(open => !open);
  };

  // Carga datos cada vez que se abre
  useEffect(() => {
    if (!isOpen) return;
    const pedidoId = parseInt(localStorage.getItem('pedidoId'), 10);
    pedidoIdRef.current = pedidoId;
    if (!isNaN(pedidoId)) {
      axios.get(`${API_BASE_URL}/api/Pedidos/pedido/${pedidoId}`)
        .then(({ data }) => {
          setEstadoPedido(data.estado);
          setPagado(data.pagado);
          const detalles = data.detalles.map(d => ({
            productoId: d.productoId,
            nombre: d.nombreProducto,
            precio: d.precioUnitario,
            cantidad: d.cantidad
          }));
          setLocalItems(detalles);
        })
        .catch(() => setLocalItems(itemsDelCarrito.map(i => ({ ...i }))))
        .finally(() => {
          setDirty(false);
          setLoading(false);
        });
    } else {
      setLocalItems(itemsDelCarrito.map(i => ({ ...i })));
      setDirty(false);
      setLoading(false);
    }
  }, [isOpen, itemsDelCarrito]);

  const calcularTotal = () =>
    localItems.reduce((sum, i) => sum + (i.precio || 0) * (i.cantidad || 0), 0);

  const saveChanges = async () => {
    const pedidoId = pedidoIdRef.current;
    if (isNaN(pedidoId)) return;
    await axios.post(`${API_BASE_URL}/api/Pedidos/actualizar-cantidades`, {
      pedidoId,
      items: localItems.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
    });
    setDirty(false);
    onCartUpdated?.(localItems);
  };

  const sendOrder = async () => {
    if (!userName.trim()) {
      setUserNameError('Campo obligatorio');
      return;
    }
    setUserNameError('');
    try {
      const pedidoId = pedidoIdRef.current;
      const { data } = await axios.post(`${API_BASE_URL}/api/Pedidos/enviar`, { pedidoId, nombreCliente: userName });
      setEstadoPedido('PENDING');
      alert(data.message || 'Pedido enviado exitosamente.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar pedido.');
    }
  };

  const payOrder = async () => {
    try {
      const pedidoId = pedidoIdRef.current;
      const { data } = await axios.post(`${API_BASE_URL}/api/Pedidos/${pedidoId}/pagar`);
      setPagado(true);
      alert(data.message || 'Pedido pagado exitosamente.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar pago.');
    }
  };

  const finalize = () => {
    localStorage.removeItem('pedidoId');
    localStorage.removeItem('mesaId');
    localStorage.removeItem('organizationId');
    setIsOpen(false);
  };

  const handleClose = async () => {
    if (dirty) await saveChanges();
    setIsOpen(false);
  };

  const changeQty = (id, delta) => {
    if (pagado) return;
    setLocalItems(prev => prev.map(i =>
      i.productoId === id ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i
    ));
    setDirty(true);
  };

  // Eliminar item marcándolo con cantidad 0
  const handleRemoveItem = id => {
    if (pagado) return;
    setLocalItems(prev => prev.map(i =>
      i.productoId === id ? { ...i, cantidad: 0 } : i
    ));
    setDirty(true);
  };

  // Determinar etiqueta y acción del botón principal
  let mainLabel = 'Guardar';
  let mainAction = saveChanges;
  if (pagado) {
    mainLabel = 'Finalizar'; mainAction = finalize;
  } else if (!dirty && estadoPedido === 'NEW') {
    mainLabel = 'Enviar'; mainAction = sendOrder;
  } else if (!dirty && estadoPedido !== 'NEW' && !pagado) {
    mainLabel = 'Pagar'; mainAction = payOrder;
  }

  return (
    <>
      {/* Botón flotante */}
      <button onClick={toggleModal} style={fabStyle}>
        🛒 {itemsDelCarrito.reduce((sum, i) => sum + i.cantidad, 0)}
      </button>

      {isOpen && (
        <div style={overlayStyle} onClick={handleClose}>
          <div style={modalContainerStyle} onClick={e => e.stopPropagation()}>
            <div style={headerStyle}>
              <h2 style={titleStyle}>Carrito de Compras 🛒</h2>
              <button onClick={handleClose} style={closeBtnStyle}>×</button>
            </div>

            {loading ? (
              <div style={loadingStyle}>Cargando carrito...</div>
            ) : (
              <>
                <div style={inputContainerStyle}>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={userName}
                    onChange={e => { setUserName(e.target.value); if (e.target.value.trim()) setUserNameError(''); }}
                    disabled={estadoPedido !== 'NEW'}
                    style={{
                      ...inputStyle,
                      borderColor: userNameError ? 'red' : inputStyle.borderColor
                    }}
                  />
                  {userNameError && <span style={errorTextStyle}>{userNameError}</span>}
                </div>

                <div style={listStyle}>
                  {localItems.filter(item => item.cantidad > 0).length === 0 ? (
                    <p style={emptyStyle}>No hay productos.</p>
                  ) : (
                    localItems.filter(item => item.cantidad > 0).map(item => (
                      <div key={item.productoId} style={rowStyle}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h4 style={nameStyle}>{item.nombre}</h4>
                          <p style={priceStyle}>${item.precio.toLocaleString()}</p>
                        </div>
                        <div style={qtyCtrlStyle}>
                          <button onClick={() => changeQty(item.productoId, -1)} style={qtyBtn} disabled={pagado}>-</button>
                          <span style={qtyText}>{item.cantidad}</span>
                          <button onClick={() => changeQty(item.productoId, 1)} style={qtyBtn} disabled={pagado}>+</button>
                        </div>
                        <div style={itemTotalStyle}>${(item.precio * item.cantidad).toLocaleString()}</div>
                        <button onClick={() => handleRemoveItem(item.productoId)} style={removeBtnStyle}>×</button>
                      </div>
                    ))
                  )}
                </div>

                <div style={footerStyle}>
                  <h3>Total: ${calcularTotal().toLocaleString()}</h3>
                  <button onClick={mainAction} style={saveBtn}>{mainLabel}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Estilos
const fabStyle = { position:'fixed', bottom:'20px', right:'20px', backgroundColor:'#3b82f6', color:'#fff', border:'none', borderRadius:'50%', width:'50px', height:'50px', fontSize:'1.2rem', cursor:'pointer', zIndex:1001 };
const overlayStyle = { position:'fixed', top:0,left:0,right:0,bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const modalContainerStyle = { background:'#fff', padding:'20px', borderRadius:'8px', width:'90%', maxWidth:'400px', height:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 2px 10px rgba(0,0,0,0.3)' };
const loadingStyle = { textAlign:'center', flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' };
const headerStyle = { display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0', paddingBottom:'10px', marginBottom:'15px' };
const titleStyle = { margin:0, color:'#1e293b' };
const closeBtnStyle = { background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#64748b' };
const inputContainerStyle = { marginBottom:'15px' };
const inputStyle = { width:'100%', padding:'8px', border:'1px solid #cbd5e1', borderRadius:'4px' };
const errorTextStyle = { color:'red', fontSize:'0.75rem', marginTop:'4px' };
const listStyle = { flex:1, overflowY:'auto', paddingRight:'4px' };
const emptyStyle = { textAlign:'center', color:'#64748b', margin:'20px 0' };
const rowStyle = { display:'flex', alignItems:'center', justifyContent:'flex-start', gap:'12px', marginBottom:'15px', borderBottom:'1px solid #f1f5f9', paddingBottom:'10px' };
const removeBtnStyle = { background:'none', border:'none', color:'#e53e3e', fontSize:'1.2rem', cursor:'pointer' };
const nameStyle = { margin:0, fontSize:'0.95rem', color:'#334155' };
const priceStyle = { margin:0, fontSize:'0.8rem', color:'#64748b' };
const qtyCtrlStyle = { display:'flex', alignItems:'center', gap:'8px' };
const qtyBtn = { padding:'6px 10px', border:'1px solid #e2e8f0', borderRadius:'4px', background:'#f1f5f9', cursor:'pointer' };
const qtyText = { minWidth:'20px', textAlign:'center' };
const itemTotalStyle = { fontWeight:'600', color:'#10b981' };
const footerStyle = { display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'2px solid #cbd5e1', paddingTop:'15px', marginTop:'10px' };
const saveBtn = { padding:'8px 16px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' };

export default CartModal;
