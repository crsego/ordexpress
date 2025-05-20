<<<<<<< Updated upstream
// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
//import '../styles/RegisterPage.css'; // Si tienes estilos

function RegisterPage({ onRegistrationSuccess }) { // Recibe la prop
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const userData = { nombre, email, password }; // Ajusta según lo que espera tu API

    try {
      const responseData = await registerUser(userData);
      console.log('Registro exitoso:', responseData);
      setLoading(false);
      onRegistrationSuccess(responseData); // Llama a la función de App.js
      // La redirección ahora se maneja en App.js después de actualizar el estado
    } catch (err) {
      console.error('Error al registrar:', err);
      setError(err.message || 'Ocurrió un error al registrar el usuario.');
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-form-card">
        <h2>Registro de Nuevo Usuario</h2>
        <form onSubmit={handleSubmit}>
          {/* Campos del formulario (nombre, email, password) */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-message register-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <p><Link to="/login">¿Ya tienes una cuenta? Iniciar sesión</Link></p>
      </div>
    </div>
  );
}
=======
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🔥 Agregado: useNavigate
import axios from 'axios';
import Notification from '../components/Notification';

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 🔥 Agregado: Inicialización de useNavigate

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [organizationId, setOrganizationId] = useState(null);
  const [isInvitation, setIsInvitation] = useState(false);

  const [notification, setNotification] = useState({ message: '', type: '' });

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
        const decoded = atob(invitation);
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
  
      const response = await axios.post('https://localhost:8080/auth/signin', payload);
  
      // console.log("Registro exitoso, respuesta del backend:", response.data); // 🔥 Línea opcional para depuración
  
      // **INICIO DE LOS CAMBIOS CLAVE EN EL MANEJO DE LA RESPUESTA**
      const userData = response.data; // 🔥 Agregado: Captura la respuesta JSON completa del backend

      if (userData && userData.token) { // 🔥 Modificado: Verificar si se recibió el token
        localStorage.setItem('authToken', userData.token); // 🔥 Agregado: Guardar el token
        localStorage.setItem('userRol', userData.rol); // 🔥 Agregado: Guardar el rol
        localStorage.setItem('organizationId', userData.organizationId); // 🔥 Agregado: Guardar organizationId (será null)
        
        showNotification("Registro exitoso. Redirigiendo para crear organización...", "success"); // 🔥 Modificado el mensaje
  
        setTimeout(() => {
          window.location.href = "/login"; // 🔥 Modificado: Redirigir a la página de creación de organización usando navigate
        }, 2000);
      } else {
            // 🔥 Agregado: Manejo en caso de que el token no se reciba
            console.error("Registro exitoso, pero no se recibió el token esperado.");
            showNotification("Error al registrarse: No se pudo obtener el token de sesión.", "error");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
      // **FIN DE LOS CAMBIOS CLAVE EN EL MANEJO DE LA RESPUESTA**
  
    } catch (error) {
      console.error("Error al registrar:", error);
      // 🔥 Modificado: Mejorar el mensaje de error para mostrar el de la API
      showNotification(error.response?.data?.message || error.response?.data || "Error al registrarse. Intente nuevamente.", "error");
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
            className="inventory-input"
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

        <button onClick={() => navigate('/login')} className="cancel-button" style={{ marginTop: '10px' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
};
>>>>>>> Stashed changes

export default RegisterPage;