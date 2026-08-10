import React from 'react';
import '../pages/Shop.css';
import './ThreadsOfTravancoreShop.css';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Placeholder product images — using tot9 for all products for now
// (swap individual images per product whenever real photography is ready)
import tot9 from '../images/tot9.png';

// PLACEHOLDER PRODUCTS — update image/name/price here when real catalog is ready.
// id is prefixed "tot-" to keep it distinct from real Kutch product IDs in the cart.
const totProducts = [
  { id: 'tot-2', name: 'Kasavu Drape Saree', price: 4200, image: tot9 },
  { id: 'tot-4', name: 'Ivory Handloom Kurta', price: 2800, image: tot9 },
  { id: 'tot-6', name: 'Golden Border Dupatta', price: 1600, image: tot9 },
  { id: 'tot-7', name: 'Travancore Cotton Blouse', price: 1900, image: tot9 },
  { id: 'tot-8', name: 'Coastal Weave Dress', price: 3400, image: tot9 },
  { id: 'tot-9', name: 'Kasavu Trim Shawl', price: 2100, image: tot9 },
  { id: 'tot-10', name: 'Backwater Linen Set', price: 3800, image: tot9 },
  { id: 'tot-11', name: 'Ceremonial White Drape', price: 4600, image: tot9 },
  { id: 'tot-12', name: 'Handspun Cotton Stole', price: 1400, image: tot9 },
  { id: 'tot-13', name: 'Kerala Kasavu Skirt', price: 3100, image: tot9 }
];

const ThreadsOfTravancoreShop = () => {
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const existingCart = JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    const existingItemIndex = existingCart.findIndex(
      (item) => item.id === product.id && item.size === 'Free Size'
    );

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        priceRaw: product.price,
        image: product.image,
        size: 'Free Size',
        color: 'Natural',
        quantity: 1
      });
    }

    sessionStorage.setItem('cartItems', JSON.stringify(existingCart));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="shop-page tot-shop-page">
      <div className="shop-products">
        <div className="container">
          <h2 className="products-category-title">Threads of Travancore</h2>
          <p className="category-description">
            A Kerala collection in handloom cotton and Kasavu.
          </p>
          <p className="products-count">Showing {totProducts.length} of {totProducts.length} products</p>

          <div className="products-grid">
            {totProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <button
                    className="product-choose-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    <span className="price-label">Regular price</span>
                    <span className="price-value">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadsOfTravancoreShop;