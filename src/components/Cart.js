import React from "react";

const CartModal = ({ cart, dispatch, onClose, total }) => {
  const handleQuantityChange = (id, quantity) => {
    if (quantity > 0) {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: { id } });
    }
  };

  return (
    <div className="modal-overlay" role="dialog"
      aria-labelledby="modal-title"
      onClick={onClose}>
      <div className="modal" role="document"
        onClick={(e) => e.stopPropagation()} >
        <h2>Tu Pedido</h2>
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              <span>
                {item.name} x{item.quantity} - $
                {(item.price * item.quantity)}
              </span>
              <div>
                <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
              </div>
            </li>
          ))}
        </ul>
        <h3>Total: ${total}</h3>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div >
  );
};

export default CartModal;