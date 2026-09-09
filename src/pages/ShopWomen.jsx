import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, expandProductsWithPieces } from '../services/productService';
import './Shop.css';

const ShopWomen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // full unfiltered, expanded (includes piece cards)
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Get category/page from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    setSelectedCategory(category);
    setPage(pageFromUrl);
  }, [searchParams]);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        const categoriesArray = Array.isArray(data) ? data : (data?.categories || data?.data || []);
        // Filter for women's sub-categories (parent_id: 4 is Women's Wear)
        const womenCategories = categoriesArray.filter(cat => 
          cat.parent_id === 4 || 
           cat.id === 17 ||  
          (cat.type === 'sub' && cat.parent_id === 4) ||
          cat.main_category === "Women's Wear"
        );
        setCategories(womenCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Fetch ALL Women's Wear products once (unfiltered by sub-category), expanded
  // with piece cards. Category filtering and pagination both happen client-side
  // below, since a piece's effective category (e.g. "Trousers") can differ from
  // its parent product's own category (e.g. "Co-ords"), so the backend alone
  // can't filter correctly once pieces are involved.
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchProducts({
          page: 1,
          limit: 200,
          mainCategory: "Women's Wear"
        });
        setAllProducts(expandProductsWithPieces(result.products));
      } catch (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const selectedCategoryData = categories.find(c => 
    c.id?.toString() === selectedCategory?.toString() || 
    c.name === selectedCategory
  );

  // Client-side filter: match by category name (works for both real products,
  // whose `category` is their real sub-category, and virtual piece cards,
  // whose `category` was set to the piece's own label)
  const filteredProducts = selectedCategoryData
    ? allProducts.filter(p => p.category === (selectedCategoryData.name || selectedCategoryData.sub_category))
    : allProducts;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const products = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                <h2 className="products-category-title">Women's Wear</h2>
              )}

              <p className="products-count">
                Showing {products.length} of {filteredProducts.length} products
              </p>

              {products.length > 0 ? (
                <>
                  <div className="products-grid">
                    {products.map((product, index) => (
                      <div 
                        key={product.virtualId || product.id} 
                        className="product-card"
                        onClick={() => navigate(product.isPieceVariant ? `/product/${product.id}?piece=${encodeURIComponent(product.pieceLabel)}` : `/product/${product.id}`)}
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
                              navigate(product.isPieceVariant ? `/product/${product.id}?piece=${encodeURIComponent(product.pieceLabel)}` : `/product/${product.id}`);
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

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        disabled={page <= 1}
                        onClick={() => handlePageChange(page - 1)}
                      >
                        ← Previous
                      </button>
                      
                      <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                          <button
                            key={pageNum}
                            className={`pagination-num ${page === pageNum ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button 
                        className="pagination-btn"
                        disabled={page >= totalPages}
                        onClick={() => handlePageChange(page + 1)}
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

export default ShopWomen;