import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal'; // 👈 Importamos el Modal
import '../App.css';
import Notification from '../components/Notification';


function InventoryManagementPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [showModal, setShowModal] = useState(false); // Controlar el modal
  const [newItem, setNewItem] = useState({ name: '', stock: '', price: '' });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const default_url ="https://ordexpress-api.onrender.com"


  useEffect(() => {
    const organizationId = localStorage.getItem('organizationId');

    if (!organizationId) {
      setError("No se encontró organización asociada.");
      setLoading(false);
      return;
    }

    fetchInventory();
    fetchMetadata();

    setLoading(true);
    axios.get(`${default_url}/api/Productos/${organizationId}/list`)
      .then(response => {
        setInventory(response.data);
      })
      .catch(err => {
        setError("Error al cargar el inventario.");
        console.error("Error fetching inventory:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = async () => {
    const organizationId = localStorage.getItem('organizationId');

    try {
      if (!newItem.name || !newItem.stock || !newItem.price || !newItem.category) {
        alert("Todos los campos son obligatorios."); // O mejor: notificación amigable
        return;
      }
  
      const newProduct = {
        nombre: newItem.name,
        stock: parseInt(newItem.stock),
        precio: parseFloat(newItem.price),
        categoria: newItem.category, // 🔥 Aquí mandamos la categoría
        organizationId: parseInt(organizationId)
      };
  
      await axios.post(`${default_url}/api/Productos`, newProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
  
      setShowModal(false);
      setNewItem({ name: '', stock: '', price: '', category: '' });
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };
  

  const thStyle = {
    borderBottom: '1px solid #ccc',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
  };
  
  const tdStyle = {
    borderBottom: '1px solid #eee',
    padding: '8px',
  };

  const handleRowClick = (producto) => {
    setEditingProduct({
      productoId: producto.productoId,
      nombre: producto.nombre,
      stock: producto.stock,
      precio: producto.precio,
      categoria: producto.categoria || "",
      estado: producto.estado || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
  
    try {
      await axios.delete(`${default_url}/api/Productos/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
  
      await fetchInventory(); // Recargar la lista
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      setError("Error al eliminar el producto.");
    }
  };
  
  const handleUpdateProduct = async () => {
    try {
      const updatedProduct = {
        ...editingProduct,
      };
  
      await axios.put(`${default_url}/api/Productos/${editingProduct.productoId}`, updatedProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
  
      setShowEditModal(false);
      await fetchInventory();
    } catch (error) {
      showNotification("Producto añadido exitosamente", "success");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000); // Ocultar automáticamente en 3 segundos
  };
  

  const deleteButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  };
  const fetchInventory = async () => {
    const organizationId = localStorage.getItem('organizationId');
  
    if (!organizationId) {
      setError("No se encontró organización asociada.");
      setLoading(false);
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.get(`${default_url}/api/Productos/${organizationId}/list`);
      setInventory(response.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      showNotification("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };
    
  const fetchMetadata = async () => {
    try {
      const [statesResponse, categoriesResponse] = await Promise.all([
        axios.get(`${default_url}/api/Metadata/productStatus`),
        axios.get(`${default_url}/api/Metadata/productCategory`)
      ]);
  
      setStatesList(statesResponse.data);
      setCategoriesList(categoriesResponse.data);
  
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  <Notification
  message={notification.message}
  type={notification.type}
  onClose={() => setNotification({ message: '', type: '' })}
/>

  return (
    <div>
      <h2>Gestión de Inventario</h2>

      <button onClick={() => setShowModal(true)} className="add-button">Añadir Ítem</button>

      {/* Modal para añadir producto */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Nuevo Producto</h3>

        <input
          type="text"
          placeholder="Nombre del Ítem"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        />

        <input
          type="number"
          placeholder="Stock Inicial"
          value={newItem.stock}
          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        />

        <input
          type="number"
          placeholder="Precio (COP)"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        />

        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          <option value="">Seleccione Categoría</option>
          {categoriesList.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <button onClick={handleAddItem} className="save-button">Guardar</button>
      </Modal>


      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        {editingProduct && (
          <div>
            <h3>Editar Producto</h3>

            <input
              type="text"
              value={editingProduct.nombre}
              onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }}
            />
            
            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
              style={{ marginBottom: '10px', width: '100%' }}
            />

            <input
              type="number"
              value={editingProduct.precio}
              onChange={(e) => setEditingProduct({ ...editingProduct, precio: parseFloat(e.target.value) })}
              style={{ marginBottom: '10px', width: '100%' }}
            />

            <select
              value={editingProduct.categoria || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, categoria: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              <option value="">Seleccione Categoría</option>
              {categoriesList.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>


            <select
              value={editingProduct.estado || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, estado: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              <option value="">Seleccione Estado</option>
              {statesList.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>


            <button onClick={handleUpdateProduct} className="save-button">Guardar Cambios</button>
          </div>
        )}
      </Modal>


      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Precio (COP)</th>
            <th style={thStyle}>Categoría</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                Cargando productos...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="5" style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                {error}
              </td>
            </tr>
          ) : inventory.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                No hay productos disponibles.
              </td>
            </tr>
          ) : (
            inventory.map((producto) => (
              <tr key={producto.productoId}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(producto)}>
                <td style={tdStyle}>{producto.nombre}</td>
                <td style={tdStyle}>{producto.stock}</td>
                <td style={tdStyle}>${producto.precio.toLocaleString()}</td>
                <td style={tdStyle}>{producto.categoria}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(producto.productoId); }}
                    style={deleteButtonStyle}>
                    ❌
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryManagementPage;
