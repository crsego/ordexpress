import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTableId, setUpdatingTableId] = useState(null);
  const [newItemNumber, setNewItemNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const default_url ="https://ordexpress-api.onrender.com"
  

  const possibleStatus = ['Libre', 'Ocupada', 'Reservada', 'Necesita Limpieza', 'Inactiva'];

  useEffect(() => {
    const orgId = localStorage.getItem('organizationId'); // 🔥 Ahora lo tomamos dinámicamente
    if (orgId) {
      fetchTables(orgId);
    } else {
      setError("No se encontró organización activa.");
      setLoading(false);
    }
  }, []);

  const fetchTables = async (orgId) => {
    setLoading(true);
    setError(null);
    console.log(`Fetching tables for organization ${orgId} from API...`);
    try {
      const response = await axios.get(`${default_url}/api/Mesas/${orgId}/list`); // 🔥 Cambiado
      console.log("Tables fetched from API:", response.data);
      setTables(response.data);
    } catch (err) {
      console.error("Error fetching tables from API:", err);
      setError("Error al cargar las mesas.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tableId, newStatus) => {
    if (updatingTableId) return;

    const orgId = localStorage.getItem('organizationId'); // 🔥 Siempre dinámico

    const originalTables = [...tables];
    setUpdatingTableId(tableId);
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, estado: newStatus } : table
      )
    );

    try {
      await updateTableStatus(orgId, tableId, newStatus);
      setError(null);
    } catch (err) {
      console.error("Error updating table status:", err);
      setError(`Error al actualizar la mesa ${tableId}.`);
      setTables(originalTables);
    } finally {
      setUpdatingTableId(null);
    }
  };

  const updateTableStatus = async (orgId, tableId, newStatus) => {
    console.log(`Updating table ${tableId} in organization ${orgId} to status ${newStatus} via API`);
    try {
      const response = await axios.put(
        `${default_url}/api/Mesas/${orgId}/${tableId}`,
        {
          id: tableId,
          organizationId: parseInt(orgId),
          estado: newStatus,
        }
      );
      console.log(`Table ${tableId} updated successfully in API:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating table ${tableId} status via API:`, error);
      throw error;
    }
  };

  const handleCreateMesa = async () => {
    const orgId = localStorage.getItem('organizationId'); // 🔥 dinámico
    setIsCreating(true);
    setError(null);
    try {
      const newMesa = {
        organizationId: parseInt(orgId),
        numero: parseInt(newItemNumber),
        estado: 'FREE', // Ajustado para ser coherente
      };

      const response = await axios.post(`${default_url}/api/Mesas`, newMesa);
      console.log("Mesa creada:", response.data);
      fetchTables(orgId);
      setNewItemNumber('');
    } catch (error) {
      console.error("Error al crear la mesa:", error);
      setError("Error al crear la mesa.");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <p>Cargando mesas...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Mesas</h2>

      {/* Formulario para crear una nueva mesa */}
      <div className="new-item-container">
        <h3>Crear Nueva Mesa</h3>
        <div className="new-item-form">
          <input
            type="number"
            value={newItemNumber}
            onChange={(e) => setNewItemNumber(e.target.value)}
            placeholder="Número de Mesa"
          />
          <button onClick={handleCreateMesa} disabled={isCreating || !newItemNumber} className="add-button">
            {isCreating ? 'Creando...' : 'Crear Mesa'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Tabla para mostrar la lista de mesas */}
      {tables.length === 0 ? (
        <p>No hay mesas configuradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Número Mesa</th>
              <th>Estado Actual</th>
              <th>Actualizar Estado</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table.id} className={updatingTableId === table.id ? 'updating' : ''}>
                <td>Mesa {table.numero}</td>
                <td>{table.estado}</td>
                <td>
                  <select
                    value={table.estado}
                    onChange={(e) => handleStatusUpdate(table.id, e.target.value)}
                    disabled={updatingTableId === table.id}
                  >
                    {possibleStatus.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {updatingTableId === table.id && <span style={{ marginLeft: '8px' }}>🔄</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TableManagementPage;
