import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/url';
import Modal from 'react-modal';

function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTableId, setUpdatingTableId] = useState(null);
  const [newItemNumber, setNewItemNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [qrTokens, setQrTokens] = useState({});
  const [qrCodes, setQrCodes] = useState({});
  const base_url = API_BASE_URL;
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const possibleStatus = [
    { label: 'Libre', value: 'FREE' },
    { label: 'Ocupada', value: 'OCCUPIED' },
    { label: 'Reservada', value: 'RESERVED' },
    { label: 'Necesita Limpieza', value: 'NEEDS_CLEANING' },
    { label: 'Inactiva', value: 'INACTIVE' }
  ];

  // useEffect(() => {
  //   const orgId = localStorage.getItem('organizationId');
  //   if (orgId) {
  //     fetchTables(orgId);
  //   } else {
  //     setError("No se encontró organización activa.");
  //     setLoading(false);
  //   }
  // }, []);

  useEffect(() => {
    const orgId = localStorage.getItem('organizationId');
    if (orgId) {
      fetchTables(orgId);
    } else {
      setError("No se encontró organización activa.");
      setLoading(false);
    }
    if (selectedTable?.qrImage) {
      setQrCodes(prev => ({
        ...prev,
        [selectedTable.id]: selectedTable.qrImage
      }));
    }
  }, [selectedTable]);

  const fetchTables = async (orgId) => {
    setLoading(true);
    setError(null);
    console.log(`Fetching tables for organization ${orgId} from API...`);
    try {
      const response = await axios.get(`${base_url}/api/Mesas/${orgId}/list`);
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
        `${base_url}/api/Mesas/${orgId}/${tableId}`,
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

      const response = await axios.post(`${base_url}/api/Mesas`, newMesa);
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
      const response = await axios.post(`${base_url}/api/Mesas/mesas/${mesaId}/generar-qr`);
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

  const openModal = (table) => {
    setSelectedTable(table);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedTable(null);
    setModalIsOpen(false);
  };

  const downloadQr = (mesaId) => {
    const svg = document.querySelector(`#qr-img-${mesaId} svg`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `qr_mesa_${mesaId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  if (loading) return <p>Cargando mesas...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Mesas</h2>
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
              <tr key={table.id} onClick={() => openModal(table)}>
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
              </tr>
            ))}
          </tbody>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Detalle de Mesa" style={{ content: { width: '400px', margin: 'auto' } }}>
              {selectedTable && (
                <div>
                  <h2>Mesa {selectedTable.numero}</h2>
                  <p><strong>Estado:</strong> {selectedTable.estado}</p>
                  <div style={{ marginBottom: '10px', height: '120px' }}>
                    {qrCodes[selectedTable.id] ? (
                      <div id={`qr-img-${selectedTable.id}`} dangerouslySetInnerHTML={{ __html: qrCodes[selectedTable.id] }} />
                    ) : (
                      <p>No hay código QR generado aún.</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button className="edit-button" onClick={() => generateQrCode(selectedTable.id)}>
                      {qrCodes[selectedTable.id] ? 'Renovar QR' : 'Generar QR'}
                    </button>
                    {qrCodes[selectedTable.id] && (
                      <button className="add-button" onClick={() => downloadQr(selectedTable.id)}>Descargar QR</button>
                    )}
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <button className="cancel-button" onClick={closeModal}>Cerrar</button>
                  </div>
                </div>
              )}
            </Modal>
        </table>
        
      )}
    </div>
  );
}

export default TableManagementPage;


