import React, { useState, useEffect, useCallback } from "react";
import Modal from './Modal';
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

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
  const default_url ="https://ordexpress-api.onrender.com";

  // Corrección: Desestructurar 'search' directamente de useLocation()
  const { search } = useLocation();
  const navigate = useNavigate();

  // Función para obtener productos, memoizada con useCallback
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const organizationId = localStorage.getItem('organizationId');
      if (!organizationId) {
        console.error("No se encontró organizationId en el localStorage. No se pueden cargar productos.");
        setErrorProducts("No se encontró organización asociada.");
        return;
      }

      const url = `${default_url}/api/Productos/${parseInt(organizationId, 10)}/list`;
      const response = await axios.get(url);
      console.log("✅ Productos cargados:", response.data);

      setProductsList(response.data);
      setFilteredProducts(response.data);

    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      setErrorProducts("Error al cargar productos.");
    } finally {
      setLoadingProducts(false);
    }
  }, [default_url]); // Solo default_url como dependencia, haciendo que fetchProducts sea estable.

  // useEffect para la carga inicial y manejo del token
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones de estado en componentes desmontados

    const loadInitialDataAndProducts = async () => {
      // Corrección: Crear URLSearchParams dentro del efecto con la dependencia 'search'
      const queryParams = new URLSearchParams(search);
      const token = queryParams.get("token");

      if (token && !localStorage.getItem("mesaId")) {
        setLoadingToken(true);
        try {
          const response = await axios.post(`${default_url}/api/mesas/token`, { token });
          if (!isMounted) return; // Si el componente se desmontó, no actualizamos el estado
          const { mesaId, organizationId } = response.data;
          localStorage.setItem("mesaId", mesaId);
          localStorage.setItem("organizationId", organizationId);
          console.log("✅ Token válido. Mesa cargada:", response.data);
          setShowWelcome(true);
          setTimeout(() => {
            if (!isMounted) return; // Si el componente se desmontó, no actualizamos el estado
            setShowWelcome(false);
            setLoadingToken(false);
            fetchProducts(); // Llama a fetchProducts después de la carga del token
          }, 2000);
        } catch (error) {
          if (!isMounted) return; // Si el componente se desmontó, no actualizamos el estado
          console.error("❌ Token inválido o expirado", error);
          navigate("/");
        }
      } else {
        setLoadingToken(false);
        fetchProducts(); // Llama a fetchProducts si no hay token o ya hay mesaId
      }
    };

    loadInitialDataAndProducts();

    return () => {
      isMounted = false; // Función de limpieza: establece la bandera en falso cuando el componente se desmonta
    };
  }, [default_url, navigate, search, fetchProducts]); // Corrección: 'search' en lugar de 'query'

  const handleCategoryClick = (categoria) => {
    setSelectedCategory(categoria);
    if (categoria === '') {
      setFilteredProducts(productsList);
    } else {
      const filtrados = productsList.filter(p => p.categoria === categoria);
      setFilteredProducts(filtrados);
    }
  };

  const openAddProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowAddModal(true);
  };

  const handleConfirmAddProduct = async () => {
    const mesaId = localStorage.getItem("mesaId");
    const pedidoId = localStorage.getItem("pedidoId");

    if (!mesaId || !selectedProduct) {
      console.error("Faltan datos para agregar producto.");
      return;
    }

    try {
      const dto = {
        mesaId: parseInt(mesaId, 10),
        productoId: selectedProduct.productoId,
        cantidad: quantity,
        pedidoId: pedidoId ? parseInt(pedidoId, 10) : null,
      };

      console.log("🚀 DTO que enviamos al backend:", dto);

      const response = await axios.post(`${default_url}/api/Pedidos/agregar-producto`, dto);
      const nuevoPedidoId = response.data.pedidoId;
      localStorage.setItem("pedidoId", nuevoPedidoId);

      console.log("✅ Producto agregado correctamente:", response.data);

      setShowAddModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error("❌ Error al agregar producto al pedido:", error);
      // Considera mostrar una notificación al usuario aquí
    }
  };

  if (loadingToken) return <p style={{ textAlign: 'center' }}>Cargando mesa...</p>;
  if (showWelcome) return <p style={{ textAlign: 'center' }}>¡Bienvenido! Cargando menú...</p>;

  return (
    <div className="menu">
      <h2 style={{ textAlign: 'center' }}>Menú de Productos</h2>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => handleCategoryClick('')} className="inventory-button">Todos</button>
        <button onClick={() => handleCategoryClick('ENTRANCE')} className="inventory-button">Entradas</button>
        <button onClick={() => handleCategoryClick('MAIN_COURSE')} className="inventory-button">Platos Fuertes</button>
        <button onClick={() => handleCategoryClick('DRINK')} className="inventory-button">Bebidas</button>
        <button onClick={() => handleCategoryClick('DESSERT')} className="inventory-button">Postres</button>
      </div>

      {loadingProducts ? (
        <p style={{ textAlign: 'center' }}>Cargando productos...</p>
      ) : errorProducts ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{errorProducts}</p>
      ) : (
        <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((product) => (
            <div
              key={product.productoId}
              onClick={() => openAddProductModal(product)}
              style={{
                border: '1px solid #eee',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Aquí es donde se renderiza la imagen */}
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nombre}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    marginBottom: '10px',
                    borderRadius: '4px',
                  }}
                  onError={(e) => {
                    e.target.onerror = null; // Evita bucles infinitos de error
                    e.target.src = 'https://placehold.co/150x150/cccccc/000000?text=Sin+Imagen'; // Imagen de fallback
                    console.error("Error al cargar imagen para:", product.nombre, "URL:", product.imageUrl);
                  }}
                />
              ) : (
                <img
                  src="https://placehold.co/150x150/cccccc/000000?text=Sin+Imagen"
                  alt="Sin imagen disponible"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    marginBottom: '10px',
                    borderRadius: '4px',
                  }}
                />
              )}
              <h3>{product.nombre}</h3>
              <p style={{ color: 'green', fontWeight: 'bold' }}>${product.precio != null ? product.precio.toLocaleString() : '0'}</p>
              <button className="inventory-button" style={{ marginTop: '10px', padding: '8px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && selectedProduct && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <h3>Agregar al Pedido</h3>
          <p><strong>{selectedProduct.nombre}</strong></p>
          {selectedProduct.imageUrl && (
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.nombre}
              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginBottom: '10px', borderRadius: '4px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Error';
              }}
            />
          )}
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            style={{ marginBottom: '10px', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px' }}>
            <button onClick={handleConfirmAddProduct} className="save-button" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#2196F3', color: 'white', cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => setShowAddModal(false)} className="cancel-button" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#f44336', color: 'white', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Menu;
