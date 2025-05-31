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
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const default_url = API_BASE_URL;

  const statusToNumberMap = useMemo(() => ({
    // La opción 'TODOS' en el select de filtro del frontend no se mapea a un número de enum
    // ya que no se envía como parámetro de estado a la API cuando se selecciona "Todos".
    'NUEVO': 0,
    'PENDIENTE': 1,
    'EN_PREPARACION': 2,
    'LISTO_PARA_ENTREGA': 3,
    'ENTREGADO': 4,
    'PAGADO': 5,
    'CANCELADO': 6,
    'FINALIZADO': 7,
  }), []);

  const numberToStatusMap = useMemo(() => ({
    0: 'NUEVO',
    1: 'PENDIENTE',
    2: 'EN_PREPARACION',
    3: 'LISTO_PARA_ENTREGA',
    4: 'ENTREGADO',
    5: 'PAGADO',
    6: 'CANCELADO',
    7: 'FINALIZADO',
  }), []);

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const organizationId = localStorage.getItem('organizationId');

    if (!organizationId || organizationId === "null" || organizationId === "0") {
      console.error("❌ organizationId no válido. No se cargan pedidos.");
      setError("No se encontró organización activa para cargar pedidos.");
      setLoading(false);
      setOrders([]);
      showNotification("No se encontró organización activa para cargar pedidos.", "error");
      return;
    }

    try {
      let url = `${default_url}/organization${organizationId}/listar`;

      // Solo añadir el parámetro 'estado' si filterStatus no es vacío (que es la opción "Todos")
      // y si existe en el mapeo de estados.
      // Se filtra aquí para evitar enviar el parámetro 'estado' cuando se selecciona "Todos".
      if (filterStatus && statusToNumberMap.hasOwnProperty(filterStatus)) {
        url += `?estado=${statusToNumberMap[filterStatus]}`;
      }

      console.log("🌎 Buscando pedidos para organizationId:", organizationId, "en URL:", url);

      const authToken = localStorage.getItem('authToken');
      const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};

      const response = await axios.get(url, config);
      console.log("✅ Pedidos recibidos:", response.data);

      const mappedOrders = response.data.map(order => ({
        id: order.pedidoId,
        nombreCliente: order.nombreCliente,
        mesaId: order.mesaId,
        mesaNumero: order.mesaNumero,
        estado: numberToStatusMap[order.estado] || order.estado,
        esPagado: order.esPagado,
        total: order.total,
        fecha: order.fecha,
        detalles: []
      }));
      setOrders(mappedOrders);
      showNotification("Pedidos cargados exitosamente.", "success");

    } catch (err) {
      console.error("❌ Error al cargar pedidos:", err);
      const errorMessage = err.response?.data?.message || `Error al cargar pedidos: ${err.message || 'Error desconocido'}.`;
      setError(errorMessage);
      setOrders([]);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [default_url, filterStatus, statusToNumberMap, numberToStatusMap, showNotification]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = useCallback(async (orderId, newStatusString) => {
    // Aquí el newStatusString proviene del select de cada pedido, que nunca tendrá 'Todos'.
    const newStatusNumber = statusToNumberMap[newStatusString];

    if (typeof newStatusNumber === 'undefined') { // Solo debería pasar si el estado no está en el mapeo
      console.error("Estado desconocido o inválido para enviar al backend:", newStatusString);
      showNotification(`Error: Estado '${newStatusString}' no válido para la actualización.`, "error");
      return;
    }

    const originalOrders = [...orders];
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, estado: newStatusString } : order
      )
    );

    try {
      const url = `${default_url}/api/Pedidos/cambiar-estado`;
      const payload = { pedidoId: orderId, nuevoEstado: newStatusNumber };

      const authToken = localStorage.getItem('authToken');
      const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};

      await axios.post(url, payload, config);

      showNotification(`Estado del pedido #${orderId} actualizado a ${newStatusString}.`, "success");
    } catch (error) {
      console.error(`❌ Error al actualizar el estado del pedido ${orderId}:`, error);
      const errorMessage = error.response?.data?.message || `Error al actualizar el estado del pedido #${orderId}: ${error.message || 'Error desconocido'}`;
      setError(errorMessage);
      showNotification(errorMessage, "error");
      setOrders(originalOrders);
    }
  }, [default_url, statusToNumberMap, showNotification, orders]);

  const fetchOrderDetails = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${default_url}/api/Pedidos/pedido/${orderId}`;

      const authToken = localStorage.getItem('authToken');
      const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};

      const response = await axios.get(url, config);
      console.log("Detalles del pedido recibidos:", response.data);

      const orderData = response.data;

      const mappedOrderDetails = {
        ...orderData,
        id: orderData.pedidoId,
        estado: numberToStatusMap[orderData.estado] || orderData.estado,
        detalles: orderData.detalles.map(detail => ({
          ...detail,
          nombreProducto: detail.nombreProducto || detail.producto?.nombre,
          precioUnitario: detail.precioUnitario || detail.producto?.precio,
        }))
      };

      setSelectedOrderDetails(mappedOrderDetails);
      setIsModalOpen(true);
      showNotification("Detalles del pedido cargados.", "info");

    } catch (err) {
      console.error("Error fetching order details:", err);
      const errorMessage = err.response?.data?.message || `Error al cargar los detalles del pedido: ${err.message || 'Error desconocido'}.`;
      setError(errorMessage);
      setSelectedOrderDetails(null);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [default_url, numberToStatusMap, showNotification]);

  // Filtra los pedidos según el estado seleccionado (se recalcula solo cuando cambian 'orders' o 'filterStatus')
  const filteredOrders = useMemo(() => {
    // Si filterStatus es vacío (lo que corresponde a "Todos"), muestra todos los pedidos.
    // De lo contrario, filtra por el estado seleccionado.
    return orders.filter(order =>
      filterStatus === '' ? true : order.estado === filterStatus
    );
  }, [orders, filterStatus]);

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="order-management-container">
      <h2>Gestión de Pedidos</h2>

      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {/* Nuevo Dropdown para los filtros de estado */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="status-filter" style={{ marginRight: '10px' }}>Filtrar por Estado:</label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          {/* Opción "Todos" para no aplicar ningún filtro de estado a la API */}
          <option value="">Todos</option>
          {/* Generar opciones para cada estado a partir de statusToNumberMap */}
          {/* Se excluyen las claves que no son estados reales del enum, como 'TODOS' si la hubiéramos puesto en el mapeo */}
          {Object.keys(statusToNumberMap).map(statusKey => (
            <option key={statusKey} value={statusKey}>
              {statusKey.replace(/_/g, ' ')}
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
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.nombreCliente}</td>
                <td>{order.mesaNumero || order.mesaId}</td>
                <td>${order.total ? order.total.toLocaleString('es-CO') : '0'}</td>
                <td>
                  <select
                    value={order.estado}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={loading}
                  >
                    {/* Las opciones del select de cada pedido son los estados que se pueden establecer */}
                    {Object.keys(statusToNumberMap).map(statusKey => (
                      <option key={statusKey} value={statusKey}>
                        {statusKey.replace(/_/g, ' ')}
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
            <p>Estado: {selectedOrderDetails.estado}</p>
            <p>Total: ${selectedOrderDetails.total ? selectedOrderDetails.total.toLocaleString('es-CO') : '0'}</p>
            <h4>Items:</h4>
            <ul>
              {selectedOrderDetails.detalles && selectedOrderDetails.detalles.length > 0 ? (
                selectedOrderDetails.detalles.map((item, index) => (
                  <li key={item.id || index}>
                    {item.nombreProducto} - Cantidad: {item.cantidad} - Precio Unitario: ${item.precioUnitario ? item.precioUnitario.toLocaleString('es-CO') : '0'} - Subtotal: ${item.subtotal ? item.subtotal.toLocaleString('es-CO') : '0'}
                  </li>
                ))
              ) : (
                <li>No hay ítems para este pedido.</li>
              )}
            </ul>
            <button onClick={closeModal} className="close-modal-button">Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OrderManagementPage;