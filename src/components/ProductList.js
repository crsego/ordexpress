import React from "react";

const ProductList = ({ products, onAddToCart }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <span>{product.name} - ${product.price}</span>
          <button onClick={() => onAddToCart(product)}>Agregar</button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;