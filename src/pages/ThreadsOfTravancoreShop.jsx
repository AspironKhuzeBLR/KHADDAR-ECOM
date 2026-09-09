import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import '../pages/Shop.css';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Threads of Travancore products are identified in the admin panel via the
// "Collection" dropdown, exposed here as product.collection === 'tot'.
// Fisher-Yates shuffle - returns a new shuffled array without mutating the original
const shuffleArray = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const ThreadsOfTravancoreShop = () => {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchProducts({ limit: 200 });
        setAllProducts(shuffleArray(result.products || []));
      } catch (error) {
        console.error('Error loading Threads of Travancore products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const products = allProducts.filter((p) => p.collection === 'tot');

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // don't navigate when the quick Add to Cart button is used
    e.stopPropagation();

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
        price: product.priceRaw,
        priceRaw: product.priceRaw,
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
    <div className="shop-page">
      <div className="shop-products">
        <div className="container">
          <h2 className="products-category-title">Threads of Travancore</h2>
          <p className="category-description">
            A Kerala collection in handloom cotton and Kasavu.
          </p>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading collection...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="products-count">
                Showing {products.length} products
              </p>

              <div className="products-grid">
                {products.map((product, index) => (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id}
                    className="product-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="product-image-wrapper">
                      <img src={product.image} alt={product.name} className="product-image" />
                      {index < 2 && <span className="product-badge">New</span>}
                      {!product.inStock && (
                        <span className="product-badge out-of-stock">Out of Stock</span>
                      )}
                      <button
                        className="product-choose-btn"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        <span className="price-label">Regular price</span>
                        <span className="price-value">{product.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="no-products">
              <p>
                No Threads of Travancore products found yet. In the admin panel, set the
                Collection dropdown to "Threads of Travancore" when adding a product.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadsOfTravancoreShop;