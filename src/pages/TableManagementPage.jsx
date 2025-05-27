import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';

function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTableId, setUpdatingTableId] = useState(null);
  const [newItemNumber, setNewItemNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [qrTokens, setQrTokens] = useState({});
  const [qrCodes, setQrCodes] = useState({});
  const default_url = "https://ordexpress-api.onrender.com";
  const navigate = useNavigate();

  const possibleStatus = [
    { label: 'Libre', value: 'FREE' },
    { label: 'Ocupada', value: 'OCCUPIED' },
    { label: 'Reservada', value: 'RESERVED' },
    { label: 'Necesita Limpieza', value: 'NEEDS_CLEANING' },
    { label: 'Inactiva', value: 'INACTIVE' }
  ];

  useEffect(() => {
    const orgId = localStorage.getItem('organizationId');
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
      const response = await axios.get(`${default_url}/api/Mesas/${orgId}/list`);
      console.log("Tables fetched from API:", response.data);
      setTables(response.data);
      const initialTokens = {};
      response.data.forEach(table => {
        if (table.qrCode) {
          initialTokens[table.id] = table.qrCode;
        }
      });
      setQrTokens(initialTokens);
    } catch (err) {
      console.error("Error fetching tables from API:", err);
      setError("Error al cargar las mesas.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tableId, newStatusValue) => {
    if (updatingTableId) return;

    const orgId = localStorage.getItem('organizationId');

    const originalTables = [...tables];
    setUpdatingTableId(tableId);
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId ? { ...table, estado: newStatusValue } : table
      )
    );

    try {
      await updateTableStatus(orgId, tableId, newStatusValue);
      setError(null);
    } catch (err) {
      console.error("Error updating table status:", err);
      setError(`Error al actualizar la mesa ${tableId}.`);
      setTables(originalTables);
    } finally {
      setUpdatingTableId(null);
    }
  };

  const updateTableStatus = async (orgId, tableId, newStatusValue) => {
    console.log(`Updating table ${tableId} in organization ${orgId} to status ${newStatusValue} via API`);
    try {
      const response = await axios.put(
        `${default_url}/api/Mesas/${orgId}/${tableId}`,
        {
          id: tableId,
          organizationId: parseInt(orgId, 10),
          estado: newStatusValue,
        }
      );
      console.log(`Table ${tableId} updated successfully in API:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating table ${tableId} status via API:`, error.response || error.message || error);
      throw error;
    }
  };

  const handleCreateMesa = async () => {
    const orgId = localStorage.getItem('organizationId');
    setIsCreating(true);
    setError(null);
    try {
      const newMesa = {
        organizationId: parseInt(orgId, 10),
        numero: parseInt(newItemNumber, 10),
        estado: 'FREE',
      };

      const response = await axios.post(`${default_url}/api/Mesas`, newMesa);
      console.log("Mesa creada:", response.data);
      fetchTables(orgId);
      setNewItemNumber('');
    } catch (error) {
      console.error("Error al crear la mesa:", error.response || error.message || error);
      setError(`Error al crear la mesa: ${error.response?.data?.message || error.message || 'Error desconocido'}.`);
    } finally {
      setIsCreating(false);
    }
  };

  const generateQrCode = async (mesaId) => {
    setError(null);
    try {
      const response = await axios.post(`${default_url}/api/Mesas/mesas/${mesaId}/generar-qr`);
      console.log(`QR code generated for mesa ${mesaId}:`, response.data);
      setQrCodes(prevQrCodes => ({
        ...prevQrCodes,
        [mesaId]: response.data.qrImage,
      }));
      setQrTokens(prevTokens => ({
        ...prevTokens,
        [mesaId]: response.data.qrToken,
      }));
    } catch (error) {
      console.error(`Error generating QR code for mesa ${mesaId}:`, error.response || error.message || error);
      setError(`Error al generar el código QR para la mesa ${mesaId}.`);
    }
  };

  const simulateQrScan = (tokenId) => {
    if (tokenId) {
      const menuUrl = `/menu?token=${tokenId}`;
      console.log(`Simulating QR scan, navigating to: ${menuUrl}`);
      navigate(menuUrl);
    } else {
      setError("No se encontró token QR para esta mesa.");
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
              <th>Código QR</th> {/* Esta columna ahora contendrá el QR y sus botones */}
            </tr>
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table.id} className={updatingTableId === table.id ? 'updating' : ''}>
                <td>Mesa {table.numero}</td>
                <td>
                  {possibleStatus.find(s => s.value === table.estado)?.label || table.estado}
                </td>
                <td>
                  <select
                    value={table.estado}
                    onChange={(e) => handleStatusUpdate(table.id, e.target.value)}
                    disabled={updatingTableId === table.id}
                  >
                    {possibleStatus.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  {updatingTableId === table.id && <span style={{ marginLeft: '8px' }}>🔄</span>}
                </td>
                {/* Columna de Código QR y Acciones consolidada */}
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    {qrCodes[table.id] ? (
                      <>
                        <div
                          dangerouslySetInnerHTML={{ __html: qrCodes[table.id] }}
                          style={{ maxWidth: '80px', height: 'auto', alignSelf: 'flex-start', marginBottom: '10px' }} // Cambiado 'margin: 0 auto' a 'alignSelf: flex-start'
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
                          <button
                            onClick={() => simulateQrScan(qrTokens[table.id])}
                            className="add-button"
                            style={{ padding: '8px 12px', fontSize: '0.8em' }}
                          >
                            Simular Escaneo
                          </button>
                          <button
                            onClick={() => generateQrCode(table.id)}
                            className="add-button"
                            style={{ padding: '8px 12px', fontSize: '0.8em' }}
                          >
                            Regenerar QR
                          </button>
                        </div>
                        <span style={{ fontSize: '0.8em', color: 'green', marginTop: '5px' }}>QR Generado</span>
                      </>
                    ) : (
                      <button
                        onClick={() => generateQrCode(table.id)}
                        className="add-button"
                        style={{ padding: '8px 12px', fontSize: '0.8em' }}
                      >
                        Generar QR
                      </button>
                    )}
                  </div>
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
