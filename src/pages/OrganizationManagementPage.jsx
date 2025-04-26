import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function OrganizationManagementPage({ isAuthenticated }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgStatus, setNewOrgStatus] = useState('Activo'); // Estado por defecto (con 'o')
  const [isCreating, setIsCreating] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [editedOrgName, setEditedOrgName] = useState('');
  const [editedOrgStatus, setEditedOrgStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // ID de la organización a eliminar

  const possibleStatus = ['Activo', 'Inactivo', 'Suspendido']; // Valores con 'o' y 'Suspendido'

 useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("No se encontró el token de autenticación.");
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      window.location.href = '/login'; // Redirige al usuario a la página de inicio de sesión
      return;
    }
    fetchOrganizations();
  }, [isAuthenticated]);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('https://localhost:8080/api/Organizations', {
        headers: {
          Authorization: `Bearer ${token}`, // Usa el token obtenido justo antes de la petición
        },
      });
      setOrganizations(response.data);
    } catch (err) {
      console.error("Error al cargar las organizaciones:", err);
      setError("Error al cargar las organizaciones.");
      if (err.response && err.response.status === 401) {
        console.error("Error 401: No autorizado. El token puede ser inválido o expirado.");
        setError("No estás autorizado para ver esta página. Por favor, inicia sesión nuevamente.");
        // Aquí podrías limpiar el token y redirigir al usuario a la página de inicio de sesión
        localStorage.removeItem('authToken');
        // window.location.href = '/login'; // Ejemplo de redirección
      } else if (err.response) {
        console.error("Detalles del error del servidor:", err.response.data);
        setError(`Error al cargar las organizaciones: ${err.response.data}`);
      } else {
        console.error("Error sin respuesta del servidor:", err);
        setError("Error al cargar las organizaciones. No se recibió respuesta del servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    setIsCreating(true);
    setError(null);
    if (!newOrgName.trim()) {
      setError("El nombre de la organización es requerido.");
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const newOrg = {
        name: newOrgName,
        status: newOrgStatus,
        mesas: [],
      };

      const response = await axios.post('https://localhost:8080/api/Organizations', newOrg, {
        headers: {
          Authorization: `Bearer ${token}`, // Usa el token obtenido justo antes de la petición
        },
      });
      console.log("Organización creada:", response.data);
      fetchOrganizations();
      setNewOrgName('');
    } catch (err) {
      console.error("Error al crear la organización:", err);
      setError("Error al crear la organización.");
      if (err.response && err.response.status === 401) {
        console.error("Error 401: No autorizado. El token puede ser inválido o expirado.");
        setError("No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem('authToken');
        // window.location.href = '/login'; // Ejemplo de redirección
      } else if (err.response) {
        console.error("Detalles del error del servidor:", err.response.data);
        setError(`Error al crear la organización: ${err.response.data}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditOrganization = (organization) => {
    setEditingOrgId(organization.domainId);
    setEditedOrgName(organization.name);
    setEditedOrgStatus(organization.status);
  };

  const handleUpdateOrganization = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const updatedOrg = {
        domainId: editingOrgId,
        name: editedOrgName,
        status: editedOrgStatus,
        mesas: [], // Añadir la propiedad 'mesas' con un array vacío
      };
      await axios.put(`https://localhost:8080/api/Organizations/${editingOrgId}`, updatedOrg, {
        headers: {
          Authorization: `Bearer ${token}`, // Usa el token obtenido justo antes de la petición
        },
      });
      console.log("Organización actualizada:", updatedOrg);
      fetchOrganizations();
      setEditingOrgId(null);
    } catch (err) {
      console.error("Error al actualizar la organización:", err);
      setError("Error al actualizar la organización.");
      if (err.response && err.response.status === 401) {
        console.error("Error 401: No autorizado. El token puede ser inválido o expirado.");
        setError("No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem('authToken');
        // window.location.href = '/login'; // Ejemplo de redirección
      } else if (err.response) {
        console.error("Detalles del error del servidor:", err.response.data);
        setError(`Error al actualizar la organización: ${err.response.data}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrganization = (id) => {
    setIsDeleting(id);
  };

  const confirmDeleteOrganization = async (id) => {
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://localhost:8080/api/Organizations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Usa el token obtenido justo antes de la petición
        },
      });
      console.log(`Organización con ID ${id} eliminada.`);
      fetchOrganizations();
    } catch (err) {
      console.error(`Error al eliminar la organización con ID ${id}:`, err);
      setError("Error al eliminar la organización.");
      if (err.response && err.response.status === 401) {
        console.error("Error 401: No autorizado. El token puede ser inválido o expirado.");
        setError("No estás autorizado para realizar esta acción. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem('authToken');
        // window.location.href = '/login'; // Ejemplo de redirección
      } else if (err.response) {
        console.error("Detalles del error del servidor:", err.response.data);
        setError(`Error al eliminar la organización: ${err.response.data}`);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDeleteOrganization = () => {
    setIsDeleting(null);
  };

  if (loading) return <p>Cargando organizaciones...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Organizaciones</h2>

      {/* Mostrar el formulario solo si el usuario está autenticado */}
      {isAuthenticated && (
        <div>
          <h3>Añadir Nueva Organización</h3>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }}>
              Nombre:
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', minWidth: '150px', flexGrow: 1 }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }}>
              Estado:
              <select
                value={newOrgStatus}
                onChange={(e) => setNewOrgStatus(e.target.value)}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', minWidth: '150px', flexGrow: 1 }}
              >
                {possibleStatus.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="add-button"
              onClick={handleCreateOrganization}
              disabled={isCreating || !newOrgName}
              style={{ marginTop: '15px' }}
            >
              {isCreating ? 'Añadiendo...' : 'Añadir Organización'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      )}

      {/* Listado de Organizaciones */}
      <h3>Organizaciones Existentes</h3>
      {organizations.length === 0 ? (
        <p>No hay organizaciones configuradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.domainId}>
                <td>{org.domainId}</td>
                <td>
                  {editingOrgId === org.domainId ? (
                    <input
                      type="text"
                      value={editedOrgName}
                      onChange={(e) => setEditedOrgName(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', minWidth: '100px' }}
                    />
                  ) : (
                    org.name
                  )}
                </td>
                <td>
                  {editingOrgId === org.domainId ? (
                    <select value={editedOrgStatus} onChange={(e) => setEditedOrgStatus(e.target.value)}>
                      {possibleStatus.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    org.status
                  )}
                </td>
                <td>
                  {editingOrgId === org.domainId ? (
                    <>
                      <button onClick={handleUpdateOrganization} disabled={isUpdating} className="save-button">
                        {isUpdating ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button onClick={() => setEditingOrgId(null)} className="cancel-button">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditOrganization(org)} className="edit-button">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteOrganization(org.domainId)} className="delete-button">
                        Eliminar
                      </button>
                    </>
                  )}
                  {isDeleting === org.domainId && (
                    <div>
                      <span className="delete-confirmation-text">¿Seguro que quieres eliminar?</span>
                      <button onClick={() => confirmDeleteOrganization(org.domainId)} className="confirm-delete-button">
                        Sí
                      </button>
                      <button onClick={cancelDeleteOrganization} className="cancel-delete-button">
                        No
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrganizationManagementPage;