// src/components/Menu.jsx
import React, { useState, useEffect, useCallback } from "react";
import Modal from './Modal';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/url";
import CartModal from "./CartModal";

const Menu = () => {
  // State variables
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [loadingToken, setLoadingToken] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [itemsDelCarrito, setItemsDelCarrito] = useState([]);

  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();
  const base_url = API_BASE_URL;

  // Styles
  const styles = {
    centerText: { textAlign: 'center' },
    button: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.3s' },
    sidebar: { position: 'fixed', top: 0, left: showFilterMenu ? 0 : '-260px', width: '250px', height: '100vh', background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.2)', paddingTop: '60px', display: 'flex', flexDirection: 'column', transition: 'left 0.3s', zIndex: 1000 },
    sidebarItem: { background: 'none', border: 'none', textAlign: 'left', padding: '12px 20px', fontSize: '1rem', cursor: 'pointer' },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999 },
    card: { maxWidth: isMobile ? '100%' : '260px', width: isMobile ? '100%' : '280px', height: '320px', display: 'flex', flexDirection: 'column', margin: '3px auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '20px', marginLeft: isMobile && showFilterMenu ? '270px' : '0' }
  };

  // Responsive listener
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Fetch categories (cached)
  useEffect(() => {
    const cache = sessionStorage.getItem('productCategories');
    if (cache) {
      setCategories(JSON.parse(cache));
    } else {
      axios.get(`${base_url}/api/Metadata/productCategory`)
        .then(({ data }) => {
          setCategories(data);
          sessionStorage.setItem('productCategories', JSON.stringify(data));
        })
        .catch(() => console.warn('Error al cargar categorías'));
    }
  }, [base_url]);

  // Fetch products
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

  // Initialize token and organization
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const token = new URLSearchParams(search).get('token');
      const hasMesa = localStorage.getItem('mesaId');
      if (token && !hasMesa) {
        setLoadingToken(true);
        try {
          const { data } = await axios.post(`${base_url}/api/mesas/token`, { token });
          if (!mounted) return;
          localStorage.setItem('mesaId', data.mesaId);
          localStorage.setItem('organizationId', data.organizationId);
          navigate(location.pathname, { replace: true });
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
  }, [search, base_url, fetchProducts, navigate, location.pathname]);

  // Category filter handler
  const handleCategoryClick = (value) => {
    setSelectedCategory(value);
    setFilteredProducts(value ? productsList.filter(p => p.categoria === value) : productsList);
    if (isMobile) setShowFilterMenu(false);
  };

  // Open add modal
  const openAddModal = (prod) => { setSelectedProduct(prod); setQuantity(1); setShowAddModal(true); };

  // Confirm add product
  const handleConfirmAddProduct = async () => {
    const mesaId = localStorage.getItem('mesaId');
    const pedidoId = localStorage.getItem('pedidoId');
    if (!mesaId || !selectedProduct) return;
    try {
      const dto = { mesaId: +mesaId, productoId: selectedProduct.productoId, cantidad: quantity, pedidoId: pedidoId ? +pedidoId : null };
      const { data } = await axios.post(`${base_url}/api/Pedidos/agregar-producto`, dto);
      localStorage.setItem('pedidoId', data.pedidId || data.pedidoId);
      setItemsDelCarrito(prev => {
        const exists = prev.find(i => i.productoId === selectedProduct.productoId);
        if (exists) return prev.map(i => i.productoId === selectedProduct.productoId ? { ...i, cantidad: i.cantidad + quantity } : i);
        return [...prev, { productoId: selectedProduct.productoId, nombre: selectedProduct.nombre, precio: parseFloat(selectedProduct.precio), cantidad: quantity }];
      });
      setShowAddModal(false);
    } catch {
      alert('No se pudo agregar el producto.');
    }
  };

  // Early returns for loading states
  if (loadingToken) return <p style={styles.centerText}>Cargando mesa…</p>;
  if (showWelcome) return <p style={styles.centerText}>¡Bienvenido! Cargando menú…</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Menú de Productos</h2>

      {/* Filters */}
      {isMobile ? (
        <>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            style={{ ...styles.button, fontSize: '1.5rem', width: '50px', height: '50px', borderRadius: '8px', marginBottom: '10px' }}
          >
            ☰
          </button>
          {showFilterMenu && <div style={styles.overlay} onClick={() => setShowFilterMenu(false)} />}
          <div style={styles.sidebar}>
            <button onClick={() => handleCategoryClick('')} style={styles.sidebarItem}>Todos</button>
            {categories.map(cat => (
              <button key={cat.value} onClick={() => handleCategoryClick(cat.value)} style={styles.sidebarItem}>
                {cat.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => handleCategoryClick('')} style={styles.button}>Todos</button>
          {categories.map(cat => (
            <button key={cat.value} onClick={() => handleCategoryClick(cat.value)} style={styles.button}>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loadingProducts ? (
        <p style={styles.centerText}>Cargando productos…</p>
      ) : errorProducts ? (
        <p style={{ ...styles.centerText, color: 'red' }}>{errorProducts}</p>
      ) : (
        <div style={styles.grid}>
          {filteredProducts.map(prod => (
            <div
              key={prod.productoId}
              style={{
                ...styles.card,
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff'
              }}
            >
              <div onClick={() => openAddModal(prod)} style={{ position: 'relative', cursor: 'pointer' }}>
                <img
                  src={prod.imageUrl || 'https://placehold.co/300x180'}
                  alt={prod.nombre}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: prod.stock > 0 ? 'rgba(52,211,153,0.9)' : 'rgba(239,68,68,0.9)', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                  {prod.stock > 0 ? `${prod.stock} unidades` : 'Agotado'}
                </div>
              </div>
              <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
                <h3 onClick={() => openAddModal(prod)} style={{ margin: 0, cursor: 'pointer', color: '#1e293b' }}>{prod.nombre}</h3>
                <p style={{ flex: 1, fontSize: '0.85rem', color: '#64748b', margin: '8px 0' }}>{prod.descripcion}</p>
                <p style={{ fontWeight: '700', color: '#10b981', fontSize: '1.1rem' }}>${parseFloat(prod.precio).toLocaleString()}</p>
                <button
                  onClick={() => openAddModal(prod)}
                  disabled={prod.stock === 0}
                  style={{ marginTop: 'auto', padding: '10px', border: 'none', borderRadius: '4px', background: prod.stock === 0 ? '#9ca3af' : '#3b82f6', color: '#fff', cursor: prod.stock === 0 ? 'not-allowed' : 'pointer' }}
                >
                  {prod.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CartModal itemsDelCarrito={itemsDelCarrito} onCartUpdated={setItemsDelCarrito} />

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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={handleConfirmAddProduct} style={{ ...styles.button, flex: 1, marginRight: '10px' }}>Confirmar</button>
            <button onClick={() => setShowAddModal(false)} style={{ ...styles.button, background: '#f44336', flex: 1 }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Menu;
