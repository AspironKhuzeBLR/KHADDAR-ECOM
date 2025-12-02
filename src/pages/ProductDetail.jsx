import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductDetail } from '../services/productService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

// Legacy product database - kept for backward compatibility
// All data now comes from productService
const productDatabase = {
  // Men's products
  'mens-wear-1': {
    id: 1,
    name: 'Classic White Shirt',
    category: 'shirts',
    gender: 'men',
    price: '₹2,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1624378515199-9a1fd46859f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Beige'],
    description: 'A classic white shirt crafted with premium sustainable fabrics for timeless elegance. Perfect for both formal and casual occasions.',
    details: 'Organic Cotton and Handwoven Fabric',
    care: 'Hand wash with mild detergent. Dry inside out in shade to prevent lightening.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
        { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
        { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
        { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
      ]
    }
  },
  'mens-wear-2': {
    id: 2,
    name: 'Linen Trousers',
    category: 'trousers',
    gender: 'men',
    price: '₹3,200',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1624378515199-9a1fd46859f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Beige', 'Black'],
    description: 'Tailored linen trousers in sustainable fabrics, perfect for both formal and casual occasions. Comfortable and stylish.',
    details: 'Organic Linen and Natural Dyes',
    care: 'Hand wash with mild detergent. Dry flat in shade.',
    sizeChart: {
      bottom: [
        { size: 'XS', waist: '30', hips: '38', length: '39' },
        { size: 'S', waist: '32', hips: '40', length: '40' },
        { size: 'M', waist: '34', hips: '42', length: '41' },
        { size: 'L', waist: '36', hips: '44', length: '42' }
      ]
    }
  },
  // Women's products
  'womens-wear-1': {
    id: 1,
    name: 'Embroidered Blouse',
    category: 'blouses',
    gender: 'women',
    price: '₹2,800',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['White', 'Ivory', 'Beige'],
    description: 'Elegant blouse with intricate embroidery details, crafted from premium sustainable fabrics. Perfect for special occasions.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  },
  'womens-wear-2': {
    id: 2,
    name: 'Linen Skirt',
    category: 'skirts-trousers',
    gender: 'women',
    price: '₹3,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Navy', 'Beige', 'Olive'],
    description: 'Flowing skirt with elegant drape, crafted from premium linen. Comfortable and refined style.',
    details: 'Organic Linen and Natural Dyes',
    care: 'Hand wash with mild detergent. Dry flat in shade.',
    sizeChart: {
      bottom: [
        { size: 'XS', waist: '28', hips: '36', length: '38' },
        { size: 'S', waist: '30', hips: '38', length: '39' },
        { size: 'M', waist: '32', hips: '40', length: '40' },
        { size: 'L', waist: '34', hips: '42', length: '41' }
      ]
    }
  }
};

