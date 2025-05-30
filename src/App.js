// src/App.js
import React, { useState, useReducer, Suspense, useMemo, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"; // ¡Importaciones actualizadas!
import DashboardLayout from './pages/DashboardLayout';
import OrderManagementPage from './pages/OrderManagementPage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import TableManagementPage from './pages/TableManagementPage';
import OrganizationManagementPage from './pages/OrganizationManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Importa el componente RegisterPage
import "./App.css";
import logo from "./assets/ordexpress.png";

const Menu = React.lazy(() => import("./components/Menu"));
const CartModal = React.lazy(() => import("./components/CartModal"));

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Componentes de vistas
const Landing = () => (
  <div className="landing">
    <Link to="/menu"><button>Haz tu pedido</button></Link>
    <Link to="/contactos"><button>Contactos</button></Link>
    <Link to="/about"><button>Quienes somos</button></Link>
    <Link to="/register"><button>Registrarse</button></Link> {/* Nuevo enlace para registrarse */}
  </div>
);

const Contactos = () => (
  <>
    <button className="back-btn" onClick={() => window.history.back()}>
      ← Volver al menú principal
    </button>
    <div className="contact-view">
      <h2>Contactanos</h2>
      <p>Tel: +57 123 456 789</p>
      <p>Email: info@ordexpress.com</p>
    </div>
  </>
);

const QuienesSomos = () => (
  <>
    <button className="back-btn" onClick={() => window.history.back()}>
      ← Volver al menú principal
    </button>
    <div className="about-view">
      <h2>Sobre Nosotros</h2>
      <p>Restaurante Ordexpress - Calidad y sabor desde 1995</p>
    </div>
  </>
);

// Reducer del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const itemInCart = state.find(item => item.id === action.payload.id);
      return itemInCart
        ? state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        : [...state, { ...action.payload, quantity: 1 }];

    case "REMOVE_ITEM":
      return state.filter(item => item.id !== action.payload.id);

    case "UPDATE_QUANTITY":
      return action.payload.quantity > 0
        ? state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        : state.filter(item => item.id !== action.payload.id);

    default:
      return state;
  }
};

// Datos de productos
//const products = {
//entrada: [
//{ id: 1, name: "Ensalada César", price: 8000, image: require("./assets/images/ensaladaCesar.avif") },
//{ id: 2, name: "Empanadas x6", price: 6000, image: require("./assets/images/empanada.jpg") },
//{ id: 3, name: "Crema de Tomate", price: 6200, image: require("./assets/images/cremaTomate.jpg") },
//{ id: 4, name: "Patacones con hogao x3", price: 7500, image: require("./assets/images/patacones.jpg") },
//],
//platoFuerte: [
//{ id: 5, name: "Pollo Asado", price: 15000, image: require("./assets/images/polloasado.jpg") },
//{ id: 6, name: "Pasta Alfredo", price: 12000, image: require("./assets/images/pastaAlfre.jpg") },
//{ id: 7, name: "Pasta Bolognesa", price: 12000, image: require("./assets/images/BOLOÑESA.jpg") },
//{ id: 8, name: "Churrasco", price: 30000, image: require("./assets/images/churrasco.webp") },
//],
//bebidas: [
//{ id: 9, name: "Jugo de Naranja", price: 4000, image: require("./assets/images/naranja.jpeg") },
//{ id: 10, name: "Agua cristal 450ml", price: 3000, image: require("./assets/images/cristal.jpeg") },
//],
//postres: [
//{ id: 11, name: "Milhoja", price: 4000, image: require("./assets/images/miloja.jpeg") },
//{ id: 12, name: "Flan", price: 3000, image: require("./assets/images/flan.jpeg") },
//{ id: 13, name: "Arroz con leche", price: 3000, image: require("./assets/images/arrozLeche.jpeg") },
//],
//};

// Componente principal
const App = () => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authToken') ? true : false;
  });
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const navigate = useNavigate(); // Ahora 'navigate' funcionará correctamente

  useEffect(() => {
    localStorage.setItem('authToken', authToken || '');
  }, [authToken]);

  const total = useMemo(() =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const handleLoginSuccess = (userData) => {
    console.log("Login successful in App component", userData);
    setIsAuthenticated(true);
    setAuthToken(userData.token);
  };

  const handleRegistrationSuccess = (userData) => {
    console.log("Registro exitoso en App component", userData);
    setIsAuthenticated(true); // ¡Actualiza el estado de autenticación!
    setAuthToken(userData.token); // Guarda el token si tu backend lo devuelve en el registro
    navigate('/admin/organizations'); // Redirige directamente aquí
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  function ProtectedRoute({ isAuthenticated, children }) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  const MenuView = () => {
    return (
      <>
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Volver al menú principal
        </button>

        <Suspense fallback={<div>Cargando menú...</div>}>
          <Menu cart={cart} dispatch={dispatch} />
        </Suspense>
      </>
    );
  };

  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route path="/register" element={<RegisterPage onRegistrationSuccess={handleRegistrationSuccess} />} /> {/* Pasa la prop */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout onLogout={handleLogout} authToken={authToken} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="orders" />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="inventory" element={<InventoryManagementPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="organizations" element={<OrganizationManagementPage isAuthenticated={isAuthenticated} />} />
        </Route>
        <Route path="/menu" element={<MenuView />} />
        <Route path="/contactos" element={<Contactos />} />
        <Route path="/about" element={<QuienesSomos />} />
      </Routes>

      
    </div>
  );
};

export default App;