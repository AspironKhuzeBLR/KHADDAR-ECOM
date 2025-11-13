import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './AdminDashboard.css';

const analysisCards = [
  {
    title: 'Payments Completed',
    value: '92%',
    description: 'Orders with successful payments this week',
    detail: '23 of 25 orders paid',
    progress: 92
  },
  {
    title: 'Orders Received',
    value: '80%',
    description: 'Orders confirmed and ready for processing',
    detail: '20 of 25 orders received',
    progress: 80
  }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
 

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (!adminToken) {
      navigate('/login');
    } else if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }
  }, [navigate]);



  const validTabs = useMemo(
    () => ['overview', 'products', 'orders', 'users', 'settings'],
    []
  );

  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (hash && validTabs.includes(hash) && hash !== activeTab) {
      setActiveTab(hash);
    }
    if (!hash && activeTab !== 'overview') {
      setActiveTab('overview');
      navigate('#overview', { replace: true }); // Ensure hash is set on initial load
    }
  }, [location.hash, activeTab, validTabs, navigate]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    navigate(`#${tabName}`);
  };

  const stats = {
    totalOrders: 1247,
    totalRevenue: 125000,
    totalProducts: 156,
    totalUsers: 3421
  };

  const recentOrders = useMemo(
    () => [
      { id: 1, customer: 'John Doe', product: 'Khaddar Shirt', amount: 2500, paymentStatus: 'Paid', date: '2024-01-15' },
      { id: 2, customer: 'Jane Smith', product: 'Khaddar Kurta', amount: 3200, paymentStatus: 'COD', date: '2024-01-14' },
      { id: 3, customer: 'Mike Johnson', product: 'Khaddar Blazer', amount: 4500, paymentStatus: 'Paid', date: '2024-01-13' },
      { id: 4, customer: 'Sarah Williams', product: 'Khaddar Dress', amount: 3800, paymentStatus: 'COD', date: '2024-01-12' },
      { id: 5, customer: 'David Brown', product: 'Khaddar Co-ord', amount: 4200, paymentStatus: 'Paid', date: '2024-01-11' }
    ],
    []
  );

  const [products, setProducts] = useState(() => {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [
      {
        id: 1,
        name: 'Classic Khaddar Shirt',
        category: "Men's Wear",
        price: 2500,
        stock: 45,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=60'
      },
      {
        id: 2,
        name: 'Elegant Khaddar Kurta',
        category: "Women's Wear",
        price: 3200,
        stock: 32,
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=60'
      },
      {
        id: 3,
        name: 'Premium Khaddar Blazer',
        category: "Men's Wear",
        price: 4500,
        stock: 18,
        image:
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=60'
      },
      {
        id: 4,
        name: 'Traditional Khaddar Dress',
        category: "Women's Wear",
        price: 3800,
        stock: 28,
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=60'
      },
      {
        id: 5,
        name: 'Designer Khaddar Saree',
        category: "Women's Wear",
        price: 5500,
        stock: 15,
        image:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=60'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    category: '',
    price: '',
    stock: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const openModal = useCallback((product = null) => {
    if (product) {
      setCurrentProduct(product);
      setImagePreview(product.image);
      setIsEditing(true);
    } else {
      setCurrentProduct({
        id: null,
        name: '',
        category: '',
        price: '',
        stock: '',
        image: ''
      });
      setImagePreview('');
      setIsEditing(false);
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({
      id: null,
      name: '',
      category: '',
      price: '',
      stock: '',
      image: ''
    });
    setImagePreview('');
    setIsEditing(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const getNextProductId = () => {
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(p => p.id));
    return maxId + 1;
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setImagePreview('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
        setCurrentProduct((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (event) => {
    event.preventDefault();
    if (!currentProduct.name || !currentProduct.category || !currentProduct.price || !currentProduct.stock) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    const parsedPrice = parseFloat(currentProduct.price);
    const parsedStock = parseInt(currentProduct.stock, 10);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showNotification('Please enter a valid price.', 'error');
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      showNotification('Please enter a valid stock quantity.', 'error');
      return;
    }

    const productToSave = {
      ...currentProduct,
      price: parsedPrice,
      stock: parsedStock,
      image: imagePreview || currentProduct.image || 'https://via.placeholder.com/72x72?text=KH'
    };

    try {
      if (isEditing) {
        setProducts((prev) => prev.map((p) => (p.id === productToSave.id ? productToSave : p)));
        showNotification('Product updated successfully!', 'success');
      } else {
        productToSave.id = getNextProductId();
        setProducts((prev) => [productToSave, ...prev]);
        showNotification('Product added successfully!', 'success');
      }
      closeModal();
    } catch (error) {
      showNotification('An error occurred. Please try again.', 'error');
    }
  };

  const handleDeleteProduct = useCallback((productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setNotification({ show: true, message: 'Product deleted successfully!', type: 'success' });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  }, []);




  if (!adminUser) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => setNotification({ show: false, message: '', type: 'success' })}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      )}
      <div className="admin-content with-header-offset">
        <div className="container">

          <div className="admin-tab-content">
            {activeTab === 'overview' && (
              <div className="admin-overview">
                <div className="stats-grid">
                  <div className="stat-card stat-card-orders">
                    <div className="stat-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-label">Total Orders</h3>
                      <p className="stat-value">{stats.totalOrders.toLocaleString()}</p>
                      <span className="stat-change positive">+12% from last month</span>
                    </div>
                  </div>

                  <div className="stat-card stat-card-revenue">
                    <div className="stat-icon stat-icon-rupee">
                      <span className="rupee-symbol">₹</span>
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-label">Total Revenue</h3>
                      <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
                      <span className="stat-change positive">+18% from last month</span>
                    </div>
                  </div>

                  <div className="stat-card stat-card-products">
                    <div className="stat-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-label">Total Products</h3>
                      <p className="stat-value">{stats.totalProducts}</p>
                      <span className="stat-change positive">+5 new this week</span>
                    </div>
                  </div>

                  <div className="stat-card stat-card-users">
                    <div className="stat-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-label">Total Users</h3>
                      <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
                      <span className="stat-change positive">+24% from last month</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-section">
                  <h2 className="section-title">Analysis</h2>
                  <div className="analysis-grid">
                    {analysisCards.map((item) => (
                      <div className="analysis-card" key={item.title}>
                        <div className="analysis-card-header">
                          <h3>{item.title}</h3>
                          <span className="analysis-value">{item.value}</span>
                        </div>
                        <p className="analysis-description">{item.description}</p>
                        <div className="analysis-progress">
                          <div className="analysis-progress-bar" style={{ width: `${item.progress}%` }}></div>
                        </div>
                        <span className="analysis-progress-label">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-sections">
                  <div className="dashboard-section">
                    <div className="section-header">
                      <h2 className="section-title">Recent Orders</h2>
                      <a className="view-all-btn" href="#orders" onClick={() => handleTabClick('orders')}>View All</a>
                    </div>
                    <div className="table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id}>
                              <td><span className="order-id">#{order.id}</span></td>
                              <td>{order.customer}</td>
                              <td>{order.product}</td>
                              <td className="amount-cell">₹{order.amount.toLocaleString()}</td>
                              <td>{order.date}</td>
                              <td>
                                <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'paid' : 'cod'}`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="admin-products">
                <div className="section-header">
                  <h2 className="section-title">Products Management</h2>
                  <button className="admin-action-btn" onClick={() => openModal()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Product
                  </button>
                </div>
                <div
                  className="table-container"
                  style={{
                    maxHeight: "calc(100vh - 250px)",
                    minHeight: "200px",
                    overflowY: "auto",
                    position: "relative",
                  }}
                >
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th> {/* Added Actions column */}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td><span className="product-id">#{product.id}</span></td>
                          <td>
                            <div className="product-image-wrapper">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="product-image"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/72x72?text=KH';
                                }}
                              />
                            </div>
                          </td>
                          <td><span className="product-name">{product.name}</span></td>
                          <td><span className="category-tag">{product.category}</span></td>
                          <td className="amount-cell">₹{product.price.toLocaleString()}</td>
                          <td>
                            <span className={`stock-badge ${product.stock > 20 ? 'in-stock' : 'low-stock'}`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td>
                            <div className="product-actions">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => openModal(product)}
                                aria-label={`Edit ${product.name}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteProduct(product.id)}
                                aria-label={`Delete ${product.name}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {isModalOpen && (
                  <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeModal}>
                    <div
                      className="modal-content product-modal-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="modal-header">
                        <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                        <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
                          &times;
                        </button>
                      </div>
                      <form
                        onSubmit={handleSaveProduct}
                        className="product-form"
                      >
                        <div className="form-body">
                          <div className="form-row">
                            <div className="form-group full-width">
                              <label className="form-label" htmlFor="product-name">
                                Product Name <span className="required">*</span>
                              </label>
                              <input
                                className="form-input"
                                id="product-name"
                                name="name"
                                type="text"
                                placeholder="Enter product name"
                                value={currentProduct.name}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group full-width">
                              <label className="form-label" htmlFor="product-category">
                                Category <span className="required">*</span>
                              </label>
                              <input
                                className="form-input"
                                id="product-category"
                                name="category"
                                type="text"
                                placeholder="e.g., Men's Wear, Women's Wear"
                                value={currentProduct.category}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label" htmlFor="product-price">
                                Price (₹) <span className="required">*</span>
                              </label>
                              <input
                                className="form-input"
                                id="product-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={currentProduct.price}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label" htmlFor="product-stock">
                                Stock <span className="required">*</span>
                              </label>
                              <input
                                className="form-input"
                                id="product-stock"
                                name="stock"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={currentProduct.stock}
                                onChange={handleProductChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group full-width">
                              <label className="form-label" htmlFor="product-image-url">
                                Image URL
                              </label>
                              <input
                                className="form-input"
                                id="product-image-url"
                                name="image"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={currentProduct.image}
                                onChange={handleProductChange}
                              />
                              <p className="form-hint">Enter a direct link to the product image</p>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group full-width">
                              <label className="form-label" htmlFor="product-upload-image">
                                Or Upload Image
                              </label>
                              <div className="file-upload-wrapper">
                                <input
                                  className="form-input file-input"
                                  id="product-upload-image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageFileChange}
                                />
                              </div>
                              {imagePreview && (
                                <div className="image-preview-container">
                                  <div className="image-preview">
                                    <img
                                      src={imagePreview}
                                      alt="Product preview"
                                      className="preview-image"
                                    />
                                    <button
                                      type="button"
                                      className="remove-preview"
                                      onClick={() => {
                                        setImagePreview('');
                                        setCurrentProduct((prev) => ({ ...prev, image: '' }));
                                      }}
                                      aria-label="Remove image"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button
                            type="button"
                            className="form-btn form-btn-secondary"
                            onClick={closeModal}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="form-btn form-btn-primary"
                          >
                            {isEditing ? 'Save Changes' : 'Add Product'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="admin-orders">
                <div className="section-header">
                  <h2 className="section-title">Orders Management</h2>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td><span className="order-id">#{order.id}</span></td>
                          <td>{order.customer}</td>
                          <td>{order.product}</td>
                          <td className="amount-cell">₹{order.amount.toLocaleString()}</td>
                          <td>{order.date}</td>
                          <td>
                            <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'paid' : 'cod'}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-users">
                <div className="section-header">
                  <h2 className="section-title">Users Management</h2>
                </div>
                <div className="info-box">
                  <div className="info-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3>Total Registered Users</h3>
                  <p className="user-count">{stats.totalUsers.toLocaleString()}</p>
                  <p className="info-text">User management features coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="admin-settings">
                <div className="section-header">
                  <h2 className="section-title">Settings</h2>
                </div>
                <div className="settings-content">
                  <div className="settings-section">
                    <h3 className="settings-section-title">General Settings</h3>
                    <div className="settings-item">
                      <label className="settings-label">Site Name</label>
                      <input type="text" className="settings-input" defaultValue="KHADDAR" />
                    </div>
                    <div className="settings-item">
                      <label className="settings-label">Admin Email</label>
                      <input type="email" className="settings-input" defaultValue="admin@khaddar.com" />
                    </div>
                  </div>
                  <div className="settings-section">
                    <h3 className="settings-section-title">Security</h3>
                    <div className="settings-item">
                      <label className="settings-label">Change Password</label>
                      <button className="admin-action-btn">Change Password</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;