// Add more products from ShopMen and ShopWomen
const addProduct = (key, product, gender) => {
  if (!productDatabase[key]) {
    productDatabase[key] = {
      ...product,
      gender,
      images: [product.image, product.image],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Default'],
      description: `${product.name} crafted with premium sustainable fabrics for timeless elegance.`,
      details: 'Handwoven Fabric and Organic Cotton',
      care: 'Hand wash with mild detergent. Dry inside out in shade.',
      sizeChart: {
        top: [
          { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
          { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
          { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
          { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
        ]
      }
    };
  }
};

// Add men's products
const menProducts = [
  { key: 'mens-wear-3', product: { id: 3, name: 'Cotton Co-ord Set', price: '₹4,500', category: 'co-ords', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'men' },
  { key: 'mens-wear-4', product: { id: 4, name: 'Blazer Jacket', price: '₹6,500', category: 'blazers-jackets', image: 'https://images.unsplash.com/photo-1594938291221-94fa82b6e683?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'men' },
  { key: 'mens-wear-5', product: { id: 5, name: 'Handwoven Kurta', price: '₹3,800', category: 'kurtas', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'men' },
  { key: 'mens-wear-6', product: { id: 6, name: 'Denim Shirt', price: '₹2,800', category: 'shirts', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'men' }
];

menProducts.forEach(({ key, product, gender }) => addProduct(key, product, gender));

// Add women's products
const womenProducts = [
  { key: 'womens-wear-3', product: { id: 3, name: 'Cotton Co-ord Set', price: '₹4,800', category: 'co-ords', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'women' },
  { key: 'womens-wear-4', product: { id: 4, name: 'Tailored Blazer', price: '₹6,200', category: 'blazers-jackets', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'women' },
  { key: 'womens-wear-5', product: { id: 5, name: 'Handwoven Kurta', price: '₹3,600', category: 'kurtas', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'women' },
  { key: 'womens-wear-6', product: { id: 6, name: 'Elegant Dress', price: '₹5,500', category: 'dresses', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'women' },
  { key: 'womens-wear-7', product: { id: 7, name: 'Silk Saree', price: '₹8,500', category: 'sarees', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'women' },
  { key: 'womens-wear-8', product: { id: 8, name: 'Classic Blouse', price: '₹2,500', category: 'blouses', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }, gender: 'women' }
];

womenProducts.forEach(({ key, product, gender }) => addProduct(key, product, gender));

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

  // Fetch product detail from service
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchProductDetail(productSlug);
        setProduct(data);
        // Set default selections if available
        if (data?.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
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
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    // Get existing cart items from sessionStorage
    const existingCart = JSON.parse(sessionStorage.getItem('cartItems') || '[]');
    
    // Check if product already exists with same size and color
    const existingItemIndex = existingCart.findIndex(
      item => item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        priceRaw: product.priceRaw,
        image: product.image || product.images?.[0],
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
      });
    }
    
    // Save to sessionStorage
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
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    // Add to cart first
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      priceRaw: product.priceRaw,
      image: product.image || product.images?.[0],
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    };
    
    // Save single item for checkout
    sessionStorage.setItem('cartItems', JSON.stringify([cartItem]));
    navigate('/checkout');
  };

  const increaseQuantity = () => {
    setQuantity(qty => qty + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(qty => (qty > 1 ? qty - 1 : 1));
  };

  const nextImage = () => {
    setSelectedImageIndex(prev => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={breadcrumbPath}>{product.gender === 'men' ? "Men's Wear" : "Women's Wear"}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-container">
          <div className="product-images">
            <div className="main-image-wrapper">
              <img 
                src={product.images[selectedImageIndex]} 
                alt={product.name}
                className="main-product-image"
              />
              {product.images.length > 1 && (
                <>
                  <button className="image-nav-btn prev-btn" onClick={prevImage}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button className="image-nav-btn next-btn" onClick={nextImage}>
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
            {product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
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
                {product.salePrice ? (
                  <>
                    <span className="original-price">{product.price}</span>
                    <span className="sale-price">{product.salePrice}</span>
                  </>
                ) : (
                  <span className="regular-price">{product.price}</span>
                )}
              </div>
              {product.salePrice && (
                <span className="price-label">Sale price</span>
              )}
              <span className="unit-price">Unit price / per</span>
            </div>

            <div className="product-options">
              <div className="option-group">
                <label className="option-label">Size</label>
                <select
                  className="option-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">Select Size</option>
                  {product.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">Color</label>
                <select
                  className="option-select"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  <option value="">Select Color</option>
                  {product.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="quantity-group">
                <label className="option-label">Quantity</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn decrease"
                    onClick={decreaseQuantity}
                    aria-label="Decrease quantity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <span className="quantity-value">{quantity} in cart</span>
                  <button 
                    className="quantity-btn increase"
                    onClick={increaseQuantity}
                    aria-label="Increase quantity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="product-actions">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Add To Cart
              </button>
              <button className="buy-now-btn" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <div className="product-tabs">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                onClick={() => setActiveTab('care')}
              >
                Care
              </button>
              <button 
                className={`tab-btn ${activeTab === 'size' ? 'active' : ''}`}
                onClick={() => setActiveTab('size')}
              >
                Size
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel">
                  <p>{product.description}</p>
                </div>
              )}
              {activeTab === 'details' && (
                <div className="tab-panel">
                  <p>{product.details}</p>
                </div>
              )}
              {activeTab === 'care' && (
                <div className="tab-panel">
                  <p>{product.care}</p>
                </div>
              )}
              {activeTab === 'size' && product.sizeChart && (
                <div className="tab-panel">
                  {product.sizeChart.top && (
                    <>
                      <h4>Top Size</h4>
                      <table className="size-table">
                        <thead>
                          <tr>
                            <th>Size In Inches</th>
                            <th>Chest</th>
                            <th>Waist</th>
                            <th>Hips</th>
                            <th>Length</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizeChart.top.map(row => (
                            <tr key={row.size}>
                              <td>{row.size}</td>
                              <td>{row.chest}</td>
                              <td>{row.waist}</td>
                              <td>{row.hips}</td>
                              <td>{row.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {product.sizeChart.bottom && (
                    <>
                      <h4>Bottom Size</h4>
                      <table className="size-table">
                        <thead>
                          <tr>
                            <th>Size In Inches</th>
                            <th>Waist</th>
                            <th>Hips</th>
                            <th>Length</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizeChart.bottom.map(row => (
                            <tr key={row.size}>
                              <td>{row.size}</td>
                              <td>{row.waist}</td>
                              <td>{row.hips}</td>
                              <td>{row.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
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

