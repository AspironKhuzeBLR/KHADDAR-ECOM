import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductDetail } from '../services/productService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchProductDetail(productSlug);
        setProduct(data);
        
        if (data?.sizes?.length > 0) {
          const firstSize = data.sizes[0];
          setSelectedSize(typeof firstSize === 'object' ? firstSize.size : firstSize);
        }
        if (data?.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productSlug, toast]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-not-found">
            <h2>Product not found</h2>
            <Link to="/" className="back-link">Return to home</Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbPath = product.gender === 'men' 
    ? `/shop/mens-wear?category=${product.category}`
    : `/shop/womens-wear?category=${product.category}`;

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    const existingCart = JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    const existingItemIndex = existingCart.findIndex(
      item => item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: typeof product.price === 'object' ? product.price.value : product.price,
        priceRaw: product.priceRaw,
        image: product.image || product.images?.[0],
        size: selectedSize,
        color: selectedColor || 'Default',
        quantity: quantity
      });
    }
    
    sessionStorage.setItem('cartItems', JSON.stringify(existingCart));
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed');
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'object' ? product.price.value : product.price,
      priceRaw: product.priceRaw,
      image: product.image || product.images?.[0],
      size: selectedSize,
      color: selectedColor || 'Default',
      quantity: quantity
    };
    
    sessionStorage.setItem('cartItems', JSON.stringify([cartItem]));
    navigate('/checkout');
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={breadcrumbPath}>{product.gender === 'men' ? "Men's Wear" : "Women's Wear"}</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail-container">
          <div className="product-images">
            <div className="main-image-wrapper">
              <div 
                className={`main-image-container ${isZoomed ? 'zoomed' : ''}`}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <img 
                  src={product.images && product.images[selectedImageIndex]} 
                  alt={product.name}
                  className="main-product-image"
                  style={isZoomed ? {
                    transform: `scale(2)`,
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  } : {}}
                />
                {!isZoomed && (
                  <div className="zoom-hint">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    Click to zoom
                  </div>
                )}
              </div>
              {product.images?.length > 1 && !isZoomed && (
                <>
                  <button className="image-nav-btn prev-btn" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button className="image-nav-btn next-btn" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(prev => (prev + 1) % product.images.length);
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                  <div className="image-counter">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-price-section">
              <div className="price-row">
                <span className="price-label">Regular price</span>
                <span className="regular-price">
                  {typeof product.price === 'object' ? product.price.value : product.price}
                </span>
              </div>
            </div>

            <div className="product-options">
              {/* Color Selection Logic */}
              <div className="option-group">
                <label className="option-label">Color</label>
                <div className="color-options">
                  {product.colors?.map((color, idx) => (
                    <button 
                      key={idx}
                      className={`color-pill ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="option-label">Size</label>
                <select
                  className="option-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">Select Size</option>
                  {product.sizes?.map((item, idx) => {
                    const val = typeof item === 'object' ? item.size : item;
                    return <option key={idx} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              <div className="quantity-group">
                <label className="option-label">Quantity</label>
                <div className="quantity-controls">
                  <button className="quantity-btn decrease" onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}>-</button>
                  <span className="quantity-value">{quantity} in cart</span>
                  <button className="quantity-btn increase" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="product-actions">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>Add To Cart</button>
              <button className="buy-now-btn" onClick={handleBuyNow}>Buy Now</button>
            </div>

            <div className="product-tabs">
              <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
              <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
              <button className={`tab-btn ${activeTab === 'size' ? 'active' : ''}`} onClick={() => setActiveTab('size')}>Size Chart</button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && <div className="tab-panel"><p>{product.description}</p></div>}
              {activeTab === 'details' && <div className="tab-panel"><p>{product.details}</p><p>{product.care}</p></div>}
              {activeTab === 'size' && product.sizeChart && (
                <div className="tab-panel">
                    {product.sizeChart.top && (
                        <table className="size-table">
                            <thead>
                              <tr>
                                <th>Size</th>
                                <th>Chest (in)</th>
                                <th>Waist (in)</th>
                              </tr>
                            </thead>
                            <tbody>
                                {product.sizeChart.top.map((row, i) => (
                                    <tr key={i}>
                                      <td>{row.size}</td>
                                      <td>{row.chest}</td>
                                      <td>{row.waist}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;