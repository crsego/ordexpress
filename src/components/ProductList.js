import React from 'react';
import '../App.css'; // Asegúrate de tener los estilos

function ProductList({ loadingProducts, errorProducts, filteredProducts, openAddProductModal }) {
  return (
    <div className="products-grid">
      {loadingProducts ? (
        <p>Cargando productos...</p>
      ) : errorProducts ? (
        <div className="error-message">{errorProducts}</div>
      ) : filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <div key={product.productoId} className="product-item">
            <h3 className="product-title">{product.nombre}</h3>
            <p className="product-price">${product.precio.toLocaleString('es-CO')}</p>
            <button
              onClick={() => openAddProductModal(product)}
              className="ver-detalles-button">
              Agregar
            </button>

          </div>
        ))
      ) : (
        <p>No hay productos disponibles.</p>
      )}
    </div>
  );
}

export default ProductList;
