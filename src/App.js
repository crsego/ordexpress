import React, { useState, useReducer, Suspense, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import DashboardLayout from './pages/DashboardLayout';
import OrderManagementPage from './pages/OrderManagementPage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import TableManagementPage from './pages/TableManagementPage';
import LoginPage from './pages/LoginPage';
import "./App.css";
import logo from "./assets/ordexpress.png";


const Menu = React.lazy(() => import("./components/Menu"));
const CartModal = React.lazy(() => import("./components/Cart"));


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
const products = {
  entrada: [
    { id: 1, name: "Ensalada César", price: 8000, image: require("./assets/images/ensaladaCesar.avif") },
    { id: 2, name: "Empanadas x6", price: 6000, image: require("./assets/images/empanada.jpg") },
    { id: 3, name: "Crema de Tomate", price: 6200, image: require("./assets/images/cremaTomate.jpg") },
    { id: 4, name: "Patacones con hogao x3", price: 7500, image: require("./assets/images/patacones.jpg") },
  ],
  platoFuerte: [
    { id: 5, name: "Pollo Asado", price: 15000, image: require("./assets/images/polloasado.jpg") },
    { id: 6, name: "Pasta Alfredo", price: 12000, image: require("./assets/images/pastaAlfre.jpg") },
    { id: 7, name: "Pasta Bolognesa", price: 12000, image: require("./assets/images/BOLOÑESA.jpg") },
    { id: 8, name: "Churrasco", price: 30000, image: require("./assets/images/churrasco.webp") },
  ],
  bebidas: [
    { id: 9, name: "Jugo de Naranja", price: 4000, image: require("./assets/images/naranja.jpeg") },
    { id: 10, name: "Agua cristal 450ml", price: 3000, image: require("./assets/images/cristal.jpeg") },
  ],
  postres: [
    { id: 11, name: "Milhoja", price: 4000, image: require("./assets/images/miloja.jpeg") },
    { id: 12, name: "Flan", price: 3000, image: require("./assets/images/flan.jpeg") },
    { id: 13, name: "Arroz con leche", price: 3000, image: require("./assets/images/arrozLeche.jpeg") },
  ],
};

// Componente principal
const App = () => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Intenta leer el estado de autenticación de localStorage
    // Esto es una forma simple de persistencia, JWT es más seguro/completo
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Guarda el estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);
  const total = useMemo(() =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const handleLoginSuccess = (userData) => {
    console.log("Login successful in App component", userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
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
          <Menu products={products} cart={cart} dispatch={dispatch} />
        </Suspense>

        <button
          className="open-modal-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Ver Pedido ({formatCurrency(total)})
        </button>
      </>
    );
  };

  return (
    <Router>
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
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardLayout onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="orders" />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="tables" element={<TableManagementPage />} />
          </Route>
          <Route path="/menu" element={<MenuView />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/about" element={<QuienesSomos />} />
        </Routes>

        <Suspense fallback={<div>Cargando carrito...</div>}>
          {isModalOpen && (
            <CartModal
              cart={cart}
              dispatch={dispatch}
              onClose={() => setIsModalOpen(false)}
              total={total}
              formatCurrency={formatCurrency}
            />
          )}
        </Suspense>
      </div>
    </Router>
  );
};

export default App;