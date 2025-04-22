import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal'; // Importar Modal
import '../App.css';

// Establecer el elemento raíz para react-modal
Modal.setAppElement('#root');

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Cambiamos a false inicialmente
  const [error, setError] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const possibleStatus = ['Pendiente', 'Confirmado', 'En Preparación', 'Listo para Entregar', 'En Camino', 'Entregado', 'Cancelado'];

  useEffect(() => {
    setLoading(true);
    axios.get('https://localhost:8080/api/Pedidos')
      .then(response => {
        setOrders(response.data);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setError("No se pudieron cargar los pedidos.");
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setSelectedStatuses(prev => ({ ...prev, [orderId]: newStatus }));
    // Llamar directamente a la función de actualización individual
    await handleSingleStatusUpdate(orderId, newStatus);
  };

  const handleSingleStatusUpdate = async (orderId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`https://localhost:8080/api/Pedidos/${orderId}`, {
        id: orderId,
        nuevoEstado: newStatus
      });
      console.log(`Estado del pedido ${orderId} actualizado:`, response.data);

      // Actualizar el estado del pedido en la interfaz de usuario
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, estado: newStatus } : order
        )
      );
      // Limpiar el estado seleccionado para este pedido (opcional, ya que se actualiza inmediatamente)
      setSelectedStatuses(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      // Opcional: Mostrar un mensaje de éxito
      // alert(`Estado del pedido ${orderId} actualizado a ${newStatus}`);
    } catch (error) {
      console.error(`Error al actualizar el estado del pedido ${orderId}:`, error);
      setError(`Error al actualizar el estado del pedido ${orderId}. Intente de nuevo.`);
      // Revertir el estado en el select si la actualización falla
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, estado: selectedStatuses[orderId] || order.estado } : order
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://localhost:8080/api/Pedidos/${orderId}`);
      const orderWithDetails = {
        ...response.data,
        detalles: await Promise.all(response.data.detalles.map(async (detalle) => {
          const productResponse = await axios.get(`https://localhost:8080/api/Productos/${detalle.productoId}`);
          return {
            ...detalle,
            nombreProducto: productResponse.data.nombre,
            precioUnitario: productResponse.data.precio,
          };
        })),
      };
      setSelectedOrderDetails(orderWithDetails);
      setIsModalOpen(true); // Abrir el modal
      setError(null);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Error al cargar los detalles del pedido.");
      setSelectedOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Pedidos</h2>
      {orders.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        <table style={{ width: '100%' }}> {/* Ajustar el ancho de la tabla */}
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado Actual</th>
              <th>Acciones</th>
              <th>Fecha</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.nombreCliente}</td>
                <td>{order.detalles.length}</td>
                <td>${order.total.toLocaleString('es-CO')}</td>
                <td>
                  <select
                    value={selectedStatuses[order.id] || order.estado}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={loading} // Deshabilitar el select mientras se actualiza
                  >
                    {possibleStatus.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {loading && <span className="updating-text">Actualizando...</span>} {/* Mostrar texto de carga */}
                </td>
                <td>{new Date(order.fecha).toLocaleString('es-CO')}</td>
                <td className="details-action-cell"> {/* Celda para el botón "Ver Detalles" */}
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)', /* Reducimos la opacidad del overlay para más transparencia */
            backdropFilter: 'blur(5px)', /* Añadimos un efecto de desenfoque al fondo (si el navegador lo soporta) */
          },
          content: {
            width: '60%',
            margin: 'auto',
            borderRadius: '12px', /* Aumentamos un poco el redondeo */
            padding: '30px', /* Aumentamos un poco el padding */
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', /* Sombra más pronunciada */
            backgroundColor: 'rgba(248, 244, 229, 0.9)', /* Fondo suave con ligera transparencia */
            backdropFilter: 'blur(10px)', /* Añadimos un efecto de desenfoque al fondo del modal (si el navegador lo soporta) */
            border: '1px solid rgba(0, 0, 0, 0.1)', /* Borde sutil */
          },
        }}
      >
        {selectedOrderDetails && (
          <div className="order-details-container">
            <h3>Detalles del Pedido {selectedOrderDetails.id}</h3>
            <p>Cliente: {selectedOrderDetails.nombreCliente}</p>
            <p>Estado: {selectedOrderDetails.estado}</p>
            <p>Total: ${selectedOrderDetails.total.toLocaleString('es-CO')}</p>
            <h4>Items:</h4>
            <ul>
              {selectedOrderDetails.detalles.map(item => (
                <li key={item.id}>
                  {item.nombreProducto} - Cantidad: {item.cantidad} - Precio Unitario: ${item.precioUnitario.toLocaleString('es-CO')} - Subtotal: ${item.subtotal.toLocaleString('es-CO')}
                </li>
              ))}
            </ul>
            <button onClick={closeModal} className="close-modal-button">Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OrderManagementPage;