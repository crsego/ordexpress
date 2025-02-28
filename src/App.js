import React, { useState } from "react";
import "./styles/styles.css";
import ProductList from "./components/ProductList.js";
import Cart from "./components/Cart.js";

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // Eliminar producto del carrito
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  return (
    <div className="App">
      {/* Fondo de pantalla */}
      <div className="background-container"></div> 

      {/* Contenido principal */}
      <header className="App-header">
        <h1>🔥 ORDEXPRESS 🔥</h1>
        <ProductList addToCart={addToCart} />
        <button onClick={() => setIsCartOpen(true)}>🛒 Abrir Carrito</button>

        {isCartOpen && (
          <Cart 
            cart={cart} 
            removeFromCart={removeFromCart} 
            closeCart={() => setIsCartOpen(false)} 
          />
        )}
      </header>
    </div>
  );
}

export default App;
