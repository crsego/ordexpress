import React from "react";
import PropTypes from "prop-types";

function ProductList({ addToCart }) {
  const products = [
    { id: 1, name: "Producto 1", price: 10 },
    { id: 2, name: "Producto 2", price: 20 },
  ];

  return (
    <div className="product-list">
      <h2>Lista de Productos</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="product-item">
            {product.name} - ${product.price}
            <button onClick={() => addToCart(product)}>🛒Agregar al carrito</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Validación de props
ProductList.propTypes = {
  addToCart: PropTypes.func.isRequired,
};

export default ProductList;
