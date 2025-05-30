// src/components/Menu.jsx
import React, { useState, useEffect, useCallback } from "react";
import Modal from './Modal';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/url";
import CartModal from "./CartModal";

const Menu = () => {
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loadingToken, setLoadingToken] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [itemsDelCarrito, setItemsDelCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const { search } = useLocation();
  const navigate = useNavigate();
  const base_url = API_BASE_URL;

  // Carga de productos
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const orgId = localStorage.getItem('organizationId');
      if (!orgId) throw new Error('No organizationId');
      const { data } = await axios.get(`${base_url}/api/Productos/${orgId}/list`);
      setProductsList(data);
      setFilteredProducts(data);
    } catch {
      setErrorProducts('Error al cargar productos.');
    } finally {
      setLoadingProducts(false);
    }
  }, [base_url]);

  // Inicialización de token y organización
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const token = new URLSearchParams(search).get('token');
      if (token) {
        setLoadingToken(true);
        try {
          const { data } = await axios.post(`${base_url}/api/mesas/token`, { token });
          if (!mounted) return;
          localStorage.setItem('mesaId', data.mesaId);
          localStorage.setItem('organizationId', data.organizationId);
          setShowWelcome(true);
          setTimeout(() => {
            if (!mounted) return;
            setShowWelcome(false);
            setLoadingToken(false);
            fetchProducts();
          }, 2000);
        } catch {
          if (!mounted) return;
          navigate('/');
        }
      } else {
        setLoadingToken(false);
        fetchProducts();
      }
    };
    init();
    return () => { mounted = false; };
  }, [search, base_url, fetchProducts, navigate]);

  // Filtra por categoría
  const handleCategoryClick = cat => {
    setSelectedCategory(cat);
    setFilteredProducts(cat ? productsList.filter(p => p.categoria === cat) : productsList);
  };

  // Abre modal para elegir cantidad
  const openAddModal = prod => {
    setSelectedProduct(prod);
    setQuantity(1);
    setShowAddModal(true);
  };

  // Al confirmar, envía al backend y actualiza local
  const handleConfirmAddProduct = async () => {
    const mesaId = localStorage.getItem('mesaId');
    const pedidoId = localStorage.getItem('pedidoId');
    if (!mesaId || !selectedProduct) return;
    try {
      const dto = {
        mesaId: +mesaId,
        productoId: selectedProduct.productoId,
        cantidad: quantity,
        pedidoId: pedidoId ? +pedidoId : null
      };
      const { data } = await axios.post(`${base_url}/api/Pedidos/agregar-producto`, dto);
      localStorage.setItem('pedidoId', data.pedidoId);
      // Actualiza carrito local
      setItemsDelCarrito(prev => {
        const exists = prev.find(i => i.productoId === selectedProduct.productoId);
        if (exists) {
          return prev.map(i =>
            i.productoId === selectedProduct.productoId
              ? { ...i, cantidad: i.cantidad + quantity }
              : i
          );
        }
        return [...prev, {
          productoId: selectedProduct.productoId,
          nombre: selectedProduct.nombre,
          precio: parseFloat(selectedProduct.precio),
          cantidad: quantity
        }];
      });
      setShowAddModal(false);
    } catch {
      console.error('Error agregando producto');
      alert('No se pudo agregar el producto.');
    }
  };

  // Carga el pedido completo y abre el modal
  const handleOpenCart = async () => {
    const pedidoId = localStorage.getItem('pedidoId');
    console.log(pedidoId)
    if (!pedidoId) return alert('No hay un pedido activo.');
    try {
      const { data } = await axios.get(`${base_url}/api/Pedidos/pedido/${pedidoId}`);
      const detalles = data.detalles.map(d => ({
        productoId: d.productoId,
        nombre: d.nombreProducto,
        precio: d.precioUnitario,
        cantidad: d.cantidad
      }));
      setItemsDelCarrito(detalles);
      setMostrarCarrito(true);
    } catch {
      alert('No se pudo cargar el carrito.');
    }
  };

  // Incremento/reducción en el modal
  const manejarIncrementarCantidad = id => {
    setItemsDelCarrito(prev => prev.map(i =>
      i.productoId === id ? { ...i, cantidad: i.cantidad + 1 } : i
    ));
  };
  const manejarReducirCantidad = id => {
    setItemsDelCarrito(prev => {
      const item = prev.find(i => i.productoId === id);
      if (item && item.cantidad === 1) return prev.filter(i => i.productoId !== id);
      return prev.map(i =>
        i.productoId === id ? { ...i, cantidad: i.cantidad - 1 } : i
      );
    });
  };

  if (loadingToken) return <p style={{ textAlign: 'center' }}>Cargando mesa…</p>;
  if (showWelcome) return <p style={{ textAlign: 'center' }}>¡Bienvenido! Cargando menú…</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Menú de Productos</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['', 'ENTRANCE', 'MAIN_COURSE', 'DRINK', 'DESSERT'].map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            style={{
              padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0',
              background: cat === selectedCategory ? '#3b82f6' : '#fff',
              color: cat === selectedCategory ? '#fff' : '#1e293b',
              cursor: 'pointer'
            }}
          >{cat || 'Todos'}</button>
        ))}
      </div>

      {loadingProducts ? (
        <p style={{ textAlign: 'center' }}>Cargando productos…</p>
      ) : errorProducts ? (
        <p style={{ textAlign: 'center', color: 'red' }}>{errorProducts}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '20px' }}>
          {filteredProducts.map(prod => (
            <div
              key={prod.productoId}
              style={{
                border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', background: '#fff'
              }}
            >
              <div
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => openAddModal(prod)}
              >
                <img
                  src={prod.imageUrl || 'https://placehold.co/300x180'}
                  alt={prod.nombre}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute', bottom: '8px', left: '8px',
                    background: prod.stock > 0 ? 'rgba(52,211,153,0.9)' : 'rgba(239,68,68,0.9)',
                    color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem'
                  }}
                >
                  {prod.stock > 0 ? `${prod.stock} unidades` : 'Agotado'}
                </div>
              </div>
              <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
                <h3
                  onClick={() => openAddModal(prod)}
                  style={{ margin: 0, cursor: 'pointer', color: '#1e293b' }}
                >
                  {prod.nombre}
                </h3>
                <p style={{ flex: 1, fontSize: '0.85rem', color: '#64748b', margin: '8px 0' }}>
                  {prod.descripcion}
                </p>
                <p style={{ fontWeight: '700', color: '#10b981', fontSize: '1.1rem' }}>
                  ${parseFloat(prod.precio).toLocaleString()}
                </p>
                <button
                  onClick={() => openAddModal(prod)}
                  disabled={prod.stock === 0}
                  style={{
                    marginTop: 'auto', padding: '10px', border: 'none', borderRadius: '4px',
                    background: prod.stock === 0 ? '#9ca3af' : '#3b82f6', color: '#fff',
                    cursor: prod.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {prod.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={handleOpenCart}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          backgroundColor: '#3b82f6', color: '#fff', border: 'none',
          borderRadius: '50%', width: '50px', height: '50px',
          fontSize: '1.2rem', cursor: 'pointer', zIndex: 1001
        }}
      >
        🛒 {itemsDelCarrito.reduce((acc, i) => acc + i.cantidad, 0)}
      </button>

      {/* Modal del carrito */}
      {mostrarCarrito && (
        <CartModal
          isOpen={mostrarCarrito}
          onClose={() => setMostrarCarrito(false)}
          itemsDelCarrito={itemsDelCarrito}
          enIncremento={manejarIncrementarCantidad}
          enReduccion={manejarReducirCantidad}
        />
      )}

      {/* Modal interno de cantidad */}
      {showAddModal && (
        <Modal isOpen onClose={() => setShowAddModal(false)}>
          <h3>Agregar al Pedido</h3>
          <p><strong>{selectedProduct.nombre}</strong></p>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(+e.target.value)}
            style={{ width: '100%', padding: '8px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button onClick={handleConfirmAddProduct} style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', background: '#3b82f6', color: '#fff' }}>Confirmar</button>
            <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', background: '#f44336', color: '#fff' }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Menu;
