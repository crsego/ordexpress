import React from "react";

function Cart({ cart, removeFromCart, closeCart }) {
  return (
    <div className="cart">
      <h2>🛍️ Carrito de Compras</h2>
      <button onClick={closeCart}>❌ Cerrar</button>
      {cart.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.name} - ${item.price}
              <button onClick={() => removeFromCart(index)}>🗑️ Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;
