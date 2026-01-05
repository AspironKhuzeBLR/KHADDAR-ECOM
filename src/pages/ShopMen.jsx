import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/productService';
import './Shop.css';

const ShopMen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const navigate = useNavigate();

  // Get category from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page')) || 1;
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page }));
  }, [searchParams]);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        const categoriesArray = Array.isArray(data) ? data : (data?.categories || data?.data || []);
        const menCategories = categoriesArray.filter(cat => 
          cat.parent_id === 1 || 
          cat.main_category === "Men's Wear" ||
          cat.id === 29 
        );
        setCategories(menCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Fetch products when category or page changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchProducts({
          page: pagination.page,
          limit: pagination.limit,
          category: selectedCategory,
          mainCategory: "Men's Wear"
        });
        
        setProducts(result.products);
        setPagination(prev => ({
          ...prev,
          total: result.pagination?.total || result.products.length,
          totalPages: result.pagination?.totalPages || 1
        }));
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, pagination.page, pagination.limit]);

  const handleCategoryClick = (categoryId) => {
    const params = new URLSearchParams();
    if (categoryId) {
      params.set('category', categoryId);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCategoryData = categories.find(c => 
    c.id?.toString() === selectedCategory?.toString() || 
    c.name === selectedCategory
  );

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-products">
          <div className="container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-content-wrapper">
        {/* --- SIDEBAR --- */}
        {categories.length > 0 && (
          <aside className="shop-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <ul className="category-list">
              <li>
                <button 
                  className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(null)}
                >
                  All Products
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button 
                    className={`category-btn ${selectedCategory?.toString() === category.id?.toString() ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name || category.sub_category}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* --- MAIN CONTENT AREA (Marquee + Products) --- */}
        <div className="shop-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* --- MARQUEE STRIP (Placed here to be after sidebar) --- */}
          <div className="marquee-strip">
            <div className="marquee-content">
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              {/* Duplicate set for smooth loop */}
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
              <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
              <span>✨ HANDCRAFTED WITH LOVE</span>
            </div>
          </div>

          {/* --- PRODUCTS SECTION --- */}
          <div className="shop-products">
            <div className="container">
              {selectedCategoryData ? (
                <>
                  <h2 className="products-category-title">{selectedCategoryData.name || selectedCategoryData.sub_category}</h2>
                  {selectedCategoryData.description && (
                    <p className="category-description">{selectedCategoryData.description}</p>
                  )}
                </>
              ) : (
                <h2 className="products-category-title">Men's Wear</h2>
              )}

              <p className="products-count">
                Showing {products.length} of {pagination.total} products
              </p>

              {products.length > 0 ? (
                <>
                  <div className="products-grid">
                    {products.map((product, index) => (
                      <div 
                        key={product.id} 
                        className="product-card"
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="product-image-wrapper">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="product-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x500?text=No+Image';
                            }}
                          />
                          {index < 2 && <span className="product-badge">New</span>}
                          {!product.inStock && <span className="product-badge out-of-stock">Out of Stock</span>}
                          <button 
                            className="product-choose-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${product.id}`);
                            }}
                          >
                            Choose options
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
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
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
                  <p>No products found in this category.</p>
                  <button 
                    className="btn-view-all"
                    onClick={() => handleCategoryClick(null)}
                  >
                    View All Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopMen;