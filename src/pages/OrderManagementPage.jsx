import React, { useState, useEffect } from 'react';
//import LoadingSpinner from '../components/LoadingSpinner'; // Componente de carga (opcional)
// import { fetchOrders, updateOrderStatus } from '../api/orders'; // Funciones API (necesitas crearlas)
// import OrderTable from '../components/OrderTable'; // Un componente de tabla específico o genérico

// Mock Data (reemplazar con llamadas API)
const mockOrders = [
  { id: 'P001', customerName: 'Juan Perez', status: 'Pendiente', total: 55000, items: 3, createdAt: '2025-04-02T20:00:00Z' },
  { id: 'P002', customerName: 'Ana Gómez', status: 'En Preparación', total: 32000, items: 2, createdAt: '2025-04-02T20:05:00Z' },
  { id: 'P003', customerName: 'Carlos López', status: 'Listo para Entregar', total: 78000, items: 5, createdAt: '2025-04-02T20:10:00Z' },
  { id: 'P004', customerName: 'Maria Rodriguez', status: 'Entregado', total: 41000, items: 2, createdAt: '2025-04-02T19:55:00Z' },
];

// Mock API functions (reemplazar con llamadas reales)
const fetchOrders = async () => {
    console.log("Fetching orders...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay de red
    console.log("Orders fetched.");
    return mockOrders;
};

const updateOrderStatus = async (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simula delay de red
    // En una app real, actualiza el estado en el backend y luego actualiza el estado local.
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        mockOrders[orderIndex].status = newStatus;
        console.log(`Order ${orderId} updated in mock data.`);
        return { ...mockOrders[orderIndex] }; // Devuelve el pedido actualizado
    }
    throw new Error("Order not found");
};


function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // Para mostrar feedback

  const possibleStatus = ['Pendiente', 'Confirmado', 'En Preparación', 'Listo para Entregar', 'En Camino', 'Entregado', 'Cancelado'];

  useEffect(() => {
    setLoading(true);
    fetchOrders()
      .then(data => {
        setOrders(data);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setError("No se pudieron cargar los pedidos.");
        setOrders([]); // Limpia los pedidos en caso de error
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (updatingOrderId) return; // Evita updates múltiples simultáneos

    const originalOrders = [...orders]; // Copia para posible rollback
    setUpdatingOrderId(orderId); // Marca el pedido como 'actualizando'

    // Optimistic UI Update (opcional pero mejora UX)
    setOrders(prevOrders =>
        prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        )
    );

    try {
      await updateOrderStatus(orderId, newStatus);
      // Si la API devuelve el pedido actualizado, puedes usarlo:
      // setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setError(null); // Limpia errores previos
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(`Error al actualizar el pedido ${orderId}. Intente de nuevo.`);
      // Rollback UI on failure
      setOrders(originalOrders);
    } finally {
      setUpdatingOrderId(null); // Termina el estado de 'actualizando'
    }
  };

  //if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Pedidos</h2>
      {orders.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado Actual</th>
              <th>Acciones</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className={updatingOrderId === order.id ? 'updating' : ''}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.items}</td>
                <td>${order.total.toLocaleString('es-CO')}</td> {/* Formato de moneda */}
                <td>{order.status}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    disabled={updatingOrderId === order.id} // Deshabilita mientras se actualiza
                  >
                    {possibleStatus.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                    {updatingOrderId === order.id && <span style={{ marginLeft: '8px' }}>🔄</span>}
                </td>
                 <td>{new Date(order.createdAt).toLocaleString('es-CO')}</td> {/* Formato de fecha */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Podrías añadir filtros, paginación, etc. aquí */}
    </div>
  );
}

export default OrderManagementPage;