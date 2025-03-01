import React, { useState } from "react";
import ProductList from "./ProductList";

const Menu = ({ products, cart, dispatch }) => {
  const [category, setCategory] = useState("entrada");

  const handleAddToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  return (
    <div className="menu">
      <div className="categories">
        <button onClick={() => setCategory("entrada")}>Entrada</button>
        <button onClick={() => setCategory("platoFuerte")}>Plato Fuerte</button>
        <button onClick={() => setCategory("bebidas")}>Bebidas</button>
        <button onClick={() => setCategory("postres")}>Postres</button>
      </div>
      <ProductList
        products={products[category]}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Menu;