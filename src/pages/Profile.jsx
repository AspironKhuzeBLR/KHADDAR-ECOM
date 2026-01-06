import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserProfile } from '../services/authService';
import { getMyOrders } from '../services/orderService';

const Profile = () => {
  const { isAuthenticated, user, token, isBootstrapped, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(token);
        setProfileData(profile?.user || profile?.data || profile || user);
      } catch (err) {
        if (!err.message?.includes('Route not found') && !err.message?.includes('404')) {
          console.warn('Could not fetch profile:', err);
        }
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };

    // Fetch orders
    const fetchOrders = async () => {
      const currentUser = profileData || user;

      if (!currentUser?.email) {
        console.log('No email available for fetching orders');
        setOrdersLoading(false);
        return;
      }

      try {
        console.log('Fetching orders for email:', currentUser.email);
        const response = await getMyOrders(currentUser.email);
        
        let ordersList = [];
        if (Array.isArray(response)) {
          ordersList = response;
        } else if (response?.orders && Array.isArray(response.orders)) {
          ordersList = response.orders;
        } else if (response?.data && Array.isArray(response.data)) {
          ordersList = response.data;
        } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
          ordersList = response.data.orders;
        }
        
        setOrders(ordersList);
      } catch (err) {
        console.error('Error fetching orders:', err);
        toast.error('Could not load orders. Please refresh the page.');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchProfile().then(() => fetchOrders());
    // ESLint fix: Added 'toast' to the dependency array below
  }, [isAuthenticated, isBootstrapped, navigate, token, user, profileData, toast]);

  if (!isBootstrapped || loading) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="auth-container">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayData = profileData || user;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    if (typeof price === 'string') {
      return price;
    }
    return 'N/A';
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container" style={{ maxWidth: '900px' }}>
          <h1 className="auth-title">My Profile</h1>

          <div className="profile-info">
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 400,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Personal Details
            </h2>

            <div className="form-group">
              <label className="form-label">Name</label>
              <div className="profile-value">{displayData?.name || 'Not set'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="profile-value">{displayData?.email || 'Not set'}</div>
            </div>

            {displayData?.address && (
              <div className="form-group">
                <label className="form-label">Address</label>
                <div className="profile-value">{displayData.address}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '40px', marginBottom: '30px' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 400,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Orders Placed
            </h2>

            {ordersLoading ? (
              <p style={{ color: '#6b6b6b', fontFamily: 'Inter, sans-serif' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0'
              }}>
                <p style={{
                  color: '#6b6b6b',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '10px'
                }}>
                  No orders placed yet.
                </p>
                <button
                  type="button"
                  className="auth-button"
                  onClick={() => navigate('/shop/mens-wear')}
                  style={{ marginTop: '20px', display: 'inline-block' }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((order, index) => {
                  // This ensures ORD... shows up instead of the long ID
                  const displayOrderNumber = order.order_number || order.order_id || order.id || 'N/A';
                  
                  const orderDate = order.created_at || order.createdAt || order.date || order.orderDate;
                  const orderStatus = order.order_status || order.payment_status || order.status || 'pending';
                  const orderTotal = order.total_amount || order.total || order.totalAmount || order.amount;
                  const orderItems = order.items || order.products || [];

                  return (
                    <div
                      key={order.id || index}
                      style={{
                        border: '1px solid #e0e0e0',
                        padding: '20px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '15px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div>
                          <h3 style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 400,
                            marginBottom: '5px'
                          }}>
                            Order #{displayOrderNumber}
                          </h3>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6b6b6b',
                            marginBottom: '5px'
                          }}>
                            Placed on: {formatDate(orderDate)}
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: orderStatus === 'paid' || orderStatus === 'completed' ? '#4CAF50' : '#8C6C5F',
                            fontWeight: 500
                          }}>
                            Status: <span style={{ textTransform: 'capitalize' }}>{orderStatus}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: '#6F3132'
                          }}>
                            {formatPrice(orderTotal)}
                          </p>
                        </div>
                      </div>

                      {orderItems && Array.isArray(orderItems) && orderItems.length > 0 && (
                        <div style={{
                          marginTop: '15px',
                          paddingTop: '15px',
                          borderTop: '1px solid #f0f0f0'
                        }}>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6b6b6b',
                            marginBottom: '10px',
                            fontWeight: 500
                          }}>
                            Items ({orderItems.length}):
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {orderItems.map((item, idx) => {
                              const itemName = item.name || item.productName || item.product_name || 'Item';
                              const itemPrice = item.price || item.amount;
                              const itemQty = item.quantity || 1;

                              return (
                                <div key={idx} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.875rem',
                                  color: '#4C2E2E'
                                }}>
                                  <span>
                                    {itemName}
                                    {itemQty > 1 && <span style={{ color: '#8C6C5F' }}> x{itemQty}</span>}
                                  </span>
                                  <span style={{ fontWeight: 500 }}>{formatPrice(itemPrice)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="auth-button"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
            <button
              type="button"
              className="auth-button cancel-button"
              onClick={() => {
                logout();
                toast.success('You have been logged out successfully.');
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;