import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [rolesList, setRolesList] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const default_url ="https://ordexpress-api.onrender.com"


  

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
    fetchOrganization();
    fetchRoles();
}, [isAuthenticated]);

const fetchOrganization = async () => {
  setLoading(true);
  setError(null);

  const organizationId = localStorage.getItem('organizationId');

  if (!organizationId) {
    setError("No se encontró organizationId en localStorage.");
    setLoading(false);
    return;
  }

  try {
    const token = localStorage.getItem('authToken');

    const response = await axios.post(
      `${default_url}/api/Organizations/info`,
      { domainId: parseInt(organizationId) }, // 🔥 Envía el organizationId tomado del localStorage
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setOrganization(response.data);
  } catch (err) {
    console.error("Error al cargar la organización:", err);
    setError("Error al cargar la organización.");
  } finally {
    setLoading(false);
  }
};

  const showNotification = (message, type) => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000); // La notificación desaparece sola en 3 segundos
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('authToken');
  
      const response = await axios.get(
        `${default_url}/api/Metadata/roles`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      setRolesList(response.data); // Aquí guardamos el array de roles
    } catch (error) {
      console.error("Error al cargar roles:", error);
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
      await axios.put(`${default_url}/api/Organizations/${editingOrgId}`, updatedOrg, {
        headers: {
          Authorization: `Bearer ${token}`, // Usa el token obtenido justo antes de la petición
        },
      });
      console.log("Organización actualizada:", updatedOrg);
      fetchOrganization();
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

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) {
      showNotification("Por favor complete todos los campos.", "error");
      return;
    }
  
    const organizationId = localStorage.getItem('organizationId');
    if (!organizationId) {
      showNotification("No se encontró organizationId.", "error");
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
  
      await axios.post(
        `${default_url}/api/Usuarios/invitar`,
        {
          email: inviteEmail,
          rol: inviteRole,
          organizationId: parseInt(organizationId)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      showNotification("Usuario invitado exitosamente.", "success");
  
      setInviteEmail('');
      setInviteRole('');
      setShowInviteModal(false);
  
    } catch (error) {
      console.error("Error al invitar usuario:", error);
      showNotification("Error al enviar la invitación.", "error");
    }
  };
  
  

  if (loading) return <p>Cargando organizaciones...</p>;
  if (error) return <div className="error-message">{error}</div>;

  return (

    
    
    <div className="organization-page">

    <h2>{organization.name}</h2>
    <p><strong>Estado:</strong> {organization.status}</p>

    <h3>Usuarios de la Organización</h3>
    <button className='edit-button' onClick={() => setShowInviteModal(true)}>Invitar Usuario</button>

    <Notification
      message={notification.message}
      type={notification.type}
      onClose={() => setNotification({ message: '', type: '' })}
    />


    {organization && organization.usuarios && organization.usuarios.length > 0 ? (
      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {organization.usuarios.map((usuario, index) => (
            <tr key={index}>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
    <p>No hay usuarios en la organización.</p>
  )}

  <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)}>
    <div>
      <h3>Invitar Usuario</h3>

      <input
        type="email"
        placeholder="Correo del Usuario"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
        style={{ marginBottom: '10px', width: '100%' }}
      />

      <select
        value={inviteRole}
        onChange={(e) => setInviteRole(e.target.value)}
        style={{ marginBottom: '10px', width: '100%' }}
      >
        <option value="">Seleccione Rol</option>
        {rolesList.map((rol) => (
          <option key={rol.value} value={rol.value}>
            {rol.label}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleInviteUser} className="save-button" style={{ marginRight: '10px' }}>
          Enviar Invitación
        </button>
        <button onClick={() => setShowInviteModal(false)} className="cancel-button">
          Cancelar
        </button>
      </div>
    </div>
  </Modal>

</div>

  );
}

export default OrganizationManagementPage;