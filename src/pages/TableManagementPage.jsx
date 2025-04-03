import React, { useState, useEffect } from 'react';
//import LoadingSpinner from '../components/LoadingSpinner';
// import { fetchTables, updateTableStatus } from '../api/tables';

// Mock Data & API
const mockTables = [
  { id: 'M01', number: 1, status: 'Libre', capacity: 4 },
  { id: 'M02', number: 2, status: 'Ocupada', capacity: 2 },
  { id: 'M03', number: 3, status: 'Reservada', capacity: 6 },
  { id: 'M04', number: 4, status: 'Libre', capacity: 4 },
  { id: 'M05', number: 5, status: 'Necesita Limpieza', capacity: 2 },
];

const fetchTables = async () => {
  console.log("Fetching tables...");
  await new Promise(resolve => setTimeout(resolve, 350));
  console.log("Tables fetched.");
  return mockTables;
};

const updateTableStatus = async (tableId, newStatus) => {
  console.log(`Updating table ${tableId} to status ${newStatus}`);
  await new Promise(resolve => setTimeout(resolve, 250));
  const tableIndex = mockTables.findIndex(t => t.id === tableId);
  if (tableIndex !== -1) {
    mockTables[tableIndex].status = newStatus;
    console.log(`Table ${tableId} updated in mock data.`);
    return { ...mockTables[tableIndex] };
  }
  throw new Error("Table not found");
};


function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTableId, setUpdatingTableId] = useState(null);

  const possibleStatus = ['Libre', 'Ocupada', 'Reservada', 'Necesita Limpieza', 'Inactiva'];

  useEffect(() => {
    setLoading(true);
    fetchTables()
      .then(data => setTables(data))
      .catch(err => setError("Error al cargar las mesas."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (tableId, newStatus) => {
    if (updatingTableId) return;

    const originalTables = [...tables];
    setUpdatingTableId(tableId);

    // Optimistic UI
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );

    try {
      await updateTableStatus(tableId, newStatus);
      setError(null);
    } catch (err) {
      console.error("Error updating table status:", err);
      setError(`Error al actualizar la mesa ${tableId}.`);
      setTables(originalTables); // Rollback
    } finally {
      setUpdatingTableId(null);
    }
  };

  //if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Mesas</h2>
      {tables.length === 0 ? (
        <p>No hay mesas configuradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Número Mesa</th>
              <th>Capacidad</th>
              <th>Estado Actual</th>
              <th>Actualizar Estado</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table.id} className={updatingTableId === table.id ? 'updating' : ''}>
                <td>Mesa {table.number}</td>
                <td>{table.capacity} personas</td>
                <td>{table.status}</td>
                <td>
                  <select
                    value={table.status}
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
      {/* Podrías añadir un formulario para añadir/editar mesas */}
    </div>
  );
}

export default TableManagementPage;