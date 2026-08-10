import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../services/productService';
import '../pages/Shop.css';
import './ThreadsOfTravancoreShop.css';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Threads of Travancore products are tagged as sub_category
// "Threads of Travancore" under the "Women's Wear" main category in the admin panel.
const ThreadsOfTravancoreShop = () => {
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchProducts({
          page: pagination.page,
          limit: pagination.limit,
          mainCategory: "Women's Wear",
          category: 'Threads of Travancore'
        });

        setProducts(result.products);
        setPagination((prev) => ({
          ...prev,
          total: result.pagination?.total || result.products.length,
          totalPages: result.pagination?.totalPages || 1
        }));
      } catch (error) {
        console.error('Error loading Threads of Travancore products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [pagination.page, pagination.limit]);

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

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="shop-page tot-shop-page">
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
                Showing {products.length} of {pagination.total} products
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

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    ← Previous
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`pagination-num ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <p>
                No Threads of Travancore products found yet. Add products in the admin panel
                with Main Category "Women's Wear" and Sub Category "Threads of Travancore".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadsOfTravancoreShop;