import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAdminProducts, addProduct, updateProduct, deleteProduct, fetchCategories } from '../services/productService';
import { requestPasswordReset } from '../services/authService';

import './AdminDashboard.css';

// --- CONFIGURATION: PREDEFINED CATEGORIES BASED ON YOUR IMAGES ---
const PRODUCT_CATEGORIES = {
  "Men's Wear": [
    "Shirts",
    "Pants",
    "Co-ords",
    "Blazers",
    "Kurtas"
  ],
  "Women's Wear": [
    "Blouses",
    "Skirts",
    "Pants",
    "Co-ords",
    "Blazers",
    "Kurtas",
    "Dresses",
    "Corsets",
    "Sarees"
  ]
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- Dashboard Stats State ---
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  // --- Products Overview State ---
  const [selectedMainCategory, setSelectedMainCategory] = useState("Men's Wear");
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [overviewProducts, setOverviewProducts] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // --- State for Password Reset ---
  const [isResetLinkSending, setIsResetLinkSending] = useState(false);

  // --- Mock Orders Data with detailed information ---
  const [orders] = useState([
    { 
      id: 'ORD-1001', 
      customer: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      phone: '+91 9876543210',
      products: [
        { name: 'Black Khadi Shirt', quantity: 1, price: 4200, size: 'M' }
      ],
      amount: 4200, 
      paymentMode: 'UPI', 
      status: 'completed', 
      date: '2024-01-20',
      shippingAddress: '42, MG Road, Koramangala, Bangalore, Karnataka - 560034',
      billingAddress: '42, MG Road, Koramangala, Bangalore, Karnataka - 560034'
    },
    { 
      id: 'ORD-1002', 
      customer: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 9123456789',
      products: [
        { name: 'White Khadi Pants', quantity: 2, price: 3200, size: 'S' }
      ],
      amount: 6400, 
      paymentMode: 'Card', 
      status: 'pending', 
      date: '2024-01-20',
      shippingAddress: '15, Jubilee Hills, Hyderabad, Telangana - 500033',
      billingAddress: '15, Jubilee Hills, Hyderabad, Telangana - 500033'
    },
    { 
      id: 'ORD-1003', 
      customer: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 9988776655',
      products: [
        { name: 'Naqsh Blazer', quantity: 1, price: 5400, size: 'L' },
        { name: 'White Khadi Shirt', quantity: 1, price: 3800, size: 'L' }
      ],
      amount: 9200, 
      paymentMode: 'Net Banking', 
      status: 'completed', 
      date: '2024-01-19',
      shippingAddress: '78, Sector 15, Noida, Uttar Pradesh - 201301',
      billingAddress: '78, Sector 15, Noida, Uttar Pradesh - 201301'
    },
    { 
      id: 'ORD-1004', 
      customer: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '+91 9876123456',
      products: [
        { name: 'Kutchi Bird Skirt', quantity: 1, price: 5500, size: 'M' }
      ],
      amount: 5500, 
      paymentMode: 'UPI', 
      status: 'completed', 
      date: '2024-01-19',
      shippingAddress: '23, Anna Nagar, Chennai, Tamil Nadu - 600040',
      billingAddress: '23, Anna Nagar, Chennai, Tamil Nadu - 600040'
    },
    { 
      id: 'ORD-1005', 
      customer: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91 9765432109',
      products: [
        { name: 'Laal Tara Shirt', quantity: 1, price: 4200, size: 'XL' }
      ],
      amount: 4200, 
      paymentMode: 'Card', 
      status: 'pending', 
      date: '2024-01-18',
      shippingAddress: '56, Civil Lines, Jaipur, Rajasthan - 302006',
      billingAddress: '56, Civil Lines, Jaipur, Rajasthan - 302006'
    },
    { 
      id: 'ORD-1006', 
      customer: 'Anjali Gupta',
      email: 'anjali.gupta@email.com',
      phone: '+91 9654321098',
      products: [
        { name: 'Morah Dress', quantity: 1, price: 16100, size: 'S' }
      ],
      amount: 16100, 
      paymentMode: 'UPI', 
      status: 'completed', 
      date: '2024-01-18',
      shippingAddress: '12, Bandra West, Mumbai, Maharashtra - 400050',
      billingAddress: '89, Lower Parel, Mumbai, Maharashtra - 400013'
    },
    { 
      id: 'ORD-1007', 
      customer: 'Karthik R',
      email: 'karthik.r@email.com',
      phone: '+91 9543210987',
      products: [
        { name: 'Nira Shirt', quantity: 1, price: 3800, size: 'M' }
      ],
      amount: 3800, 
      paymentMode: 'Net Banking', 
      status: 'cancelled', 
      date: '2024-01-17',
      shippingAddress: '34, Indiranagar, Bangalore, Karnataka - 560038',
      billingAddress: '34, Indiranagar, Bangalore, Karnataka - 560038'
    },
    { 
      id: 'ORD-1008', 
      customer: 'Meera Joshi',
      email: 'meera.joshi@email.com',
      phone: '+91 9432109876',
      products: [
        { name: 'Sandal Corset', quantity: 1, price: 2800, size: 'XS' },
        { name: 'White Khadi Pants', quantity: 1, price: 3200, size: 'XS' }
      ],
      amount: 6000, 
      paymentMode: 'Card', 
      status: 'completed', 
      date: '2024-01-17',
      shippingAddress: '67, Aundh, Pune, Maharashtra - 411007',
      billingAddress: '67, Aundh, Pune, Maharashtra - 411007'
    }
  ]);

  // --- Sales Data for Graph ---
  const salesData = useMemo(() => [
    { month: 'Jan', sales: 125000, orders: 45 },
    { month: 'Feb', sales: 158000, orders: 52 },
    { month: 'Mar', sales: 142000, orders: 48 },
    { month: 'Apr', sales: 189000, orders: 63 },
    { month: 'May', sales: 210000, orders: 71 },
    { month: 'Jun', sales: 178000, orders: 58 },
    { month: 'Jul', sales: 225000, orders: 78 },
    { month: 'Aug', sales: 198000, orders: 66 },
    { month: 'Sep', sales: 245000, orders: 85 },
    { month: 'Oct', sales: 267000, orders: 92 },
    { month: 'Nov', sales: 312000, orders: 108 },
    { month: 'Dec', sales: 285000, orders: 96 }
  ], []);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    const storedUser = sessionStorage.getItem('adminUser');

    if (!adminToken) {
      navigate('/login');
    } else if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  // Calculate order stats
  useEffect(() => {
    const completed = orders.filter(o => o.status === 'completed').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);

    setDashboardStats(prev => ({
      ...prev,
      totalOrders: completed, // Total Orders = Completed Orders
      completedOrders: completed,
      pendingOrders: pending,
      cancelledOrders: cancelled,
      totalRevenue: revenue
    }));
  }, [orders]);

  // Fetch total products count
  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const result = await fetchAdminProducts({ page: 1, limit: 1 });
        setDashboardStats(prev => ({
          ...prev,
          totalProducts: result.pagination?.total || result.products?.length || 0
        }));
      } catch (error) {
        console.error('Error fetching product count:', error);
      }
    };
    fetchProductCount();
  }, []);

  // Fetch subcategories when main category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      try {
        const allCategories = await fetchCategories();
        const categoriesArray = Array.isArray(allCategories) ? allCategories : (allCategories?.categories || []);
        
        // Find the main category ID
        const mainCatId = selectedMainCategory === "Men's Wear" ? 1 : 4;
        
        // Filter subcategories for the selected main category
        const subs = categoriesArray.filter(cat => cat.parent_id === mainCatId && cat.type === 'sub');
        setSubCategories(subs);
        setSelectedSubCategory(''); // Reset subcategory when main category changes
      } catch (error) {
        console.error('Error loading subcategories:', error);
        // Fallback to predefined categories
        setSubCategories(PRODUCT_CATEGORIES[selectedMainCategory]?.map((name, idx) => ({ id: idx, name })) || []);
      }
    };
    loadSubCategories();
  }, [selectedMainCategory]);

  // Fetch products for overview based on category selection
  useEffect(() => {
    const loadOverviewProducts = async () => {
      setOverviewLoading(true);
      try {
        const params = {
          page: 1,
          limit: 50,
          mainCategory: selectedMainCategory
        };
        
        if (selectedSubCategory) {
          params.category = selectedSubCategory;
        }
        
        const result = await fetchAdminProducts(params);
        setOverviewProducts(result.products || []);
      } catch (error) {
        console.error('Error loading overview products:', error);
        setOverviewProducts([]);
      } finally {
        setOverviewLoading(false);
      }
    };
    loadOverviewProducts();
  }, [selectedMainCategory, selectedSubCategory]);

  const validTabs = useMemo(
    () => ['overview', 'products', 'orders', 'settings'],
    []
  );

  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (hash && validTabs.includes(hash) && hash !== activeTab) {
      setActiveTab(hash);
    }
    if (!hash && activeTab !== 'overview') {
      setActiveTab('overview');
      navigate('#overview', { replace: true }); 
    }
  }, [location.hash, activeTab, validTabs, navigate]);

  // Function to reload products
  const reloadProducts = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        mainCategory: selectedMainCategory
      };
      
      if (selectedSubCategory) {
        params.category = selectedSubCategory;
      }
      
      const result = await fetchAdminProducts(params);
      setOverviewProducts(result.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setOverviewProducts([]);
    } finally {
      setOverviewLoading(false);
    }
  }, [selectedMainCategory, selectedSubCategory]);

  // Load overview products when products tab is active or category changes
  useEffect(() => {
    if (activeTab === 'products') {
      reloadProducts();
    }
  }, [activeTab, reloadProducts]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    category: '',
    subCategory: '',
    price: '',
    stock: '',
    image: '',
    description: ''
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
        subCategory: '',
        price: '',
        stock: '',
        image: '',
        description: ''
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
      subCategory: '',
      price: '',
      stock: '',
      image: ''
    });
    setImagePreview('');
    setIsEditing(false);
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'category') {
      setCurrentProduct((prev) => ({ 
        ...prev, 
        [name]: value,
        subCategory: '' 
      }));
    } else {
      setCurrentProduct((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    if (!currentProduct.name || !currentProduct.category || !currentProduct.subCategory || !currentProduct.price || !currentProduct.stock) {
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
        await updateProduct(currentProduct.id, productToSave);
        showNotification('Product updated successfully!', 'success');
      } else {
        await addProduct(productToSave);
        showNotification('Product added successfully!', 'success');
      }
      closeModal();
      reloadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification(error.message || 'An error occurred. Please try again.', 'error');
    }
  };

  const handleDeleteProduct = useCallback(async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setNotification({ show: true, message: 'Product deleted successfully!', type: 'success' });
        reloadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setNotification({ show: true, message: error.message || 'Failed to delete product.', type: 'error' });
      }
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  }, [reloadProducts]);

  // --- Send Password Reset Link Handler ---
  const handleSendResetLink = async () => {
    if (!adminUser?.email) {
      showNotification('Admin email not found.', 'error');
      return;
    }

    setIsResetLinkSending(true);
    try {
      await requestPasswordReset(adminUser.email);
      showNotification('Password reset link sent to your email!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to send reset link. Please try again.', 'error');
    } finally {
      setIsResetLinkSending(false);
    }
  };

  // Get max sales value for graph scaling
  const maxSales = Math.max(...salesData.map(d => d.sales));

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
                {/* Section 1: Summary Cards */}
                <div className="dashboard-section-title">
                  <h2>Dashboard Summary</h2>
                </div>
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
                      <p className="stat-value">{dashboardStats.totalOrders.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="stat-card stat-card-revenue">
                    <div className="stat-icon stat-icon-rupee">
                      <span className="rupee-symbol">₹</span>
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-label">Total Revenue</h3>
                      <p className="stat-value">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
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
                      <p className="stat-value">{dashboardStats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Order Overview */}
                <div className="dashboard-section-title">
                  <h2>Order Overview</h2>
                </div>
                <div className="order-overview-grid">
                  <div className="order-stat-card total">
                    <div className="order-stat-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                    </div>
                    <div className="order-stat-info">
                      <span className="order-stat-label">Total Orders</span>
                      <span className="order-stat-value">{dashboardStats.totalOrders}</span>
                    </div>
                  </div>
                  
                  <div className="order-stat-card pending">
                    <div className="order-stat-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="order-stat-info">
                      <span className="order-stat-label">Pending Orders</span>
                      <span className="order-stat-value">{dashboardStats.pendingOrders}</span>
                    </div>
                  </div>
                  
                  <div className="order-stat-card completed">
                    <div className="order-stat-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div className="order-stat-info">
                      <span className="order-stat-label">Completed Orders</span>
                      <span className="order-stat-value">{dashboardStats.completedOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Sales Graph */}
                <div className="dashboard-section-title">
                  <h2>Sales Analytics</h2>
                </div>
                <div className="sales-graph-section">
                  <div className="graph-header">
                    <div className="graph-legend">
                      <span className="legend-item sales">
                        <span className="legend-dot"></span>
                        Revenue (₹)
                      </span>
                      <span className="legend-item orders">
                        <span className="legend-dot"></span>
                        Orders
                      </span>
                    </div>
                  </div>
                  <div className="graph-container">
                    <div className="bar-chart">
                      {salesData.map((data, index) => (
                        <div key={data.month} className="bar-group">
                          <div className="bar-wrapper">
                            <div 
                              className="bar sales-bar" 
                              style={{ height: `${(data.sales / maxSales) * 200}px` }}
                              title={`Revenue: ₹${data.sales.toLocaleString()}`}
                            >
                              <span className="bar-value">₹{(data.sales / 1000).toFixed(0)}K</span>
                            </div>
                            <div 
                              className="bar orders-bar" 
                              style={{ height: `${(data.orders / 120) * 200}px` }}
                              title={`Orders: ${data.orders}`}
                            >
                              <span className="bar-value">{data.orders}</span>
                            </div>
                          </div>
                          <span className="bar-label">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="graph-summary">
                    <div className="summary-card">
                      <span className="summary-label">Total Annual Revenue</span>
                      <span className="summary-value">₹{salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Total Annual Orders</span>
                      <span className="summary-value">{salesData.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Avg. Order Value</span>
                      <span className="summary-value">
                        ₹{Math.round(salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.reduce((sum, d) => sum + d.orders, 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="admin-products">
                {/* Products Overview Section */}
                <div className="section-header">
                  <h2 className="section-title">Products Overview & Management</h2>
                  <button className="admin-action-btn" onClick={() => openModal()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Product
                  </button>
                </div>

                {/* Category Filters */}
                <div className="products-filter-section">
                  <div className="category-filters">
                    <div className="filter-group">
                      <label>Product Category</label>
                      <select 
                        value={selectedMainCategory} 
                        onChange={(e) => setSelectedMainCategory(e.target.value)}
                        className="category-select"
                      >
                        <option value="Men's Wear">Men's Wear</option>
                        <option value="Women's Wear">Women's Wear</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Sub Category</label>
                      <select 
                        value={selectedSubCategory} 
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="category-select"
                      >
                        <option value="">All Sub Categories</option>
                        {subCategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-stats">
                      <span className="stat-item">
                        <strong>{overviewProducts.length}</strong> products found
                      </span>
                    </div>
                  </div>
                </div>

                {/* Products Table with Overview + Management */}
                <div
                  className="table-container"
                  style={{
                    maxHeight: "calc(100vh - 320px)",
                    minHeight: "200px",
                    overflowY: "auto",
                    position: "relative",
                  }}
                >
                  {overviewLoading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading products...</p>
                    </div>
                  ) : overviewProducts.length === 0 ? (
                    <div className="empty-state">
                      <p>No products found in this category. Click "Add New Product" to create one.</p>
                    </div>
                  ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th> 
                      </tr>
                    </thead>
                    <tbody>
                      {overviewProducts.map((product) => (
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
                          <td>
                            <span className="category-tag">
                              {product.subCategory || product.category}
                            </span>
                          </td>
                          <td>
                            <span className="description-cell" title={product.description || 'No description'}>
                              {product.description ? 
                                (product.description.length > 50 ? 
                                  product.description.substring(0, 50) + '...' : 
                                  product.description
                                ) : 
                                <em style={{color: '#999'}}>No description</em>
                              }
                            </span>
                          </td>
                          <td className="amount-cell">₹{product.price?.toLocaleString()}</td>
                          <td>
                            <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
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
                  )}
                </div>
                
                {/* --- MODAL FOR ADD/EDIT PRODUCT --- */}
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
                              <label className="form-label" htmlFor="product-description">
                                Description
                              </label>
                              <textarea
                                className="form-input"
                                id="product-description"
                                name="description"
                                placeholder="Enter product description"
                                value={currentProduct.description}
                                onChange={handleProductChange}
                                rows="3"
                                style={{ resize: 'vertical', minHeight: '80px' }}
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label" htmlFor="product-category">
                                Main Category <span className="required">*</span>
                              </label>
                              <select
                                className="form-input"
                                id="product-category"
                                name="category"
                                value={currentProduct.category}
                                onChange={handleProductChange}
                                required
                              >
                                <option value="">Select Main Category</option>
                                {Object.keys(PRODUCT_CATEGORIES).map((cat) => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label" htmlFor="product-subcategory">
                                Sub Category <span className="required">*</span>
                              </label>
                              <select
                                className="form-input"
                                id="product-subcategory"
                                name="subCategory"
                                value={currentProduct.subCategory}
                                onChange={handleProductChange}
                                disabled={!currentProduct.category}
                                required
                              >
                                <option value="">Select Sub Category</option>
                                {currentProduct.category && 
                                  PRODUCT_CATEGORIES[currentProduct.category]?.map((subCat) => (
                                    <option key={subCat} value={subCat}>{subCat}</option>
                                  ))
                                }
                              </select>
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
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-id-section">
                          <span className="order-id-label">Order ID</span>
                          <span className="order-id-value">{order.id}</span>
                        </div>
                        <div className="order-date-status">
                          <span className="order-date">{order.date}</span>
                          <span className={`status-badge ${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-card-body">
                        {/* Customer & Contact Details */}
                        <div className="order-section">
                          <h4 className="order-section-title">Customer Details</h4>
                          <div className="order-customer-info">
                            <div className="customer-name">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              <span>{order.customer}</span>
                            </div>
                            <div className="customer-contact">
                              <div className="contact-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>{order.email}</span>
                              </div>
                              <div className="contact-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span>{order.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Products Ordered */}
                        <div className="order-section">
                          <h4 className="order-section-title">Products Ordered</h4>
                          <div className="order-products-list">
                            {order.products.map((product, idx) => (
                              <div key={idx} className="order-product-item">
                                <div className="product-details">
                                  <span className="product-name">{product.name}</span>
                                  <span className="product-size">Size: {product.size}</span>
                                </div>
                                <div className="product-qty-price">
                                  <span className="product-qty">Qty: {product.quantity}</span>
                                  <span className="product-price">₹{product.price.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Addresses */}
                        <div className="order-section addresses-section">
                          <div className="address-box">
                            <h4 className="order-section-title">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              Shipping Address
                            </h4>
                            <p className="address-text">{order.shippingAddress}</p>
                          </div>
                          <div className="address-box">
                            <h4 className="order-section-title">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                              </svg>
                              Billing Address
                            </h4>
                            <p className="address-text">{order.billingAddress}</p>
                          </div>
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <div className="payment-info">
                          <span className="payment-label">Payment Mode:</span>
                          <span className="payment-value">{order.paymentMode}</span>
                        </div>
                        <div className="order-total">
                          <span className="total-label">Total Amount:</span>
                          <span className="total-value">₹{order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <h3 className="settings-section-title">Account Settings</h3>
                    <div className="settings-item">
                      <label className="settings-label">Admin Email</label>
                      <input 
                        type="email" 
                        className="settings-input" 
                        defaultValue={adminUser?.email || 'admin@khaddar.com'} 
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="settings-section">
                    <h3 className="settings-section-title">Security</h3>
                    <div className="settings-item">
                      <label className="settings-label">Reset Password</label>
                      <p className="settings-hint">A password reset link will be sent to your registered email address.</p>
                      <button 
                        className="admin-action-btn reset-link-btn" 
                        onClick={handleSendResetLink}
                        disabled={isResetLinkSending}
                      >
                        {isResetLinkSending ? (
                          <>
                            <span className="btn-spinner"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Send Reset Link
                          </>
                        )}
                      </button>
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
