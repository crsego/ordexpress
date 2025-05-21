import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Asegúrate que tienes tus estilos

function OrderManagementPage() {
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);
  const default_url ="https://ordexpress-api.onrender.com"

  // ✅ Cargar todos los productos al iniciar
  useEffect(() => {
    const orgId = localStorage.getItem('organizationId');
    console.log("🔥 organizationId desde localStorage:", orgId);
  
    if (orgId && orgId !== "null" && orgId !== "0") {
      fetchProducts();
    } else {
      console.warn("⚠️ No hay organización activa todavía, no se consulta productos.");
    }
  }, []);
  

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
  
    try {
      const organizationId = localStorage.getItem('organizationId');
      console.log("🌎 Buscando productos para organizationId:", organizationId);
  
      if (!organizationId || organizationId === "null" || organizationId === "0") {
        console.error("❌ organizationId no válido. No se cargan productos.");
        setErrorProducts("No se encontró organización activa.");
        setLoadingProducts(false);
        return;
      }
  
      const url = `${default_url}/api/Productos/${parseInt(organizationId)}/list`;
      const response = await axios.get(url);
  
      console.log("✅ Productos recibidos:", response.data);
  
      setProductsList(response.data);
      setFilteredProducts(response.data);
  
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      setErrorProducts("Error al cargar productos.");
      setProductsList([]);
      setFilteredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };  
  

  // ✅ Manejar cambio de categoría
  const handleCategoryChange = (categoria) => {
    setSelectedCategory(categoria);

    if (!categoria) {
      setFilteredProducts(productsList);
    } else {
      const filtrados = productsList.filter(p => p.categoria === categoria);
      setFilteredProducts(filtrados);
    }
  };

  return (
    <div>
      <h2>Menú de Productos</h2>

      {/* Botones de Categorías */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => handleCategoryChange('')} className="inventory-button">Todas</button>
        <button onClick={() => handleCategoryChange('ENTRADA')} className="inventory-button">Entradas</button>
        <button onClick={() => handleCategoryChange('PLATO_FUERTE')} className="inventory-button">Platos Fuertes</button>
        <button onClick={() => handleCategoryChange('BEBIDA')} className="inventory-button">Bebidas</button>
        <button onClick={() => handleCategoryChange('POSTRE')} className="inventory-button">Postres</button>
      </div>

      {/* Grid de Productos */}
      <div className="products-grid">
        {loadingProducts ? (
          <p>Cargando productos...</p>
        ) : errorProducts ? (
          <div className="error-message">{errorProducts}</div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.productoId} className="product-item">
              <h3>{product.nombre}</h3>
              <p>Precio: ${product.precio.toLocaleString('es-CO')}</p>
              <p>Categoría: {product.categoria}</p>
            </div>
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default OrderManagementPage;
