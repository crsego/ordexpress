import React, { useState, useReducer } from "react";
import "./App.css";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import logo from "../src/assets/ordexpress.png"

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const itemInCart = state.find((item) => item.id === action.payload.id);
      if (itemInCart) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];

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

// Datos de ejemplo para los productos
const products = {
  entrada: [
    { id: 1, name: "Ensalada César", price: 8000 },
    { id: 2, name: "Empanadas x6", price: 6000 },
    { id: 3, name: "Crema de Tomate", price: 6200 },
    { id: 4, name: "Patacones con hogao x3", price: 7500 },
  ],
  platoFuerte: [
    { id: 5, name: "Pollo Asado", price: 15000 },
    { id: 6, name: "Pasta Alfredo", price: 12000 },
    { id: 7, name: "Pasta Bolognesa", price: 12000 },
    { id: 8, name: "Churrasco", price: 30000 },
  ],
  bebidas: [
    { id: 9, name: "Jugo de Naranja", price: 4000 },
    { id: 10, name: "Agua cristal 450ml", price: 3000 },
  ],
  postres: [
    { id: 11, name: "Milhoja", price: 4000 },
    { id: 12, name: "Flan", price: 3000 },
    { id: 13, name: "Arroz con leche", price: 3000 },
  ],
};

const App = () => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Logo del Restaurante" className="logo" />
      </div>
      <Menu products={products} cart={cart} dispatch={dispatch} />
      <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
        Ver Pedido (${calculateTotal()})
      </button>

      {isModalOpen && (
        <Cart
          cart={cart}
          dispatch={dispatch}
          onClose={() => setIsModalOpen(false)}
          total={calculateTotal()}
        />
      )}
    </div>
  );
};

export default App;