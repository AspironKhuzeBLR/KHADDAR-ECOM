import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProductDetail } from '../services/productService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { productSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const sizeDropdownRef = useRef(null);
  const [sizeMode, setSizeMode] = useState('standard'); // 'standard' or 'custom'
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [personalNote, setPersonalNote] = useState('');
  const [measurements, setMeasurements] = useState({
    bust: '', waist: '', hips: '', shoulder: '', chest: ''
  });
  const [measurementUnit, setMeasurementUnit] = useState('in');
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const unitDropdownRef = useRef(null);
  const [selectedPiece, setSelectedPiece] = useState('full-set');
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
        const pieceParam = searchParams.get('piece');
        if (pieceParam && data?.pieces?.some(p => p.label === pieceParam)) {
          setSelectedPiece(pieceParam);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productSlug, toast, searchParams]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target)) {
        setSizeDropdownOpen(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target)) {
        setUnitDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

  if (!product || product.isLive === false) {
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

    // Returns the measurement fields for a single garment "type" label
  // (a piece's own label, e.g. "Skirts", or a plain product's own category)
  const getFieldsForType = (categoryLabel, isMen) => {
    const isBottomWear = categoryLabel === 'Trousers' || categoryLabel === 'Skirts' || categoryLabel === 'Skirts/Trousers';
    if (isBottomWear) {
      return isMen
        ? [{ key: 'waist', label: 'Waist' }]
        : [{ key: 'waist', label: 'Waist' }, { key: 'hips', label: 'Hips' }];
    }
    // "tops-like" - closest match default for Blouses, Dresses, Corsets, Co-ords, Kurtas, Blazers/Jackets
    return isMen
      ? [{ key: 'shoulder', label: 'Shoulder' }, { key: 'chest', label: 'Chest' }]
      : [{ key: 'bust', label: 'Bust' }, { key: 'shoulder', label: 'Shoulder' }];
  };

  // Which measurement fields to show. If a specific piece is selected (not the
  // full set), base it on that piece's own type. If Full Set is selected and
  // the product is made of multiple pieces (e.g. a top + a bottom), combine
  // the field types needed across ALL of them (deduplicated) - a full set
  // needs measurements for every part it includes, not just one.
  const getRelevantMeasurementFields = () => {
    const isMen = product.mainCategory === "Men's Wear";

    if (selectedPiece !== 'full-set') {
      return getFieldsForType(selectedPiece, isMen);
    }

    if (product.pieces && product.pieces.length > 0) {
      const allFields = product.pieces.flatMap(p => getFieldsForType(p.label, isMen));
      const seen = new Set();
      const deduped = [];
      allFields.forEach((f) => {
        if (!seen.has(f.key)) {
          seen.add(f.key);
          deduped.push(f);
        }
      });
      return deduped;
    }

    // No pieces at all (a regular, non-set product) - use its own category
    return getFieldsForType(product.category, isMen);
  };
  const relevantMeasurementFields = getRelevantMeasurementFields();

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

  // Compute the effective name/price based on whether the customer picked
  // the full set or an individual piece (only relevant if product.pieces exists)
  const getSelectedPurchaseInfo = () => {
    const basePrice = typeof product.price === 'object' ? product.price.value : product.price;
    if (!product.pieces || product.pieces.length === 0 || selectedPiece === 'full-set') {
      return {
        name: product.name,
        price: product.fullSetPrice || product.priceRaw || basePrice,
        priceRaw: product.fullSetPrice || product.priceRaw
      };
    }
    const piece = product.pieces.find(p => p.label === selectedPiece);
    if (!piece) {
      return { name: product.name, price: basePrice, priceRaw: product.priceRaw };
    }
    return {
      name: `${product.name} - ${piece.label}`,
      price: piece.price,
      priceRaw: piece.price
    };
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    if (sizeMode === 'standard' && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (sizeMode === 'custom' && !relevantMeasurementFields.some(f => measurements[f.key])) {
      toast.error('Please enter your measurements');
      return;
    }
    
    const effectiveSize = sizeMode === 'standard' ? selectedSize : 'Custom Measurements';
    const purchaseInfo = getSelectedPurchaseInfo();
    const existingCart = JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    const existingItemIndex = existingCart.findIndex(
      item => item.id === product.id && item.size === effectiveSize && item.color === selectedColor
        && item.piece === selectedPiece
        && item.note === personalNote
        && JSON.stringify(item.measurements || {}) === JSON.stringify(measurements)
    );
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        name: purchaseInfo.name,
        price: purchaseInfo.price,
        priceRaw: purchaseInfo.priceRaw,
        piece: selectedPiece,
        image: product.image || product.images?.[0],
        size: effectiveSize,
        color: selectedColor || 'Default',
        quantity: quantity,
        note: personalNote || '',
        measurements: sizeMode === 'custom' && Object.values(measurements).some(v => v) ? { ...measurements, unit: measurementUnit } : null
      });
    }
    
    sessionStorage.setItem('cartItems', JSON.stringify(existingCart));
    toast.success(`${purchaseInfo.name} added to cart!`);
    setPersonalNote('');
    setMeasurements({ bust: '', waist: '', hips: '', shoulder: '', chest: '' });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed');
      navigate('/login');
      return;
    }
    
    if (sizeMode === 'standard' && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (sizeMode === 'custom' && !relevantMeasurementFields.some(f => measurements[f.key])) {
      toast.error('Please enter your measurements');
      return;
    }
    
    const effectiveSizeForBuyNow = sizeMode === 'standard' ? selectedSize : 'Custom Measurements';
    const purchaseInfo = getSelectedPurchaseInfo();
    const cartItem = {
      id: product.id,
      name: purchaseInfo.name,
      price: purchaseInfo.price,
      priceRaw: purchaseInfo.priceRaw,
      piece: selectedPiece,
      image: product.image || product.images?.[0],
      size: effectiveSizeForBuyNow,
      color: selectedColor || 'Default',
      quantity: quantity,
      note: personalNote || '',
      measurements: sizeMode === 'custom' && Object.values(measurements).some(v => v) ? { ...measurements, unit: measurementUnit } : null
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
                <span className="price-label">
                  {product.pieces?.length > 0 && selectedPiece !== 'full-set' ? 'Piece price' : 'Regular price'}
                </span>
                <span className="regular-price">
                  {(() => {
                    if (!product.pieces || product.pieces.length === 0) {
                      return typeof product.price === 'object' ? product.price.value : product.price;
                    }
                    if (selectedPiece === 'full-set') {
                      return `₹${(product.fullSetPrice || product.priceRaw || 0).toLocaleString('en-IN')}`;
                    }
                    const piece = product.pieces.find(p => p.label === selectedPiece);
                    return piece ? `₹${piece.price.toLocaleString('en-IN')}` : '';
                  })()}
                </span>
              </div>
            </div>

            <div className="product-options">
              {product.pieces?.length > 0 && (
                <div className="option-group">
                  <label className="option-label">What would you like to order?</label>
                  <div className="piece-options">
                    <label className="piece-option">
                      <input
                        type="radio"
                        name="piece-select"
                        checked={selectedPiece === 'full-set'}
                        onChange={() => setSelectedPiece('full-set')}
                      />
                      <span>Full Set — ₹{(product.fullSetPrice || product.priceRaw || 0).toLocaleString('en-IN')}</span>
                    </label>
                    {product.pieces.map((piece) => (
                      <label className="piece-option" key={piece.label}>
                        <input
                          type="radio"
                          name="piece-select"
                          checked={selectedPiece === piece.label}
                          onChange={() => setSelectedPiece(piece.label)}
                        />
                        <span>{piece.label} — ₹{piece.price.toLocaleString('en-IN')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

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
                <label className="option-label">Fit</label>
                <div className="piece-options">
                  <label className="piece-option">
                    <input
                      type="radio"
                      name="size-mode"
                      checked={sizeMode === 'standard'}
                      onChange={() => setSizeMode('standard')}
                    />
                    <span>Standard Size</span>
                  </label>
                  <label className="piece-option">
                    <input
                      type="radio"
                      name="size-mode"
                      checked={sizeMode === 'custom'}
                      onChange={() => setSizeMode('custom')}
                    />
                    <span>Custom Measurements</span>
                  </label>
                </div>
              </div>

              {sizeMode === 'standard' && (
                <div className="option-group">
                  <label className="option-label">Size</label>
                  <div className="custom-select" ref={sizeDropdownRef}>
                    <button
                      type="button"
                      className="custom-select-trigger"
                      onClick={() => setSizeDropdownOpen((prev) => !prev)}
                    >
                      <span>{selectedSize || 'Select Size'}</span>
                      <svg className={`custom-select-arrow ${sizeDropdownOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {sizeDropdownOpen && (
                      <div className="custom-select-list">
                        {product.sizes?.map((item, idx) => {
                          const val = typeof item === 'object' ? item.size : item;
                          return (
                            <button
                              type="button"
                              key={idx}
                              className={`custom-select-option ${selectedSize === val ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedSize(val);
                                setSizeDropdownOpen(false);
                              }}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="quantity-group">
                <label className="option-label">Quantity</label>
                <div className="quantity-controls">
                  <button className="quantity-btn decrease" onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}>-</button>
                  <span className="quantity-value">{quantity} in cart</span>
                  <button className="quantity-btn increase" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>

              {sizeMode === 'custom' && (
                <div className="option-group personalize-group">
                  <div className="measurements-header">
                    <label className="option-label">Your Measurements</label>
                    <div className="custom-select custom-select-small" ref={unitDropdownRef}>
                      <button
                        type="button"
                        className="custom-select-trigger"
                        onClick={() => setUnitDropdownOpen((prev) => !prev)}
                      >
                        <span>{measurementUnit === 'cm' ? 'Centimeters (cm)' : 'Inches (in)'}</span>
                        <svg className={`custom-select-arrow ${unitDropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {unitDropdownOpen && (
                        <div className="custom-select-list">
                          <button
                            type="button"
                            className={`custom-select-option ${measurementUnit === 'in' ? 'active' : ''}`}
                            onClick={() => { setMeasurementUnit('in'); setUnitDropdownOpen(false); }}
                          >
                            Inches (in)
                          </button>
                          <button
                            type="button"
                            className={`custom-select-option ${measurementUnit === 'cm' ? 'active' : ''}`}
                            onClick={() => { setMeasurementUnit('cm'); setUnitDropdownOpen(false); }}
                          >
                            Centimeters (cm)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="personalize-hint">
                    Enter your measurements below and we'll tailor this piece to fit.
                  </p>
                  <div className="measurements-row">
                    {relevantMeasurementFields.map((field) => (
                      <div className="measurement-field" key={field.key}>
                        <label>{field.label}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder={measurementUnit}
                          value={measurements[field.key]}
                          onChange={(e) => setMeasurements({ ...measurements, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="option-group personalize-group">
                <label className="option-label">Personalized Note (optional)</label>
                <textarea
                  className="personalize-note-input"
                  placeholder="Any special instructions for this order? (e.g. gift message, styling request)"
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={3}
                  maxLength={300}
                />
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