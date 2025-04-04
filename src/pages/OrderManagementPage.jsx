import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal'; // Importar Modal

// Establecer el elemento raíz para react-modal
Modal.setAppElement('#root');

function OrderManagementPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const handleStatusChange = (orderId, newStatus) => {
        setSelectedStatuses(prev => ({ ...prev, [orderId]: newStatus }));
    };

    const handleMultipleStatusUpdate = async (pedidosActualizaciones) => {
        try {
            const response = await axios.put('https://localhost:8080/api/Pedidos/actualizarEstados', pedidosActualizaciones);
            console.log(response.data);

            setOrders(prevOrders => {
                return prevOrders.map(order => {
                    const pedidoActualizacion = pedidosActualizaciones.find(p => p.id === order.id);
                    if (pedidoActualizacion) {
                        return { ...order, estado: pedidoActualizacion.nuevoEstado };
                    }
                    return order;
                });
            });
        } catch (error) {
            console.error('Error al actualizar estados de pedidos:', error);
            if (error.response) {
                console.error("Server error:", error.response.data);
                setError(`Server error: ${error.response.data}`);
            } else if (error.request) {
                console.error("No response from server:", error.request);
                setError("No response from server.");
            } else {
                console.error("Error setting up the request:", error.message);
                setError(`Request error: ${error.message}`);
            }
        }
    };

    const handleConfirmUpdate = () => {
        const pedidosActualizaciones = Object.keys(selectedStatuses).map(orderId => ({
            id: parseInt(orderId),
            nuevoEstado: selectedStatuses[orderId]
        }));
        handleMultipleStatusUpdate(pedidosActualizaciones);
        setSelectedStatuses({});
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
                                <td>{order.estado}</td>
                                <td>
                                    <select
                                        value={selectedStatuses[order.id] || order.estado}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        {possibleStatus.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>{new Date(order.fecha).toLocaleString('es-CO')}</td>
                                <td>
                                    <button onClick={() => fetchOrderDetails(order.id)}>Ver Detalles</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <button onClick={handleConfirmUpdate}>Confirmar Actualización</button>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Detalles del Pedido"
                style={{
                    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    content: { width: '60%', margin: 'auto' },
                }}
            >
                {selectedOrderDetails && (
                    <div>
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
                        <button onClick={closeModal}>Cerrar</button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OrderManagementPage;