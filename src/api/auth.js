

/**
 * Simula una llamada a la API para autenticar un usuario.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Resuelve con datos del usuario si es exitoso, rechaza con error si falla.
 */
export const loginUser = async (email, password) => {
  console.log(`Attempting login for: ${email}`);
  // Simula un retraso de red
  await new Promise(resolve => setTimeout(resolve, 750));

  // Credenciales de ejemplo (¡NUNCA hagas esto en producción!)
  const validEmail = 'admin@ordexpress.com';
  const validPassword = 'password123';

  if (email.toLowerCase() === validEmail && password === validPassword) {
    console.log('Login successful');
    // Devuelve datos simulados del usuario o un token
    return {
      id: 'admin001',
      name: 'Admin OrdExpress',
      email: validEmail,
      role: 'administrator',
      // En una app real, aquí vendría un token JWT, por ejemplo:
      // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    };
  } else {
    console.log('Login failed: Invalid credentials');
    throw new Error('Correo electrónico o contraseña incorrectos.');
  }
};