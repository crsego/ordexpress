import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Asegúrate de que este import esté presente

function InventoryManagementPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', price: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const organizationId = 1; // Reemplaza con la forma correcta de obtener el ID de la organización

  useEffect(() => {
    setLoading(true);
    axios.get('https://localhost:8080/api/Productos') // Reemplaza con la URL de tu API
      .then(response => {
        setInventory(response.data);
      })
      .catch(err => {
        setError("Error al cargar el inventario.");
        console.error("Error fetching inventory:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
    if (isEditing && editingItem) {
      setEditingItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.stock || !newItem.price) {
      alert("Por favor completa el nombre, stock y precio.");
      return;
    }
    setIsAdding(true);
    setError(null);

    try {
      const response = await axios.post('https://localhost:8080/api/Productos', {
        nombre: newItem.name,
        stock: parseInt(newItem.stock, 10) || 0,
        precio: parseFloat(newItem.price) || 0,
        organizationId: organizationId
      });
      setInventory(prevInventory => [...prevInventory, response.data]);
      setNewItem({ name: '', stock: '', price: '' });
      alert("Ítem añadido correctamente!");
    } catch (err) {
      setError("Error al añadir el ítem. Intente de nuevo.");
      console.error("Error adding item:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditItem = (item) => {
    setIsEditing(true);
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem.nombre || editingItem.stock === null || editingItem.precio === null) {
      alert("Por favor completa el nombre, stock y precio.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await axios.put(`https://localhost:8080/api/Productos/${editingItem.id}`, {
        id: editingItem.id,
        nombre: editingItem.nombre,
        stock: parseInt(editingItem.stock, 10) || 0,
        precio: parseFloat(editingItem.precio) || 0,
        organizationId: organizationId
      });
      const updatedInventory = inventory.map(item =>
        item.id === editingItem.id ? { ...editingItem } : item
      );
      setInventory(updatedInventory);
      setIsEditing(false);
      setEditingItem(null);
      alert("Ítem actualizado correctamente!");
    } catch (err) {
      setError("Error al actualizar el ítem. Intente de nuevo.");
      console.error("Error updating item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este ítem?")) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`https://localhost:8080/api/Productos/${itemId}`);
        setInventory(prevInventory => prevInventory.filter(item => item.id !== itemId));
        alert("Ítem eliminado correctamente!");
      } catch (err) {
        setError("Error al eliminar el ítem. Intente de nuevo.");
        console.error("Error deleting item:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p>Cargando inventario...</p>;
  if (error && !isAdding && !isEditing) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Inventario</h2>

      {/* Formulario para añadir ítem */}
      <div className="add-item-container">
        <h3>Añadir Nuevo Ítem</h3>
        {!isEditing && (
          <form onSubmit={handleAddItem} className="add-item-form">
            <input
              type="text"
              name="name"
              placeholder="Nombre del Ítem"
              value={newItem.name}
              onChange={handleInputChange}
              required
              className="inventory-input"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock Inicial"
              value={newItem.stock}
              onChange={handleInputChange}
              required
              min="0"
              className="inventory-input"
            />
            <input
              type="number"
              name="price"
              placeholder="Precio (COP)"
              value={newItem.price}
              onChange={handleInputChange}
              required
              min="0"
              step="50"
              className="inventory-input"
            />
            <button type="submit" disabled={isAdding} className="inventory-button save-button">
              {isAdding ? 'Añadiendo...' : 'Añadir Ítem'}
            </button>
            {error && isAdding && <p className="error-message" style={{ color: 'red', marginLeft: '10px' }}>{error}</p>}
          </form>
        )}
      </div>

      {/* Formulario para editar ítem */}
      {isEditing && editingItem && (
        <div className="edit-item-container">
          <h3>Editar Ítem</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del Ítem"
            value={editingItem.nombre}
            onChange={handleInputChange}
            required
            className="inventory-input"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={editingItem.stock}
            onChange={handleInputChange}
            required
            min="0"
            className="inventory-input"
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio (COP)"
            value={editingItem.precio}
            onChange={handleInputChange}
            required
            min="0"
            step="50"
            className="inventory-input"
          />
          <div className="edit-actions-container">
            <button onClick={handleSaveEdit} disabled={loading} className="inventory-button save-button">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button onClick={handleCancelEdit} className="inventory-button cancel-button">Cancelar</button>
            {error && loading && <p className="error-message" style={{ color: 'red', marginLeft: '10px' }}>{error}</p>}
          </div>
        </div>
      )}

      {/* Tabla de Inventario Actual */}
      <h3>Inventario Actual</h3>
      {inventory.length === 0 ? (
        <p>El inventario está vacío.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Precio Unitario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>{item.stock}</td>
                <td>${item.precio?.toLocaleString('es-CO')}</td>
                <td className="actions-column">
                  <button onClick={() => handleEditItem(item)} disabled={isEditing} className="inventory-button edit-table-button">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} disabled={isEditing} className="inventory-button delete-table-button">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryManagementPage;