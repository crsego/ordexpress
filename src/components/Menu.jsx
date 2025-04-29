import React, { useState, useEffect } from "react";
import ProductList from "./ProductList";
import Modal from './Modal'; // Ajusta la ruta si tu Modal.jsx está en otro directorio
import axios from "axios";


const Menu = () => {
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(''); // 🔥 Nuevo
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts(null);

    try {
      const organizationId = localStorage.getItem('organizationId');

      if (!organizationId) {
        throw new Error("No se encontró organizationId en el localStorage.");
      }

      const url = `https://localhost:8080/api/Productos/${parseInt(organizationId)}/list`;
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
  };

  const handleCategoryClick = (categoria) => {
    setSelectedCategory(categoria);

    if (categoria === '') {
      setFilteredProducts(productsList); // Mostrar todos
    } else {
      const filtrados = productsList.filter(p => p.categoria === categoria);
      setFilteredProducts(filtrados);
    }
  };

  const handleAddToOrder = async (producto) => {
    const mesaId = localStorage.getItem("mesaId"); // debe estar almacenado en localStorage
    const pedidoId = localStorage.getItem("pedidoId"); // opcional
  
    if (!mesaId) {
      console.error("Mesa no encontrada en localStorage");
      return;
    }
  
    try {
      const dto = {
        mesaId: parseInt(mesaId),
        productoId: producto.productoId,
        cantidad: 1, // puedes cambiarlo luego
        pedidoId: pedidoId ? parseInt(pedidoId) : null,
      };
  
      const response = await axios.post("https://localhost:8080/api/Pedidos/agregar-producto", dto);
  
      const nuevoPedidoId = response.data.pedidoId;
      localStorage.setItem("pedidoId", nuevoPedidoId); // guardar para futuras llamadas
  
      console.log("Producto agregado correctamente al pedido:", response.data);
  
    } catch (error) {
      console.error("❌ Error al agregar producto al pedido:", error);
    }
  };

  const openAddProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1); // inicializamos en 1
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
        mesaId: parseInt(mesaId),
        productoId: selectedProduct.productoId,
        cantidad: quantity,
        pedidoId: pedidoId ? parseInt(pedidoId) : null,
      };
  
      console.log("🚀 DTO que enviamos al backend:", dto);
  
      const response = await axios.post("https://localhost:8080/api/Pedidos/agregar-producto", dto);
  
      const nuevoPedidoId = response.data.pedidoId;
      localStorage.setItem("pedidoId", nuevoPedidoId);
  
      console.log("✅ Producto agregado correctamente:", response.data);
  
      // Limpiar modal
      setShowAddModal(false);
      setSelectedProduct(null);
      setQuantity(1);
  
      // Podríamos mostrar notificación de éxito aquí
    } catch (error) {
      console.error("❌ Error al agregar producto al pedido:", error);
    }
  };

  return (
    <div className="menu">
      <h2 style={{ textAlign: 'center' }}>Menú de Productos</h2>

      {/* Botones de categorías */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => handleCategoryClick('')} className="inventory-button">
          Todos
        </button>
        <button onClick={() => handleCategoryClick('ENTRANCE')} className="inventory-button">
          Entradas
        </button>
        <button onClick={() => handleCategoryClick('MAIN_COURSE')} className="inventory-button">
          Platos Fuertes
        </button>
        <button onClick={() => handleCategoryClick('DRINK')} className="inventory-button">
          Bebidas
        </button>
        <button onClick={() => handleCategoryClick('DESSERT')} className="inventory-button">
          Postres
        </button>
      </div>

      {/* Lista de productos */}
      <ProductList
        loadingProducts={loadingProducts}
        errorProducts={errorProducts}
        filteredProducts={filteredProducts}
        openAddProductModal={openAddProductModal} // 🔥 aquí lo pasamos
      />


      {showAddModal && selectedProduct && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <h3>Agregar al Pedido</h3>
          <p><strong>{selectedProduct.nombre}</strong></p>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            style={{ marginBottom: '10px', width: '100%' }}
          />

          <button onClick={handleConfirmAddProduct} className="save-button">
            Confirmar
          </button>

          <button onClick={() => setShowAddModal(false)} className="cancel-button">
            Cancelar
          </button>
        </Modal>
      )}

    </div>
  );
};

export default Menu;
