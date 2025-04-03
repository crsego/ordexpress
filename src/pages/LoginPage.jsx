import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth'; // Importa la función mock
import '../styles/LoginPage.css'; // Crearemos este archivo para los estilos
// Asume que tienes tu logo en assets
import logo from '../assets/ordexpress.png'; // Ajusta la ruta a tu logo

// Recibe una función 'onLoginSuccess' como prop desde App.jsx
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Limpia el error cuando el usuario empieza a escribir de nuevo
  useEffect(() => {
    if (email || password) {
      setError(null);
    }
  }, [email, password]);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    if (!email || !password) {
      setError('Por favor, ingresa el correo y la contraseña.');
      return;
    }

    setLoading(true);
    setError(null); // Limpia errores previos

    try {
      const userData = await loginUser(email, password);
      console.log('Login successful, user data:', userData);

      // Llama a la función pasada por App.jsx para actualizar el estado de autenticación
      onLoginSuccess(userData); // Pasamos los datos del usuario por si los necesitas

      // Redirige al dashboard principal del admin
      navigate('/admin');

    } catch (err) {
      console.error("Login error:", err);
      // Muestra el mensaje de error de la función mock/API
      setError(err.message || 'Ocurrió un error al iniciar sesión.');
      setLoading(false); // Asegúrate de detener la carga en caso de error
    }
    // No necesitas setLoading(false) en caso de éxito porque la navegación desmontará el componente
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
              disabled={loading} // Deshabilita mientras carga
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
              disabled={loading} // Deshabilita mientras carga
            />
          </div>

          {/* Muestra el mensaje de error si existe */}
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