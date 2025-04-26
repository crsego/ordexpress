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

export default RegisterPage;