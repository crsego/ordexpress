import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth'; // Importa la función desde tu archivo de servicios
import '../styles/LoginPage.css';
import logo from '../assets/ordexpress.png';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (email || password) {
      setError(null);
    }
  }, [email, password]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Por favor, ingresa el correo y la contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await loginUser(email, password);
      console.log('Login successful, user data:', userData);

      // 'userData' ahora debería contener el token que devuelve tu API
      const token = userData.token;

      // Guarda el token en localStorage o en un estado global (como Context API o Redux) para futuras peticiones
      localStorage.setItem('authToken', token); // Ejemplo usando localStorage

      onLoginSuccess(userData); // Pasa los datos del usuario (incluyendo el token) a App.jsx

      //navigate('/admin');

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Ocurrió un error al iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Acceso Administrador</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="error-message login-error">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        {/* Puedes añadir un enlace tipo "¿Olvidaste tu contraseña?" si lo necesitas */}
        {/* <p className="forgot-password"><a href="#">¿Olvidaste tu contraseña?</a></p> */}
      </div>
    </div>
  );
}

export default LoginPage;