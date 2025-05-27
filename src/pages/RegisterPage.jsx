import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Notification from '../components/Notification'; // 🔥 Asegúrate que tengas este componente de notificaciones

const RegisterPage = () => {
  const location = useLocation();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(''); // 🔥 Ahora sí
  const [organizationId, setOrganizationId] = useState(null); // 🔥 Ahora sí
  const [isInvitation, setIsInvitation] = useState(false); // 🔥 Ahora sí

  const [notification, setNotification] = useState({ message: '', type: '' });
  const default_url ="https://ordexpress-api.onrender.com"

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invitation = params.get('invitation');

    if (invitation) {
      try {
        const decoded = atob(invitation); // Decodificar Base64
        const [decodedEmail, decodedRol, decodedOrganizationId] = decoded.split('|');

        setEmail(decodedEmail);
        setRol(decodedRol);
        setOrganizationId(parseInt(decodedOrganizationId));
        setIsInvitation(true);

      } catch (error) {
        console.error("Error decoding invitation:", error);
        showNotification("Error al procesar la invitación.", "error");
      }
    }
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
  
    try {
      const payload = {
        nombre,
        email,
        password,
        rol: rol || 'ADMIN',
        organizationId: organizationId !== null ? organizationId : null
      };
  
      const response = await axios.post(`${default_url}/auth/signin`, payload);
  
      console.log("Registro exitoso:", response.data);
  
      showNotification("Registro exitoso. Redirigiendo al login...", "success");
  
      // Esperar 2 segundos para mostrar notificación, luego redirigir
      setTimeout(() => {
        window.location.href = "/login"; // 🔥 Aquí se redirige
      }, 2000);
  
    } catch (error) {
      console.error("Error al registrar:", error);
      showNotification("Error al registrarse. Intente nuevamente.", "error");
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />

        <h2 style={{ marginBottom: '20px', color: '#d9534f' }}>Registro</h2>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="inventory-input" // Usa tu input bonito
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isInvitation}
            className="inventory-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="inventory-input"
          />

          {/* Campos ocultos si viene invitación */}
          {isInvitation && (
            <>
              <input type="hidden" value={rol} />
              <input type="hidden" value={organizationId} />
            </>
          )}

          <button type="submit" className="save-button">
            Registrarse
          </button>
        </form>

        <button onClick={() => window.location.href = '/login'} className="cancel-button" style={{ marginTop: '10px' }}>
          Cancelar
        </button>
      </div>
    </div>

  );
};

export default RegisterPage;
