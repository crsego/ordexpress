import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '../App.css';
import Notification from '../components/Notification';
import { API_BASE_URL } from '../api/url';

Modal.setAppElement('#root');

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Ahora filterStatus guardará el string del enum, p. ej. "PENDING" o ""
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // statusList vendrá con { value: "PENDING", label: "Pendiente" }, etc.
  const [statusList, setStatusList] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [statusesError, setStatusesError] = useState(null);

  // Nombre del usuario
  const [userName, setUserName] = useState('');

  const default_url = API_BASE_URL;

  // Obtener y setear nombre de usuario desde localStorage
  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []);

  // 1) Obtener dinámicamente la lista de estados (value: string, label: string)
  useEffect(() => {
    const fetchStatuses = async () => {
      setStatusesLoading(true);
      setStatusesError(null);
      try {
        const authToken = localStorage.getItem('authToken');
        const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
        // Ruta correcta: /api/Metadata/pedidoStatus
        const response = await axios.get(`${default_url}/api/Metadata/pedidoStatus`, config);
        console.log('📑 statusList response:', response.data);
        // response.data = [ { value: "NEW", label: "Nuevo" }, { value: "PENDING", label: "Pendiente" }, ... ]
        setStatusList(response.data);
      } catch (err) {
        console.error('❌ Error al cargar pedidoStatus:', err);
        const msg = err.response?.data?.message || `Error al cargar estados: ${err.message || 'desconocido'}`;
        setStatusesError(msg);
      } finally {
        setStatusesLoading(false);
      }
    };
    fetchStatuses();
  }, [default_url]);

  // 2) Crear un map de value (string) -> label (string) para obtener rápido la etiqueta
  const valueToLabelMap = useMemo(() => {
    const map = {};
    statusList.forEach((st) => {
      // Asumimos que st.value es string y st.label es string
      if (st && typeof st.value === 'string' && typeof st.label === 'string') {
        map[st.value] = st.label;
      }
    });
    return map;
  }, [statusList]);

  // Mostrar notificaciones temporales
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrderDetails(null);
  }, []);

  // 3) Obtener pedidos, usando el enum de estado como string
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const organizationId = localStorage.getItem('organizationId');
    if (!organizationId || organizationId === 'null' || organizationId === '0') {
      console.error('❌ organizationId no válido. No se cargan pedidos.');
      setError('No se encontró organización activa para cargar pedidos.');
      setLoading(false);
      setOrders([]);
      showNotification('No se encontró organización activa para cargar pedidos.', 'error');
      return;
    }

    try {
      // IMPORTANTE: la ruta del controlador es /api/Pedidos/organization/{organizationId}/listar
      let url = `${default_url}/organization${organizationId}/listar`;

      // Si filterStatus no está vacío, lo agregamos como ?estado=PENDING, etc.
      if (filterStatus !== '') {
        url += `?estado=${encodeURIComponent(filterStatus)}`;
      }

      console.log('🌎 Buscando pedidos para organizationId:', organizationId, 'en URL:', url);

      const authToken = localStorage.getItem('authToken');
      const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
      const response = await axios.get(url, config);
      console.log('✅ Pedidos recibidos:', response.data);

      // response.data = [ { pedidoId: 1, nombreCliente: "...", estado: "PENDING", ... }, ... ]
      const mappedOrders = response.data.map((order) => ({
        id: order.pedidoId,
        nombreCliente: order.nombreCliente,
        mesaId: order.mesaId,
        mesaNumero: order.mesaNumero,
        // Ahora 'estadoString' es el string que trae el backend: "PENDING", "DELIVERED", etc.
        estadoString: order.estado,
        // Obtenemos la etiqueta legible:
        estadoLabel: valueToLabelMap[order.estado] ?? order.estado,
        esPagado: order.esPagado,
        total: order.total,
        fecha: order.fecha,
        detalles: [],
      }));
      setOrders(mappedOrders);
      showNotification('Pedidos cargados exitosamente.', 'success');
    } catch (err) {
      console.error('❌ Error al cargar pedidos:', err);
      const errorMessage = err.response?.data?.message || `Error al cargar pedidos: ${err.message || 'desconocido'}.`;
      setError(errorMessage);
      setOrders([]);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [default_url, filterStatus, valueToLabelMap, showNotification]);

  // 4) Ejecutar fetchOrders solo después de que los estados hayan cargado
  useEffect(() => {
    if (!statusesLoading && !statusesError) {
      fetchOrders();
    }
  }, [fetchOrders, statusesLoading, statusesError]);

  // 5) Cambiar estado de un pedido (enviamos el enum como string)
  const handleStatusChange = useCallback(
    async (orderId, newStatusValue) => {
      // newStatusValue es algo como "DELIVERED" (string)
      if (typeof newStatusValue !== 'string' || newStatusValue.trim() === '') {
        console.error('Valor de estado inválido:', newStatusValue);
        showNotification(`Error: Estado no válido.`, 'error');
        return;
      }

      // Guardamos copia de seguridad por si hay que revertir
      const originalOrders = [...orders];
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId
            ? {
                ...ord,
                estadoString: newStatusValue,
                estadoLabel: valueToLabelMap[newStatusValue] ?? newStatusValue,
              }
            : ord
        )
      );

      try {
        // El endpoint para cambiar estado: /api/Pedidos/cambiar-estado
        const url = `${default_url}/api/Pedidos/cambiar-estado`;
        // Enviamos el enum como string: { pedidoId: 5, nuevoEstado: "DELIVERED" }
        const payload = { pedidoId: orderId, nuevoEstado: newStatusValue };
        const authToken = localStorage.getItem('authToken');
        const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
        await axios.post(url, payload, config);
        showNotification(
          `Estado del pedido #${orderId} actualizado a ${valueToLabelMap[newStatusValue]}.`,
          'success'
        );
      } catch (err) {
        console.error(`❌ Error al actualizar el estado del pedido ${orderId}:`, err);
        const errMsg =
          err.response?.data?.message ||
          `Error al actualizar el estado del pedido #${orderId}: ${err.message || 'desconocido'}`;
        setError(errMsg);
        showNotification(errMsg, 'error');
        // Revertimos al estado original
        setOrders(originalOrders);
      }
    },
    [default_url, orders, showNotification, valueToLabelMap]
  );

  // 6) Obtener detalles de un pedido
  const fetchOrderDetails = useCallback(
    async (orderId) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${default_url}/api/Pedidos/pedido/${orderId}`;
        const authToken = localStorage.getItem('authToken');
        const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
        const response = await axios.get(url, config);
        console.log('Detalles del pedido recibidos:', response.data);

        const orderData = response.data;
        // El backend debería traer orderData.estado como string (p. ej. "PENDING")
        const mappedOrderDetails = {
          ...orderData,
          id: orderData.pedidoId,
          estadoString: orderData.estado,
          estadoLabel: valueToLabelMap[orderData.estado] ?? orderData.estado,
          detalles: orderData.detalles.map((detail) => ({
            ...detail,
            nombreProducto: detail.nombreProducto ?? detail.producto?.nombre,
            precioUnitario: detail.precioUnitario ?? detail.producto?.precio,
          })),
        };

        setSelectedOrderDetails(mappedOrderDetails);
        setIsModalOpen(true);
        showNotification('Detalles del pedido cargados.', 'info');
      } catch (err) {
        console.error('Error fetching order details:', err);
        const errMsg =
          err.response?.data?.message ||
          `Error al cargar los detalles del pedido: ${err.message || 'desconocido'}.`;
        setError(errMsg);
        setSelectedOrderDetails(null);
        showNotification(errMsg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [default_url, showNotification, valueToLabelMap]
  );

  // 7) Filtrar órdenes en memoria comparando strings (enum)
  const filteredOrders = useMemo(() => {
    if (filterStatus === '') return orders;
    return orders.filter((order) => order.estadoString === filterStatus);
  }, [orders, filterStatus]);

  if (error) return <div className="error-message">{error}</div>;
  if (statusesError) return <div className="error-message">{statusesError}</div>;

  return (
    <div className="order-management-container">
      <h2>Gestión de Pedidos</h2>
      {userName && <p className="user-name">Usuario: {userName}</p>}

      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {statusesLoading ? (
        <p>Cargando estados de pedidos...</p>
      ) : (
        <>
          {/* Selector de filtro por estado (enum string) */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="status-filter" style={{ marginRight: '10px' }}>
              Filtrar por Estado:
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              <option value="">Todos</option>
              {statusList
                // Si deseas excluir NEW (value="NEW"), puedes filtrar aquí:
                .filter((st) => st.value !== 'NEW')
                .map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
            </select>
          </div>

          {loading ? (
            <p>Cargando pedidos...</p>
          ) : filteredOrders.length === 0 ? (
            <p>No hay pedidos disponibles con el filtro actual.</p>
          ) : (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Cliente</th>
                  <th>Mesa</th>
                  <th>Total</th>
                  <th>Estado Actual</th>
                  <th>Pagado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.nombreCliente}</td>
                    <td>{order.mesaNumero || order.mesaId}</td>
                    <td>${order.total ? order.total.toLocaleString('es-CO') : '0'}</td>
                    <td>
                      <select
                        value={order.estadoString}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={loading}
                      >
                        {statusList.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{order.esPagado ? 'Sí' : 'No'}</td>
                    <td>{order.fecha ? new Date(order.fecha).toLocaleString('es-CO') : ''}</td>
                    <td className="details-action-cell">
                      <button className="ver-detalles-button" onClick={() => fetchOrderDetails(order.id)}>
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Modal de detalles del pedido */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles del Pedido"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(5px)',
          },
          content: {
            width: '60%',
            margin: 'auto',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            backgroundColor: 'rgba(248, 244, 229, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {selectedOrderDetails && (
          <div className="order-details-container">
            <h3>Detalles del Pedido #{selectedOrderDetails.id}</h3>
            <p>Cliente: {selectedOrderDetails.nombreCliente}</p>
            <p>Estado: {selectedOrderDetails.estadoLabel}</p>
            <p>
              Total: $
              {selectedOrderDetails.total
                ? selectedOrderDetails.total.toLocaleString('es-CO')
                : '0'}
            </p>
            <h4>Items:</h4>
            <ul>
              {selectedOrderDetails.detalles && selectedOrderDetails.detalles.length > 0 ? (
                selectedOrderDetails.detalles.map((item, index) => (
                  <li key={item.id || index}>
                    {item.nombreProducto} - Cantidad: {item.cantidad} - Precio Unitario: $
                    {item.precioUnitario
                      ? item.precioUnitario.toLocaleString('es-CO')
                      : '0'}{' '}
                    - Subtotal: $
                    {item.subtotal ? item.subtotal.toLocaleString('es-CO') : '0'}
                  </li>
                ))
              ) : (
                <li>No hay ítems para este pedido.</li>
              )}
            </ul>
            <button onClick={closeModal} className="close-modal-button">
              Cerrar
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OrderManagementPage;
