import React, { useState, useEffect } from 'react';
//import LoadingSpinner from '../components/LoadingSpinner';
// import { fetchInventory, addInventoryItem } from '../api/inventory';

// Mock Data & API
const mockInventory = [
  { id: 'I001', name: 'Hamburguesa Clásica', category: 'Comida', stock: 50, price: 15000 },
  { id: 'I002', name: 'Gaseosa 350ml', category: 'Bebida', stock: 100, price: 3000 },
  { id: 'I003', name: 'Papas Fritas (Porción)', category: 'Acompañamiento', stock: 80, price: 5000 },
];

const fetchInventory = async () => {
  console.log("Fetching inventory...");
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log("Inventory fetched.");
  return mockInventory;
};

const addInventoryItem = async (itemData) => {
  console.log("Adding inventory item:", itemData);
  await new Promise(resolve => setTimeout(resolve, 600));
  const newItem = { ...itemData, id: `I${Math.random().toString(16).slice(2, 6)}`, stock: parseInt(itemData.stock, 10) || 0, price: parseFloat(itemData.price) || 0 }; // Genera ID simple y parsea números
  mockInventory.push(newItem); // Añade al mock data
  console.log("Item added to mock data.");
  return newItem;
};

function InventoryManagementPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // Estado para el formulario
  const [newItem, setNewItem] = useState({ name: '', category: '', stock: '', price: '' });

  useEffect(() => {
    setLoading(true);
    fetchInventory()
      .then(data => setInventory(data))
      .catch(err => setError("Error al cargar el inventario."))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category || !newItem.stock || !newItem.price) {
      alert("Por favor completa todos los campos.");
      return;
    }
    setIsAdding(true); // Muestra feedback de carga
    setError(null);

    try {
      const addedItem = await addInventoryItem(newItem);
      setInventory(prevInventory => [...prevInventory, addedItem]); // Añade el nuevo ítem a la lista
      setNewItem({ name: '', category: '', stock: '', price: '' }); // Limpia el formulario
      alert("Ítem añadido correctamente!");
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Error al añadir el ítem. Intente de nuevo.");
    } finally {
      setIsAdding(false); // Oculta feedback de carga
    }
  };

  //if (loading) return <LoadingSpinner />;
  if (error && !isAdding) return <div className="error-message">{error}</div>; // No mostrar error de carga si estamos añadiendo

  return (
    <div>
      <h2>Gestión de Inventario</h2>

      {/* Formulario para añadir ítem */}
      <h3>Añadir Nuevo Ítem</h3>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          name="name"
          placeholder="Nombre del Ítem"
          value={newItem.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Categoría"
          value={newItem.category}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock Inicial"
          value={newItem.stock}
          onChange={handleInputChange}
          required
          min="0"
        />
        <input
          type="number"
          name="price"
          placeholder="Precio (COP)"
          value={newItem.price}
          onChange={handleInputChange}
          required
          min="0"
          step="50" // O el paso que prefieras
        />
        <button type="submit" disabled={isAdding}>
          {isAdding ? 'Añadiendo...' : 'Añadir Ítem'}
        </button>
        {error && isAdding && <p className="error-message" style={{ color: 'red', marginLeft: '10px' }}>{error}</p>}
      </form>

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
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio Unitario</th>
              {/* Podrías añadir acciones (Editar, Eliminar) */}
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>${item.price.toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryManagementPage;