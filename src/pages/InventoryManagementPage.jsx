import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import '../App.css';
import Notification from '../components/Notification';

function InventoryManagementPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', price: '', category: '' });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const default_url = "https://ordexpress-api.onrender.com";

  const [imagen, setImagen] = useState(null); // Archivo de imagen seleccionado
  const [previewImageUrl, setPreviewImageUrl] = useState(''); // URL para la vista previa en los modales
  const [uploadingImage, setUploadingImage] = useState(false); // Estado para indicar si se está subiendo la imagen

  // Función para mostrar notificaciones, envuelta en useCallback para optimización
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    // Duración de la notificación basada en la longitud del mensaje
    const duration = message.length > 100 ? 5000 : 3000;
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, duration);
  }, []);

  // Función para obtener el inventario, envuelta en useCallback
  const fetchInventory = useCallback(async () => {
    const organizationId = localStorage.getItem('organizationId');
    if (!organizationId) {
      setError("No se encontró organización asociada.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Corrección: Asegurarse de que organizationId sea un número entero
      const parsedOrganizationId = parseInt(organizationId, 10);
      if (isNaN(parsedOrganizationId)) {
        setError("ID de organización inválido.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${default_url}/api/Productos/${parsedOrganizationId}/list`);
      setInventory(response.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      showNotification("Error al cargar el inventario.", "error");
      setError("Error al cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [showNotification, default_url]);

  // Función para obtener metadatos (estados y categorías), envuelta en useCallback
  const fetchMetadata = useCallback(async () => {
    try {
      const [statesResponse, categoriesResponse] = await Promise.all([
        axios.get(`${default_url}/api/Metadata/productStatus`),
        axios.get(`${default_url}/api/Metadata/productCategory`)
      ]);
      setStatesList(statesResponse.data);
      setCategoriesList(categoriesResponse.data);
    } catch (err) {
      console.error("Error fetching metadata:", err);
      showNotification("Error al cargar metadatos (categorías/estados).", "error");
    }
  }, [showNotification, default_url]);

  // useEffect para cargar el inventario y los metadatos al montar el componente
  useEffect(() => {
    const organizationId = localStorage.getItem('organizationId');

    if (!organizationId) {
      setError("No se encontró organización asociada.");
      return;
    }

    fetchInventory();
    fetchMetadata();
  }, [fetchInventory, fetchMetadata]);

  // Manejador para el cambio de la imagen seleccionada en el input de tipo 'file'
  const handleImagenChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagen(file);
      // Crea una URL de objeto para la vista previa inmediata en el frontend
      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setImagen(null);
      setPreviewImageUrl('');
    }
  };

  // Función para subir la imagen al servidor y DEVOLVER la URL
  const handleSubirImagen = async () => {
    if (!imagen) {
      showNotification('Por favor, selecciona una imagen primero.', 'warning');
      return null; // Devuelve null si no hay imagen
    }

    const formData = new FormData();
    formData.append('file', imagen);

    setUploadingImage(true);
    showNotification('Subiendo imagen...', 'info');

    try {
      const response = await axios.post(`${default_url}/api/Productos/uploadImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.imageUrl) {
        console.log("URL de imagen obtenida del servidor:", response.data.imageUrl); // LOG DE DEBUG
        showNotification('Imagen subida exitosamente!', 'success');
        return response.data.imageUrl; // DEVUELVE LA URL DIRECTAMENTE
      } else {
        console.error("Error: La respuesta del servidor no contiene la URL de la imagen:", response.data);
        showNotification('Error al recibir la URL de la imagen.', 'error');
        return null;
      }

    } catch (error) {
      console.error('Error al subir la imagen:', error.response || error.message || error);
      if (error.response) {
        console.error("Data del error de subida:", error.response.data);
        console.error("Status del error de subida:", error.response.status);
        showNotification(`Error al subir imagen: ${error.response.data.message || 'Error del servidor.'} (Status: ${error.response.status})`, "error");
      } else {
        showNotification('Error al subir la imagen. Revisa la conexión o la consola.', 'error');
      }
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Manejador para añadir un nuevo producto
  const handleAddItem = async () => {
    const organizationId = localStorage.getItem('organizationId');

    if (!newItem.name || !newItem.stock || !newItem.price || !newItem.category) {
      showNotification("Todos los campos (nombre, stock, precio, categoría) son obligatorios.", "warning");
      return;
    }

    let finalImageUrl = ''; // Inicializamos la URL final
    if (imagen) { // Si hay una imagen seleccionada para subir
      const uploadedUrl = await handleSubirImagen(); // Obtenemos la URL directamente de la subida
      if (!uploadedUrl) {
        return; // Si la subida falla, detiene la operación de añadir producto
      }
      finalImageUrl = uploadedUrl; // Usamos la URL devuelta por la subida
    }

    try {
      const newProductData = {
        nombre: newItem.name,
        stock: parseInt(newItem.stock, 10) || 0,
        precio: parseFloat(newItem.price) || 0,
        categoria: newItem.category,
        organizationId: parseInt(organizationId, 10),
        ImagenUrl: finalImageUrl, // CORRECCIÓN: Cambiado de 'imageUrl' a 'ImagenUrl'
      };
      console.log("Datos del nuevo producto a enviar (handleAddItem):", newProductData); // LOG DE DEBUG

      await axios.post(`${default_url}/api/Productos`, newProductData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      showNotification("Producto añadido exitosamente", "success");
      setShowModal(false);
      setNewItem({ name: '', stock: '', price: '', category: '' });
      setImagen(null);
      setPreviewImageUrl(''); // Limpiamos la URL de la vista previa
      fetchInventory();
    } catch (error) {
      console.error("Error al guardar producto:", error.response || error.message || error);
      if (error.response) {
        console.error("Data del error:", error.response.data);
        console.error("Status del error:", error.response.status);
        showNotification(`Error al guardar: ${error.response.data.message || 'Error del servidor.'} (Status: ${error.response.status})`, "error");
      } else {
        showNotification("Error al guardar el producto. Revisa la consola.", "error");
      }
    }
  };

  // Manejador para cuando se hace clic en una fila de la tabla (para editar)
  const handleRowClick = (producto) => {
    setEditingProduct({
      ...producto,
      categoria: producto.categoria || "",
      estado: producto.estado || "",
      imageUrl: producto.imageUrl || ""
    });
    setPreviewImageUrl(producto.imageUrl || ""); // Establece la URL de la imagen actual para la vista previa
    setImagen(null); // Resetea el archivo de imagen seleccionado
    setShowEditModal(true);
  };

  // Manejador para eliminar un producto
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await axios.delete(`${default_url}/api/Productos/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      showNotification("Producto eliminado exitosamente.", "success");
      fetchInventory();
    } catch (error) {
      console.error("Error al eliminar el producto:", error.response || error.message || error);
      if (error.response) {
        console.error("Data del error:", error.response.data);
        console.error("Status del error:", error.response.status);
        showNotification(`Error al eliminar: ${error.response.data.message || 'Error del servidor.'} (Status: ${error.response.status})`, "error");
      } else {
        showNotification("Error al eliminar el producto. Revisa la consola.", "error");
      }
    }
  };

  // Manejador para actualizar un producto existente
  const handleUpdateProduct = async () => {
    if (!editingProduct) {
      showNotification("No hay producto seleccionado para editar.", "warning");
      return;
    }
    // Corrección: Asegurarse de que editingProduct.productoId sea un número entero
    const productIdToUpdate = parseInt(editingProduct.productoId, 10);
    if (isNaN(productIdToUpdate)) {
      showNotification("El ID del producto a editar es inválido. No es un número.", "error");
      console.error("ID de producto faltante o inválido en editingProduct:", editingProduct);
      return;
    }

    let finalImageUrl = editingProduct.imageUrl; // Por defecto, la URL actual del producto
    if (imagen) { // Si hay una nueva imagen seleccionada para subir
      const uploadedUrl = await handleSubirImagen(); // Obtenemos la URL directamente de la subida
      if (!uploadedUrl) {
        return; // Si la subida falla, detiene la operación de actualización
      }
      finalImageUrl = uploadedUrl; // Usamos la URL devuelta por la subida
    }

    console.log("Intentando actualizar producto (estado actual de editingProduct):", JSON.parse(JSON.stringify(editingProduct)));
    console.log("Imagen URL que se usará para la actualización (handleUpdateProduct):", finalImageUrl); // LOG DE DEBUG

    try {
      const productDataToUpdate = {
        nombre: editingProduct.nombre,
        stock: parseInt(editingProduct.stock, 10) || 0,
        precio: parseFloat(editingProduct.precio) || 0,
        categoria: editingProduct.categoria,
        estado: editingProduct.estado,
        ImagenUrl: finalImageUrl, // CORRECCIÓN: Cambiado de 'imageUrl' a 'ImagenUrl'
      };

      console.log("Datos que se enviarán al backend para actualizar (handleUpdateProduct):", productDataToUpdate); // LOG DE DEBUG

      // Corrección: Asignar la respuesta de axios.put a una variable 'response'
      const response = await axios.put(`${default_url}/api/Productos/${productIdToUpdate}`, productDataToUpdate, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      console.log("Respuesta del backend tras la actualización:", response);

      showNotification("Producto actualizado exitosamente", "success");
      setShowEditModal(false);
      setEditingProduct(null);
      setImagen(null);
      setPreviewImageUrl(''); // Limpiamos la URL de la vista previa
      fetchInventory();

    } catch (error) {
      console.error("Error DETALLADO al actualizar el producto:", error.response || error.message || error);
      if (error.response) {
        console.error("Data del error:", error.response.data);
        console.error("Status del error:", error.response.status);
        const errorMsg = error.response.data?.errors ? JSON.stringify(error.response.data.errors) : (error.response.data?.message || error.response.data?.title || 'No se pudo actualizar.');
        showNotification(`Error: ${errorMsg} (Status: ${error.response.status})`, "error");
      } else {
        showNotification("Error al actualizar el producto. Revisa la consola o la conexión de red.", "error");
      }
    }
  };

  // Estilos para la tabla
  const thStyle = {
    borderBottom: '1px solid #ccc',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
  };

  const tdStyle = {
    borderBottom: '1px solid #eee',
    padding: '8px',
    verticalAlign: 'middle',
  };

  const deleteButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  };

  return (
    <div>
      {/* Componente de notificación */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <h2>Gestión de Inventario</h2>

      {/* Botón para abrir el modal de añadir nuevo ítem */}
      <button onClick={() => {
        setShowModal(true);
        setNewItem({ name: '', stock: '', price: '', category: '' });
        setImagen(null);
        setPreviewImageUrl(''); // Limpiamos la URL de la vista previa al abrir el modal
      }} className="add-button">Añadir Ítem</button>

      {/* Modal para añadir nuevo producto */}
      <Modal isOpen={showModal} onClose={() => {
        setShowModal(false);
        setNewItem({ name: '', stock: '', price: '', category: '' });
        setImagen(null);
        setPreviewImageUrl(''); // Limpiamos la URL de la vista previa al cerrar el modal
      }}>
        <h3>Nuevo Producto</h3>

        {/* Campos del formulario para nuevo producto */}
        <input
          type="text"
          placeholder="Nombre del Ítem"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <input
          type="number"
          placeholder="Stock Inicial"
          value={newItem.stock}
          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <input
          type="number"
          placeholder="Precio (COP)"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          <option value="">Seleccione Categoría</option>
          {categoriesList.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Sección para subir imagen en el modal de añadir */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="imagenProductoNuevo" style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Imagen:</label>
          <input
            type="file"
            id="imagenProductoNuevo"
            accept="image/*"
            onChange={handleImagenChange}
            style={{ width: '100%' }}
          />
        </div>

        {imagen && ( // Muestra el botón de subir solo si hay una imagen seleccionada
          <button
            type="button"
            onClick={async () => {
              // Solo para la vista previa, no es necesario llamar a handleSubirImagen aquí
              // La subida real se hace en handleAddItem
              showNotification('Imagen seleccionada para subir al guardar el producto.', 'info');
            }}
            className="upload-button"
            style={{ marginBottom: '10px', marginRight: '10px' }}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Subiendo...' : 'Imagen Seleccionada'}
          </button>
        )}

        {previewImageUrl && ( // Muestra la vista previa si hay una URL de imagen
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0 0 5px 0' }}>Vista previa:</p>
            <img src={previewImageUrl} alt="Vista previa" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', objectFit: 'cover' }}
                 onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Error'; console.error("Error al cargar vista previa. URL:", previewImageUrl); }}
            />
            {console.log("Renderizando vista previa con URL:", previewImageUrl)}
          </div>
        )}

        {/* Botón para guardar el nuevo producto */}
        <button onClick={handleAddItem} className="save-button" disabled={uploadingImage}>
          Guardar Producto
        </button>
      </Modal>

      {/* Modal para editar producto existente */}
      <Modal isOpen={showEditModal} onClose={() => {
        setShowEditModal(false);
        setEditingProduct(null);
        setImagen(null);
        setPreviewImageUrl(''); // Limpiamos la URL de la vista previa al cerrar el modal
      }}>
        {editingProduct && ( // Solo muestra el contenido si hay un producto en edición
          <div>
            <h3>Editar Producto</h3>
            {/* Campos del formulario para editar producto */}
            <input
              type="text"
              value={editingProduct.nombre}
              onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }}
            />
            <input
              type="number"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
              style={{ marginBottom: '10px', width: '100%' }}
            />
            <input
              type="number"
              value={editingProduct.precio}
              onChange={(e) => setEditingProduct({ ...editingProduct, precio: parseFloat(e.target.value) || 0 })}
              style={{ marginBottom: '10px', width: '100%' }}
            />
            <select
              value={editingProduct.categoria || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, categoria: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              <option value="">Seleccione Categoría</option>
              {categoriesList.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={editingProduct.estado || ""}
              onChange={(e) => setEditingProduct({ ...editingProduct, estado: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              <option value="">Seleccione Estado</option>
              {statesList.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>

            {/* Sección para cambiar imagen en el modal de edición */}
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="editImagenProducto" style={{ display: 'block', marginBottom: '5px' }}>Cambiar Imagen:</label>
              <input
                type="file"
                id="editImagenProducto"
                accept="image/*"
                onChange={handleImagenChange}
                style={{ width: '100%' }}
              />
            </div>

            {imagen && ( // Muestra el botón de subir nueva imagen solo si hay una seleccionada
              <button
                type="button"
                onClick={async () => {
                  // Solo para la vista previa, la subida real se hace en handleUpdateProduct
                  showNotification('Imagen seleccionada para subir al guardar los cambios.', 'info');
                }}
                className="upload-button"
                style={{ marginBottom: '10px', marginRight: '10px' }}
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Subiendo...' : 'Nueva Imagen Seleccionada'}
              </button>
            )}

            {previewImageUrl ? ( // Muestra la vista previa si hay una URL de imagen (nueva o actual)
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0 0 5px 0' }}>
                  {imagen ? 'Vista previa de imagen nueva/seleccionada:' : 'Imagen actual:'}
                </p>
                <img
                  src={previewImageUrl}
                  alt={editingProduct.nombre || "Imagen del producto"}
                  style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Error'; console.error("Error al cargar vista previa. URL:", previewImageUrl); }}
                />
                {console.log("Renderizando vista previa con URL:", previewImageUrl)}
              </div>
            ) : (editingProduct.imageUrl && // Si no hay nueva imagen y el producto tiene una URL existente, muestra la existente
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0 0 5px 0' }}>Imagen actual:</p>
                <img
                  src={editingProduct.imageUrl}
                  alt={editingProduct.nombre || "Imagen del producto"}
                  style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/000000?text=Error'; console.error("Error al cargar imagen actual. URL:", editingProduct.imageUrl); }}
                />
                {console.log("Renderizando imagen actual con URL:", editingProduct.imageUrl)}
              </div>
            )}
            {/* Mensaje si no hay imagen asociada al producto */}
            {!previewImageUrl && !editingProduct.imageUrl && <p style={{ marginBottom: '10px' }}>Este producto no tiene imagen.</p>}

            {/* Botón para guardar los cambios del producto */}
            <button onClick={handleUpdateProduct} className="save-button" disabled={uploadingImage}>
              Guardar Cambios
            </button>
          </div>
        )}
      </Modal>

      {/* Tabla de inventario */}
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Imagen</th>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Precio (COP)</th>
            <th style={thStyle}>Categoría</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? ( // Muestra mensaje de carga
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Cargando productos...</td></tr>
          ) : error ? ( // Muestra mensaje de error
            <tr><td colSpan="6" style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</td></tr>
          ) : inventory.length === 0 ? ( // Muestra mensaje si no hay productos
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay productos disponibles.</td></tr>
          ) : ( // Mapea y renderiza los productos del inventario
            inventory.map((producto) => (
              <tr key={producto.productoId}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(producto)}>
                <td style={tdStyle}>
                  {producto.imageUrl ? ( // Muestra la imagen si existe
                    <>
                      <img
                        src={producto.imageUrl}
                        alt={producto.nombre}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/000000?text=Error'; console.error("Error al cargar imagen para:", producto.nombre, "URL:", producto.imageUrl); }}
                      />
                      {console.log("Renderizando imagen para:", producto.nombre, "URL:", producto.imageUrl)}
                    </>
                  ) : ( // Si no hay imagen, muestra un texto
                    <>
                      <span style={{ fontSize: '12px', color: '#888' }}>Sin imagen</span>
                      {console.log("Producto sin imagen:", producto.nombre)}
                    </>
                  )}
                </td>
                <td style={tdStyle}>{producto.nombre}</td>
                <td style={tdStyle}>{producto.stock}</td>
                <td style={tdStyle}>${producto.precio != null ? producto.precio.toLocaleString() : '0'}</td>
                <td style={tdStyle}>{producto.categoria}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {/* Botón para eliminar producto */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProduct(producto.productoId); }}
                    style={deleteButtonStyle}
                    title="Eliminar producto"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryManagementPage;
