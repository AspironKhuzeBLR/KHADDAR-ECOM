import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../services/productService';
import '../pages/Shop.css';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Threads of Travancore products are identified by a naming convention:
// name it "ToT - <Product Name>" in the admin panel (e.g. "ToT - Vennila").
// Real garment type (Dresses, Kurtas, etc.) still goes in Sub Category as normal -
// this only distinguishes which COLLECTION the product belongs to.
const TOT_PREFIX = /^tot\s*-\s*/i;

const ThreadsOfTravancoreShop = () => {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Fetch a broad set of Women's Wear products, then filter by name prefix client-side
        const result = await fetchProducts({
          limit: 200
        });
        setAllProducts(result.products || []);
      } catch (error) {
        console.error('Error loading Threads of Travancore products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Only products named "ToT - ..." belong to this collection.
  // Strip the prefix so the displayed name is clean.
  const products = allProducts
    .filter((p) => TOT_PREFIX.test(p.name))
    .map((p) => ({ ...p, name: p.name.replace(TOT_PREFIX, '').trim() }));

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
                  <div key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      <img src={product.image} alt={product.name} className="product-image" />
                      {index < 2 && <span className="product-badge">New</span>}
                      {!product.inStock && (
                        <span className="product-badge out-of-stock">Out of Stock</span>
                      )}
                      <button
                        className="product-choose-btn"
                        onClick={() => handleAddToCart(product)}
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
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-products">
              <p>
                No Threads of Travancore products found yet. In the admin panel, name products
                starting with "ToT - " (e.g. "ToT - Vennila") and set Main Category to "Women's Wear".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadsOfTravancoreShop;