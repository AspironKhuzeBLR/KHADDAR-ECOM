import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardSummary,
  getRecentOrders,
  getAllOrders,
  updateOrderStatus,
  getRevenueAnalytics
} from '../services/adminService';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  fetchAdminProducts, 
  uploadImageToSupabase 
} from '../services/productService';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import './AdminDashboard.css'

const logo = '/logo_file_page-0001.png';

// 1. EXACT CATEGORY MAPPING
const CATEGORY_MAP = {
  "Men's Wear": ["Shirts", "Blazers/Jackets", "Kurtas", "Trousers", "Co-ords"],
  "Women's Wear": ["Dresses", "Corsets", "Blouses", "Skirts/Trousers", "Co-ords", "Kurtas"]
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Sidebar Toggle State for Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dashboard Data State
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    visitors: 0,
    conversionRate: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // 2. PRODUCT FORM STATE
  const initialProductState = {
    name: '',
    price: '',
    main_category: '',
    sub_category: '',
    description: '',
    is_featured: false,
    sizes: [
      { size: 'S', stock: '' },
      { size: 'M', stock: '' },
      { size: 'L', stock: '' },
      { size: 'XL', stock: '' }
    ],
    existingImages: [], // URLs already in DB
    newFiles: []        // File objects waiting to be uploaded
  };
  
  const [currentProduct, setCurrentProduct] = useState(initialProductState);

  // Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);

  // --- Data Fetching Logic ---

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summary, recent, revenue] = await Promise.all([
        getDashboardSummary(),
        getRecentOrders(),
        getRevenueAnalytics()
      ]);

      setStats({
        totalSales: summary?.data?.total_sales || summary?.data?.totalSales || summary?.data?.total_revenue || 0,
        totalOrders: summary?.data?.total_orders || summary?.data?.totalOrders || 0,
        visitors: summary?.data?.total_visitors || summary?.data?.visitors || 1500,
        conversionRate: summary?.data?.conversion_rate || summary?.data?.conversionRate || 2.5
      });
      setRecentOrders(recent?.data || recent?.orders || []);
      setRevenueData(revenue?.data || revenue);
    } catch (error) {
      console.error('Dashboard load failed', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchAdminProducts({ page: productsPage, limit: PRODUCTS_PER_PAGE });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Load products failed', error);
    }
  }, [productsPage]);

  const loadAllOrders = useCallback(async () => {
    try {
      const data = await getAllOrders(ordersPage, 10);
      setAllOrders(data.orders || data.data || []);
    } catch (error) {
      console.error('Load orders failed', error);
    }
  }, [ordersPage]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadAllOrders();
  }, [activeTab, loadProducts, loadAllOrders]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // --- Product Handlers ---

  // UPDATED: Handle Size Name OR Stock changes dynamically
  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...currentProduct.sizes];
    if (field === 'stock') {
      updatedSizes[index].stock = value === '' ? '' : parseInt(value);
    } else {
      updatedSizes[index].size = value; 
    }
    setCurrentProduct({ ...currentProduct, sizes: updatedSizes });
  };

  // NEW: Add a new size row
  const handleAddSize = () => {
    setCurrentProduct(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', stock: 0 }]
    }));
  };

  // NEW: Remove a size row
  const handleRemoveSize = (index) => {
    const updatedSizes = [...currentProduct.sizes];
    updatedSizes.splice(index, 1);
    setCurrentProduct(prev => ({ ...prev, sizes: updatedSizes }));
  };

  // Handle selecting multiple files
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFileObjects = files.map(file => ({
        file: file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random() // Temp ID for UI
      }));

      setCurrentProduct(prev => ({
        ...prev,
        newFiles: [...prev.newFiles, ...newFileObjects]
      }));
    }
  };

  // Handle removing images (both existing and new)
  const handleRemoveImage = (type, index) => {
    setCurrentProduct(prev => {
      if (type === 'existing') {
        const updated = [...prev.existingImages];
        updated.splice(index, 1);
        return { ...prev, existingImages: updated };
      } else {
        const updated = [...prev.newFiles];
        updated.splice(index, 1);
        return { ...prev, newFiles: updated };
      }
    });
  };

  // Submit with Multiple Image Uploads & Dynamic Sizes
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload ALL new images concurrently
      const uploadPromises = currentProduct.newFiles.map(item => 
        uploadImageToSupabase(item.file)
      );
      const newUploadedUrls = await Promise.all(uploadPromises);

      // 2. Combine Existing URLs + New URLs
      const allImages = [
        ...currentProduct.existingImages.map((img, i) => ({
          image_url: img.image_url || img, 
          alt_text: currentProduct.name,
          sort_order: i + 1
        })),
        ...newUploadedUrls.map((url, i) => ({
          image_url: url,
          alt_text: currentProduct.name,
          sort_order: currentProduct.existingImages.length + i + 1
        }))
      ];

      // 3. Calculate TOTAL STOCK dynamically
      const totalStock = currentProduct.sizes.reduce((sum, s) => sum + Number(s.stock || 0), 0);

      // 4. Prepare Payload
      const payload = {
        name: currentProduct.name,
        description: currentProduct.description || "",
        price: Math.round(Number(currentProduct.price)),
        stock: totalStock,
        main_category: currentProduct.main_category,
        sub_category: currentProduct.sub_category,
        sizes: currentProduct.sizes.map(s => ({
          size: s.size,
          stock: s.stock === '' ? 0 : Number(s.stock) 
        })),
        is_featured: Boolean(currentProduct.is_featured),
        images: allImages // Send array of images
      };

      console.log("Sending data to backend:", payload);

      if (isEditingProduct) {
        await updateProduct(currentProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      setIsProductModalOpen(false);
      resetProductForm();
      loadProducts();
      alert(isEditingProduct ? 'Product Updated Successfully!' : 'Product Added Successfully!');
    } catch (error) {
      console.error("Submission Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, e) => {
    if (e) e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    const previousProducts = [...products];
    setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
    try {
      await deleteProduct(id);
      setSelectedProduct(null);
      alert('✅ Success: Product removed.');

    } catch (error) {
      setProducts(previousProducts);
      console.error('Delete failed:', error);
      alert('❌ Error: Could not delete product. It has been restored to the list.');
    }
  };

  // Populate Edit Modal
  const openEditModal = (product, e) => {
    if (e) e.stopPropagation();
    
    // Ensure we load existing sizes or default fallback
    const defaultSizes = [
      { size: 'S', stock: 0 }, { size: 'M', stock: 0 },
      { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }
    ];

    const productSizes = product.sizes && product.sizes.length > 0 
      ? product.sizes 
      : defaultSizes;

    // Handle existing images
    let initialImages = [];
    if (product.images && Array.isArray(product.images)) {
      initialImages = product.images;
    } else if (product.image) {
      initialImages = [{ image_url: product.image }];
    }

    setCurrentProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      main_category: product.category || product.mainCategory || "Men's Wear",
      sub_category: product.subCategory || "",
      description: product.description || "",
      is_featured: product.isFeatured || false,
      sizes: productSizes,
      existingImages: initialImages,
      newFiles: []
    });

    setIsEditingProduct(true);
    setIsProductModalOpen(true);
    setSelectedProduct(null);
  };

  const resetProductForm = () => {
    setCurrentProduct(initialProductState);
    setIsEditingProduct(false);
  };

  const handleProductRowClick = (product) => {
    setSelectedProduct(product);
  };

  // --- Order Handlers ---

  const handleStatusUpdate = async (orderId, newStatus) => {
    const previousOrders = [...allOrders];
    const previousRecent = [...recentOrders];

    const updater = (orders) => 
      orders.map(order => 
        (order.id === orderId || order.order_id === orderId) 
          ? { ...order, order_status: newStatus } 
          : order
      );

    setAllOrders(updater(allOrders));
    setRecentOrders(updater(recentOrders));

    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`✅ Success: Order #${orderId.substring(0, 8)} is now ${newStatus.toUpperCase()}`);
    } catch (error) {
      setAllOrders(previousOrders);
      setRecentOrders(previousRecent);
      console.error('Update failed:', error);
      alert(`❌ Error: ${error.message || 'Could not update status'}`);
    }
  };

  // --- Helpers ---

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const parseRevenueData = () => {
    if (!revenueData) {
      return { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [0, 0, 0, 0, 0, 0] };
    }
    const months = revenueData.months || revenueData.data?.months || revenueData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenue = revenueData.revenue || revenueData.data?.revenue || revenueData.values || revenueData.data || [0, 0, 0, 0, 0, 0];
    return { labels: months, data: Array.isArray(revenue) ? revenue : [0, 0, 0, 0, 0, 0] };
  };

  const parsedRevenue = parseRevenueData();
  
  const chartData = {
    labels: parsedRevenue.labels,
    datasets: [{
      label: 'Revenue (₹)',
      data: parsedRevenue.data,
      borderColor: '#6F3132',
      backgroundColor: 'rgba(111, 49, 50, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6F3132',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  if (loading && activeTab === 'overview' && !stats.totalSales) {
    return <div className="admin-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰
        </button>
        <img src={logo} alt="Khaddar" className="mobile-header-logo" />
        <div style={{ width: '30px' }}></div> 
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <img src={logo} alt="Khaddar" />
          <span>ADMIN</span>
        </div>
        <nav className="admin-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => handleTabChange('overview')}
          >
            Dashboard
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => handleTabChange('products')}
          >
            Products
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => handleTabChange('orders')}
          >
            Orders
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">
            Logout
          </button>
        </nav>
      </aside>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <main className="admin-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="dashboard-content fade-in">
            <header className="page-header">
              <h1>Overview</h1>
              <p>Welcome back, Admin</p>
            </header>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Sales</h3>
                <p className="stat-value">{formatCurrency(stats.totalSales)}</p>
              </div>
              <div className="stat-card">
                <h3>Orders</h3>
                <p className="stat-value">{stats.totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Visitors</h3>
                <p className="stat-value">{stats.visitors}</p>
              </div>
              <div className="stat-card">
                <h3>Conversion</h3>
                <p className="stat-value">{stats.conversionRate}%</p>
              </div>
            </div>

            <div className="chart-section">
              <h2>Revenue Analytics</h2>
              <div className="chart-wrapper">
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="recent-orders-section">
              <h2>Recent Orders</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id || order.order_id}>
                        <td>#{order.order_number || (order.order_id ? order.order_id.substring(0, 8) : 'N/A')}</td>
                        <td>{order.customer_name || 'Guest'}</td>
                        <td>{new Date(order.created_at || order.orderDate).toLocaleDateString()}</td>
                        <td>{formatCurrency(order.total_amount || order.total)}</td>
                        <td>
                          <span className={`status-badge ${order.order_status?.toLowerCase()}`}>
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="products-content fade-in">
            <header className="page-header">
              <h1>Products</h1>
              <button
                className="primary-btn"
                onClick={() => { resetProductForm(); setIsProductModalOpen(true); }}
              >
                + Add Product
              </button>
            </header>

            <div className="table-responsive">
              <table className="admin-table hover-rows">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      onClick={() => handleProductRowClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{(productsPage - 1) * PRODUCTS_PER_PAGE + (index + 1)}</td>
                      <td>
                         {/* Display first image from array, or legacy string */}
                         <img 
                            src={Array.isArray(product.images) && product.images.length > 0 ? (product.images[0].image_url || product.images[0]) : product.image} 
                            alt={product.name} 
                            className="product-thumb" 
                          />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category} ({product.subCategory})</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <span className={`stock-badge ${product.stock < 10 ? 'low' : 'good'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="action-buttons">
                          <button className="action-btn edit" onClick={(e) => openEditModal(product, e)}>Edit</button>
                          <button className="action-btn delete" onClick={(e) => handleDeleteProduct(product.id, e)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan="7" className="text-center">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button disabled={productsPage === 1} onClick={() => setProductsPage(p => Math.max(1, p - 1))}>Previous</button>
              <span>Page {productsPage}</span>
              <button onClick={() => setProductsPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-content fade-in">
            <header className="page-header">
              <h1>Manage Orders</h1>
            </header>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(order => (
                    <tr key={order.id || order.order_id}>
                      <td>#{order.order_number || (order.order_id ? order.order_id.substring(0, 8) : 'N/A')}</td>
                      <td>{order.customer_name || 'Guest'}</td>
                      <td>{new Date(order.created_at || order.orderDate).toLocaleDateString()}</td>
                      <td>{formatCurrency(order.total_amount || order.total)}</td>
                      <td>
                        <select
                          value={order.order_status?.toLowerCase() || 'pending'}
                          onChange={(e) => handleStatusUpdate(order.order_id || order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed (COD)</option>
                          <option value="paid">Paid</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button disabled={ordersPage === 1} onClick={() => setOrdersPage(p => Math.max(1, p - 1))}>Previous</button>
              <span>Page {ordersPage}</span>
              <button onClick={() => setOrdersPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </main>

      {/* Product Edit/Add Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal">
            <h2>{isEditingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Featured</label>
                  <select value={currentProduct.is_featured} onChange={(e) => setCurrentProduct({ ...currentProduct, is_featured: e.target.value === 'true' })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Main Category</label>
                  <select 
                    value={currentProduct.main_category} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, main_category: e.target.value, sub_category: '' })} 
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sub Category</label>
                  <select 
                    value={currentProduct.sub_category} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, sub_category: e.target.value })} 
                    disabled={!currentProduct.main_category}
                    required
                  >
                    <option value="">Select Sub Category</option>
                    {currentProduct.main_category && CATEGORY_MAP[currentProduct.main_category].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* UPDATED: Dynamic Sizes and Stock Section */}
              <div className="form-sizes-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ margin: 0 }}>Stock & Sizes</label>
                  <button 
                    type="button" 
                    onClick={handleAddSize} 
                    style={{ 
                      background: '#6F3132', color: 'white', border: 'none', 
                      padding: '5px 10px', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '4px' 
                    }}
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="dynamic-sizes-list">
                  {currentProduct.sizes.map((s, idx) => (
                    <div key={idx} className="size-row">
                      {/* Size Name Input (e.g., S, XL, One Size) */}
                      <div style={{ flex: 1 }}>
                        <input 
                          type="text" 
                          placeholder="Size (e.g. XL)" 
                          value={s.size} 
                          onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                          required
                          style={{ width: '100%', textAlign: 'center' }}
                        />
                      </div>

                      {/* Stock Input */}
                      <div style={{ flex: 1 }}>
                        <input 
                          type="number" 
                          placeholder="Stock" 
                          value={s.stock === 0 ? '' : s.stock} 
                          onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)} 
                          style={{ width: '100%', textAlign: 'center' }}
                        />
                      </div>

                      {/* Remove Button */}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSize(idx)}
                        className="remove-size-btn"
                        title="Remove Size"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Image Upload Section */}
              <div className="form-group">
                <label>Upload Images (Select Multiple)</label>
                <div className="image-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange} 
                  />
                  
                  {/* Image Grid Preview */}
                  <div className="image-preview-grid">
                    {/* Existing Images from DB */}
                    {currentProduct.existingImages.map((img, idx) => (
                      <div key={`exist-${idx}`} className="preview-item">
                        <img 
                          src={img.image_url || img} 
                          alt="Existing" 
                        />
                        <button 
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage('existing', idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}

                    {/* New Files waiting for upload */}
                    {currentProduct.newFiles.map((item, idx) => (
                      <div key={`new-${item.id}`} className="preview-item new-file">
                        <img 
                          src={item.preview} 
                          alt="New Upload" 
                        />
                        <button 
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage('new', idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={currentProduct.description} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} rows="3" />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content product-details-modal" onClick={e => e.stopPropagation()}>
            <div className="product-details-header">
              <h2>Product Details</h2>
              <button className="close-icon-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
            </div>

            <div className="product-details-body">
              <div className="product-details-image">
                {/* Show first image */}
                 <img 
                    src={Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 
                          ? (selectedProduct.images[0].image_url || selectedProduct.images[0]) 
                          : selectedProduct.image} 
                    alt={selectedProduct.name} 
                  />
              </div>
              <div className="product-details-info">
                <h3>{selectedProduct.name}</h3>
                <p className="product-id">ID: #{selectedProduct.id}</p>

                <div className="detail-row">
                  <span className="label">Main Category:</span>
                  <span className="value">{selectedProduct.mainCategory || selectedProduct.category}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Sub Category:</span>
                  <span className="value">{selectedProduct.subCategory}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="value price">{formatCurrency(selectedProduct.price)}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Stock:</span>
                  <span className={`value stock-badge ${selectedProduct.stock < 10 ? 'low' : 'good'}`}>
                    {selectedProduct.stock} units
                  </span>
                </div>

                <div className="detail-section">
                  <span className="label">Description:</span>
                  <p className="description">{selectedProduct.description || 'No description available.'}</p>
                </div>

                <div className="details-actions">
                  <button className="primary-btn" onClick={() => openEditModal(selectedProduct)}>Edit Product</button>
                  <button className="action-btn delete" onClick={() => handleDeleteProduct(selectedProduct.id)}>Delete Product</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;