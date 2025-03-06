import React, { useState, useReducer, Suspense } from "react";
import "./App.css";
import logo from "./assets/ordexpress.png";

// Componentes
const Menu = React.lazy(() => import("./components/Menu"));
const Cart = React.lazy(() => import("./components/Cart"));

const Landing = ({ onStartOrder, onContact, onAbout }) => (
  <div className="landing">
    <button onClick={onStartOrder}>Haz tu pedido</button>
    <button onClick={onContact}>Contactos</button>
    <button onClick={onAbout}>Quienes somos</button>
  </div>
);

const Contactos = () => (
  <div className="contact-view">
    <h2>Contactanos</h2>
    <p>Tel: +57 123 456 789</p>
    <p>Email: info@ordexpress.com</p>
  </div>
);

const QuienesSomos = () => (
  <div className="about-view">
    <h2>Sobre Nosotros</h2>
    <p>Restaurante Ordexpress - Calidad y sabor desde 1995</p>
  </div>
);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const itemInCart = state.find((item) => item.id === action.payload.id);
      return itemInCart
        ? state.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state, { ...action.payload, quantity: 1 }];

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload.id);

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    default:
      return state;
  }
};

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

const App = () => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('landing');

  const calculateTotal = () => 
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {currentView === 'landing' && (
        <Landing 
          onStartOrder={() => setCurrentView('menu')}
          onContact={() => setCurrentView('contactos')}
          onAbout={() => setCurrentView('quienes-somos')}
        />
      )}

      <Suspense fallback={<div>Cargando...</div>}>
        {currentView === 'menu' && (
          <>
            {/* Botón de volver agregado */}
            <button 
              className="back-btn" 
              onClick={() => setCurrentView('landing')}
            >
              ← Volver al menú principal
            </button>
            
           
            
            <Menu products={products} cart={cart} dispatch={dispatch} />
            <button 
              className="open-modal-btn" 
              onClick={() => setIsModalOpen(true)}
            >
              Ver Pedido (${calculateTotal()})
            </button>
          </>
        )}

        {(currentView === 'contactos' || currentView === 'quienes-somos') && (
          <>
            <button 
              className="back-btn" 
              onClick={() => setCurrentView('landing')}
            >
              ← Volver
            </button>
            {currentView === 'contactos' && <Contactos />}
            {currentView === 'quienes-somos' && <QuienesSomos />}
          </>
        )}

        {isModalOpen && (
          <Cart
            cart={cart}
            dispatch={dispatch}
            onClose={() => setIsModalOpen(false)}
            total={calculateTotal()}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;