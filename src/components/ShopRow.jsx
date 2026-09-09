import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import './ShopRow.css';

// Fisher-Yates shuffle - returns a new shuffled array without mutating the original
const shuffleArray = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const ShopRow = ({ title, subtitle, fetchOptions, viewAllLink, themeClass = '', filterFn, mapFn, maxItems = 7 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchProducts(fetchOptions);
        let list = result.products || [];
        if (filterFn) list = list.filter(filterFn);
        if (mapFn) list = list.map(mapFn);
        if (isMounted) setProducts(shuffleArray(list).slice(0, maxItems));
      } catch (error) {
        console.error('ShopRow fetch error:', error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(fetchOptions), maxItems]);

  return (
    <section className={`shop-row-section ${themeClass}`}>
      <div className="shop-row-heading">
        <h2 className="shop-row-title">{title}</h2>
        {subtitle && <p className="shop-row-subtitle">{subtitle}</p>}
      </div>

      {loading ? (
        <div className="shop-row-loading">
          <div className="shop-row-spinner"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="shop-row-track">
            {products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="shop-row-card">
                <div className="shop-row-image-wrap">
                  <img src={product.image} alt={product.name} className="shop-row-image" />
                </div>
                <h3 className="shop-row-name">{product.name}</h3>
                <p className="shop-row-desc">{product.description || product.category}</p>
                <span className="shop-row-price">{product.price}</span>
              </Link>
            ))}
          </div>
          {viewAllLink && (
            <div className="shop-row-cta">
              <Link to={viewAllLink} className="shop-row-btn">
                <span>View Full Collection</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="shop-row-empty">No products to show yet.</p>
      )}
    </section>
  );
};

export default ShopRow;