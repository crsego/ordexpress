// src/api/auth.js
import axios from 'axios';
import { API_BASE_URL } from './url';

const base_url = API_BASE_URL; // ¡REEMPLAZA CON LA URL BASE DE TU API!

/**
 * Llama a la API para autenticar un usuario.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Resuelve con los datos de la respuesta de la API (incluyendo el token) si es exitoso,
 * rechaza con un error si falla.
 */
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email,
      password: password,
    });

    // La respuesta exitosa de tu API (AuthController.Login) devuelve un objeto con un 'token'
    return response.data; // Devuelve los datos de la respuesta (incluyendo el token)
  } catch (error) {
    // Maneja los errores de la petición
    let errorMessage = 'Ocurrió un error al iniciar sesión.';
    if (error.response && error.response.data) {
      errorMessage = error.response.data; // Muestra el mensaje de error del backend (e.g., "Credenciales inválidas")
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor.';
    }
    throw new Error(errorMessage); // Lanza el error para que lo capture el componente LoginPage
  }
};

/**
 * Llama a la API para registrar un nuevo usuario.
 * @param {object} userData - Objeto con los datos del nuevo usuario (nombre, email, password, rol, organizationId).
 * @returns {Promise<object>} Resuelve con los datos de la respuesta de la API si el registro es exitoso,
 * rechaza con un error si falla.
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, userData);
    return response.data; // Devuelve los datos del usuario registrado
  } catch (error) {
    let errorMessage = 'Ocurrió un error al registrar el usuario.';
    if (error.response && error.response.data) {
      errorMessage = error.response.data;
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor.';
    }
    throw new Error(errorMessage);
  }
};