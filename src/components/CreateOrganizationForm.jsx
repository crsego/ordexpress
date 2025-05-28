import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/url';

function CreateOrganizationForm({ onOrganizationCreated }) {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const base_url = API_BASE_URL;

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      setError('El nombre de la organización es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${base_url}/api/Organizations`, {
        name: orgName,
        status: "ACTIVE",
        mesas: []
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Organización creada:", response.data);
      const newOrgId = response.data.domainId;

      // Guardar nuevo organizationId en localStorage
      localStorage.setItem('organizationId', newOrgId);

      if (onOrganizationCreated) {
        onOrganizationCreated(newOrgId);
      }
    } catch (err) {
      console.error("Error al crear organización:", err);
      setError("Error al crear la organización.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Crear tu Organización</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        placeholder="Nombre de la organización"
        style={{ padding: '8px', marginRight: '10px', width: '250px' }}
      />
      <button className='save-button' onClick={handleCreateOrganization} disabled={loading}>
        {loading ? 'Creando...' : 'Crear Organización'}
      </button>
    </div>
  );
}

export default CreateOrganizationForm; 
