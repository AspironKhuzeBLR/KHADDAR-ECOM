import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserOrders } from '../services/authService';

const Profile = () => {
  const { isAuthenticated, user, token, isBootstrapped, logout } = useAuth();
  const navigate = useNavigate();
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
        // Profile endpoint doesn't exist yet (404) - use stored user data
        // Only log if it's not a 404
        if (!err.message?.includes('Route not found') && !err.message?.includes('404')) {
          console.warn('Could not fetch profile:', err);
        }
        // Use stored user data as fallback
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch orders
    const fetchOrders = async () => {
      if (!token) {
        setOrdersLoading(false);
        return;
      }
      
      try {
        const ordersData = await getUserOrders(token);
        // Handle different response formats
        const ordersList = ordersData?.orders || ordersData?.data || ordersData || [];
        setOrders(Array.isArray(ordersList) ? ordersList : []);
      } catch (err) {
        // Orders endpoint doesn't exist yet (404) - show empty orders
        // Only log if it's not a 404
        if (!err.message?.includes('Route not found') && !err.message?.includes('404')) {
          console.warn('Could not fetch orders:', err);
        }
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    fetchProfile();
    fetchOrders();
  }, [isAuthenticated, isBootstrapped, navigate, token, user]);

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
                {orders.map((order) => (
                  <div
                    key={order.id || order.orderId}
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
                          Order #{order.id || order.orderId || 'N/A'}
                        </h3>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b6b6b',
                          marginBottom: '5px'
                        }}>
                          Placed on: {formatDate(order.createdAt || order.date || order.orderDate)}
                        </p>
                        {order.status && (
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b6b6b'
                          }}>
                            Status: <span style={{ textTransform: 'capitalize' }}>{order.status}</span>
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontSize: '1rem', 
                          fontWeight: 400
                        }}>
                          {formatPrice(order.total || order.totalAmount || order.amount)}
                        </p>
                      </div>
                    </div>
                    
                    {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                      <div style={{ 
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #f0f0f0'
                      }}>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b6b6b',
                          marginBottom: '10px'
                        }}>
                          Items ({order.items.length}):
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              fontSize: '0.875rem'
                            }}>
                              <span>{item.name || item.productName || 'Item'}</span>
                              <span>{formatPrice(item.price || item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
