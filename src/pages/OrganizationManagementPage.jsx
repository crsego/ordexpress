import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function OrganizationManagementPage({ isAuthenticated }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [editedOrgName, setEditedOrgName] = useState('');
  const [editedOrgStatus, setEditedOrgStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const possibleStatus = ['Activo', 'Inactivo', 'Suspendido']; // Valores con 'o' y 'Suspendido'

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const organizationId = localStorage.getItem('organizationId');
    if (!token) {
      console.error("No se encontró el token de autenticación.");
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      window.location.href = '/login';
      return;
    }
    fetchOrganizations(organizationId);
}, [isAuthenticated]);

const fetchOrganizations = async (organizationId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`https://localhost:8080/api/Organizations/${organizationId}/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrganization(response.data);
    } catch (err) {
      console.error("Error al cargar las organizaciones:", err);
      setError("Error al cargar las organizaciones.");
      if (err.response && err.response.status === 401) {
        console.error("Error 401: No autorizado. El token puede ser inválido o expirado.");
        setError("No estás autorizado para ver esta página. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem('authToken');
        window.location.href = '/login';
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


  if (loading) return <p>Cargando organizaciones...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2>Gestión de Organizaciones</h2>

      {organization ? (
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
            <tr key={organization.domainId}>
              <td>{organization.domainId}</td>
              <td>
                {editingOrgId === organization.domainId ? (
                  <input
                    type="text"
                    value={editedOrgName}
                    onChange={(e) => setEditedOrgName(e.target.value)}
                  />
                ) : (
                  organization.name
                )}
              </td>
              <td>
                {editingOrgId === organization.domainId ? (
                  <select value={editedOrgStatus} onChange={(e) => setEditedOrgStatus(e.target.value)}>
                    {possibleStatus.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  organization.status
                )}
              </td>
              <td>
                {editingOrgId === organization.domainId ? (
                  <>
                    <button onClick={handleUpdateOrganization} disabled={isUpdating}>Guardar</button>
                    <button onClick={() => setEditingOrgId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditOrganization(organization)}>Editar</button>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No hay organización configurada.</p>
      )}
    </div>
  );
}

export default OrganizationManagementPage;