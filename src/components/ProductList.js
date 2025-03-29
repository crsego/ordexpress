import React from "react";

const ProductList = ({ products, onAddToCart }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <div key={product.id} className="product-item">
          {/* Contenedor de la imagen */}
          <div className="product-image">
            <img src={product.image} alt={product.name} loading="lazy"
              style={{ aspectRatio: '1/1' }} />
          </div>
          <div className="product-details">
            <span className="product-name">{product.name}</span>
            <span className="product-price">${product.price}</span>
            <button onClick={() => onAddToCart(product)}>Agregar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;