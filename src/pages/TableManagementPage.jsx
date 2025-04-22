import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
function TableManagementPage() {
  // Estados para la gestión de la lista de mesas
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para la actualización del estado de una mesa
  const [updatingTableId, setUpdatingTableId] = useState(null);

  // Estado y funciones para la creación de una nueva mesa
  const [newItemNumber, setNewItemNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // ID de la organización (TODO: Obtener esto dinámicamente)
  const organizationId = 1;

  // Posibles estados para una mesa
  const possibleStatus = ['Libre', 'Ocupada', 'Reservada', 'Necesita Limpieza', 'Inactiva'];

  // Efecto para cargar las mesas al montar el componente y cuando cambia organizationId
  useEffect(() => {
    fetchTables(organizationId);
  }, [organizationId]);

  // Función para obtener la lista de mesas desde la API
  const fetchTables = async (orgId) => {
    setLoading(true);
    setError(null);
    console.log(`Fetching tables for organization ${orgId} from API...`);
    try {
      const response = await axios.get(`https://localhost:8080/api/Mesas/${orgId}`);
      console.log("Tables fetched from API:", response.data);
      setTables(response.data);
    } catch (err) {
      console.error("Error fetching tables from API:", err);
      setError("Error al cargar las mesas.");
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el estado de una mesa
  const handleStatusUpdate = async (tableId, newStatus) => {
    if (updatingTableId) return;

    const originalTables = [...tables];
    setUpdatingTableId(tableId);
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, estado: newStatus } : table
      )
    );

    try {
      await updateTableStatus(organizationId, tableId, newStatus);
      setError(null);
    } catch (err) {
      console.error("Error updating table status:", err);
      setError(`Error al actualizar la mesa ${tableId}.`);
      setTables(originalTables);
    } finally {
      setUpdatingTableId(null);
    }
  };

  // Función para enviar la petición PUT para actualizar el estado de la mesa
  const updateTableStatus = async (orgId, tableId, newStatus) => {
    console.log(`Updating table ${tableId} in organization ${orgId} to status ${newStatus} via API`);
    try {
      const response = await axios.put(
        `https://localhost:8080/api/Mesas/${orgId}/${tableId}`,
        {
          id: tableId,
          organizationId: orgId,
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

  // Función para crear una nueva mesa
  const handleCreateMesa = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const newMesa = {
        organizationId: organizationId,
        numero: parseInt(newItemNumber),
        estado: 'Libre',
      };

      const response = await axios.post('https://localhost:8080/api/Mesas', newMesa);
      console.log("Mesa creada:", response.data);
      fetchTables(organizationId);
      setNewItemNumber('');
    } catch (error) {
      console.error("Error al crear la mesa:", error);
      setError("Error al crear la mesa.");
    } finally {
      setIsCreating(false);
    }
  };

  // Renderizado condicional para el estado de carga y error
  if (loading) return <p>Cargando mesas...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Mesas</h2>

      {/* Formulario para crear una nueva mesa */}
      <div className="new-item-container"> {/* CONTENEDOR DEL CONTORNO */}
        <h3>Crear Nueva Mesa</h3>
        <div className="new-item-form"> {/* CONTENEDOR DE LOS ELEMENTOS DEL FORMULARIO */}
          <input
            type="number"
            value={newItemNumber}
            onChange={(e) => setNewItemNumber(e.target.value)}
            placeholder="Número de Mesa"
            // PLACEHOLDER
          />
          <button onClick={handleCreateMesa} disabled={isCreating || !newItemNumber} className="add-button">
            {isCreating ? 'Creando...' : 'Crear Mesa'}
          </button>
        </div> {/* CIERRE DEL CONTENEDOR DE LOS ELEMENTOS DEL FORMULARIO */}
        {error && <div className="error-message">{error}</div>}
      </div> {/* CIERRE DEL CONTENEDOR DEL CONTORNO */}

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