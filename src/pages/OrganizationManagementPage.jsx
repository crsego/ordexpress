import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
function OrganizationManagementPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgStatus, setNewOrgStatus] = useState('Activa'); // Estado por defecto
  const [isCreating, setIsCreating] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [editedOrgName, setEditedOrgName] = useState('');
  const [editedOrgStatus, setEditedOrgStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // ID de la organización a eliminar

  const possibleStatus = ['Activa', 'Inactiva', 'En Mantenimiento'];

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://localhost:8080/api/Organizations');
      setOrganizations(response.data);
    } catch (err) {
      console.error("Error al cargar las organizaciones:", err);
      setError("Error al cargar las organizaciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const newOrg = { name: newOrgName, status: newOrgStatus, mesas: [] }; // Añadir mesas: []
      const response = await axios.post('https://localhost:8080/api/Organizations', newOrg);
      console.log("Organización creada:", response.data);
      fetchOrganizations();
      setNewOrgName('');
    } catch (err) {
      console.error("Error al crear la organización:", err);
      setError("Error al crear la organización.");
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
      const updatedOrg = {
        domainId: editingOrgId,
        name: editedOrgName,
        status: editedOrgStatus,
        mesas: [] // Añadir la propiedad 'mesas' con un array vacío
      };
      await axios.put(`https://localhost:8080/api/Organizations/${editingOrgId}`, updatedOrg);
      console.log("Organización actualizada:", updatedOrg);
      fetchOrganizations();
      setEditingOrgId(null);
    } catch (err) {
      console.error("Error al actualizar la organización:", err);
      setError("Error al actualizar la organización.");
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
      await axios.delete(`https://localhost:8080/api/Organizations/${id}`);
      console.log(`Organización con ID ${id} eliminada.`);
      fetchOrganizations();
    } catch (err) {
      console.error(`Error al eliminar la organización con ID ${id}:`, err);
      setError("Error al eliminar la organización.");
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

      {/* Añadir Nueva Organización */}
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
              {possibleStatus.map(status => (
                <option key={status} value={status}>{status}</option>
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
            {organizations.map(org => (
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
                      {possibleStatus.map(status => (
                        <option key={status} value={status}>{status}</option>
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
                      <button onClick={() => setEditingOrgId(null)} className="cancel-button">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditOrganization(org)} className="edit-button">Editar</button>
                      <button onClick={() => handleDeleteOrganization(org.domainId)} className="delete-button">Eliminar</button>
                    </>
                  )}
                  {isDeleting === org.domainId && (
                    <div>
                      <span className="delete-confirmation-text">¿Seguro que quieres eliminar?</span>
                      <button onClick={() => confirmDeleteOrganization(org.domainId)} className="confirm-delete-button">Sí</button>
                      <button onClick={cancelDeleteOrganization} className="cancel-delete-button">No</button>
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