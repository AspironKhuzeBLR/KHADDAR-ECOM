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
import { addProduct, updateProduct, deleteProduct, fetchAdminProducts } from '../services/productService';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import './AdminDashboard.css';

const logo = '/logo_file_page-0001.png';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // NEW: Sidebar Toggle State for Mobile
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
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    description: ''
  });
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);

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

  // Close sidebar automatically when tab changes on mobile
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  // --- Product Handlers ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingProduct) {
        await updateProduct(currentProduct.id, currentProduct);
      } else {
        await addProduct(currentProduct);
      }
      setIsProductModalOpen(false);
      resetProductForm();
      loadProducts();
      if (selectedProduct && isEditingProduct) {
        setSelectedProduct(null);
      }
      alert(isEditingProduct ? 'Product updated!' : 'Product added!');
    } catch (error) {
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadProducts();
        setSelectedProduct(null);
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const openEditModal = (product, e) => {
    if (e) e.stopPropagation();
    setCurrentProduct(product);
    setIsEditingProduct(true);
    setIsProductModalOpen(true);
    setSelectedProduct(null);
  };

  const resetProductForm = () => {
    setCurrentProduct({ name: '', price: '', category: '', stock: '', image: '', description: '' });
    setIsEditingProduct(false);
  };

  const handleProductRowClick = (product) => {
    setSelectedProduct(product);
  };

  // --- Order Handlers ---
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (activeTab === 'orders') loadAllOrders();
      else fetchDashboardData();
    } catch (error) {
      alert('Failed to update status');
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
      {/* NEW: Mobile Header / Toggle Button */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          ☰
        </button>
        
        {/* Logo centered in the header */}
        <img src={logo} alt="Khaddar" className="mobile-header-logo" />
        
        {/* Invisible spacer to balance the flex layout (optional, but good for alignment) */}
        <div style={{ width: '30px' }}></div> 
      </div>

      {/* Sidebar with dynamic class for mobile */}
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
      
      {/* NEW: Overlay for closing sidebar on mobile */}
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
                        <img src={product.image} alt={product.name} className="product-thumb" />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
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
                          <option value="paid">Paid</option>
                          <option value="complete">Completed</option>
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
          <div className="modal-content">
            <h2>{isEditingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={currentProduct.stock} onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={currentProduct.category} onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" value={currentProduct.image} onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={currentProduct.description} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} rows="3" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Save Product</button>
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
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <div className="product-details-info">
                <h3>{selectedProduct.name}</h3>
                <p className="product-id">ID: #{selectedProduct.id}</p>

                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span className="value">{selectedProduct.category}</span>
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