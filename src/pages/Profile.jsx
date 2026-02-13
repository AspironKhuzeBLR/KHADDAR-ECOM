import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserProfile } from '../services/authService';
import { getMyOrders, requestCancellation } from '../services/orderService';

const Profile = () => {
  const { isAuthenticated, user, token, isBootstrapped, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [requestType, setRequestType] = useState('Cancellation'); 
  
  // Track cancelled order IDs in sessionStorage
  const getCancelledOrderIds = () => {
    try {
      const stored = sessionStorage.getItem('cancelledOrderIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };
  
  const addCancelledOrderId = (orderId) => {
    const cancelled = getCancelledOrderIds();
    if (!cancelled.includes(orderId)) {
      cancelled.push(orderId);
      sessionStorage.setItem('cancelledOrderIds', JSON.stringify(cancelled));
    }
  };
  
  const isCancellationRequested = (order) => {
  const orderId = order.id || order.order_id;
  const cancelledIds = getCancelledOrderIds();
  
  // Check sessionStorage
  if (cancelledIds.includes(orderId)) return true;
  // Check if order has cancellation_requested flag
  if (order.cancellation_requested) return true;
  
  // Check if order status indicates cancellation OR exchange
  const status = (order.order_status || order.status || '').toLowerCase();
  return status.includes('cancel') || status.includes('exchange');
};

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

  // Check if order can be cancelled (within 24 hours)
  const canCancelOrder = (orderDate) => {
    if (!orderDate) return false;
    const createdDate = new Date(orderDate);
    const now = new Date();
    const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  // Open cancel modal
  const handleCancelClick = (order) => {
  setSelectedOrder(order);
  setCancelReason('');
  setRequestType('Cancellation'); // Reset to default
  setAgreedToPolicy(false);
  setShowCancelModal(true);
};

  // Close cancel modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrder(null);
    setCancelReason('');
    setAgreedToPolicy(false);
  };

  // Submit cancellation request
  const handleSubmitCancellation = async () => {
    if (!agreedToPolicy) {
      toast.error('Please agree to the cancellation policy');
      return;
    }

    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setCancelLoading(true);
    try {
      const orderId = selectedOrder.id || selectedOrder.order_id;
      await requestCancellation(orderId, cancelReason, requestType);
      
      // Store cancelled order ID in sessionStorage
      addCancelledOrderId(orderId);
      
      toast.success(`${requestType} request submitted successfully`);
      closeCancelModal();
      
      // Update the order status to show cancellation requested
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if ((order.id || order.order_id) === orderId) {
            return { ...order, cancellation_requested: true };
          }
          return order;
        })
      );
      
      // Refresh orders from server (optional - the sessionStorage will persist the state)
      const currentUser = profileData || user;
      if (currentUser?.email) {
        try {
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
          
          // Update orders but preserve cancellation status
          setOrders(ordersList);
        } catch (error) {
          console.warn('Could not refresh orders after cancellation:', error);
        }
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to submit cancellation request. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container" style={{ maxWidth: "900px" }}>
          <h1 className="auth-title">My Profile</h1>

          <div className="profile-info">
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 400,
                marginBottom: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Personal Details
            </h2>

            <div className="form-group">
              <label className="form-label">Name</label>
              <div className="profile-value">
                {displayData?.name || "Not set"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="profile-value">
                {displayData?.email || "Not set"}
              </div>
            </div>

            {displayData?.address && (
              <div className="form-group">
                <label className="form-label">Address</label>
                <div className="profile-value">{displayData.address}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "40px", marginBottom: "30px" }}>
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 400,
                marginBottom: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Orders Placed
            </h2>

            {ordersLoading ? (
              <p style={{ color: "#6b6b6b", fontFamily: "Inter, sans-serif" }}>
                Loading orders...
              </p>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                }}
              >
                <p
                  style={{
                    color: "#6b6b6b",
                    fontFamily: "Inter, sans-serif",
                    marginBottom: "10px",
                  }}
                >
                  No orders placed yet.
                </p>
                <button
                  type="button"
                  className="auth-button"
                  onClick={() => navigate("/shop/mens-wear")}
                  style={{ marginTop: "20px", display: "inline-block" }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {orders.map((order, index) => {
                  // This ensures ORD... shows up instead of the long ID
                  const displayOrderNumber =
                    order.order_number || order.order_id || order.id || "N/A";

                  const orderDate =
                    order.created_at ||
                    order.createdAt ||
                    order.date ||
                    order.orderDate;
                  const orderStatus =
                    order.order_status ||
                    order.payment_status ||
                    order.status ||
                    "pending";
                  const orderTotal =
                    order.total_amount ||
                    order.total ||
                    order.totalAmount ||
                    order.amount;
                  const orderItems = order.items || order.products || [];

                  return (
                    <div
                      key={order.id || index}
                      style={{
                        border: "1px solid #e0e0e0",
                        padding: "20px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "15px",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "1rem",
                              fontWeight: 400,
                              marginBottom: "5px",
                            }}
                          >
                            Order #{displayOrderNumber}
                          </h3>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#6b6b6b",
                              marginBottom: "5px",
                            }}
                          >
                            Placed on: {formatDate(orderDate)}
                          </p>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color:
                                orderStatus === "paid" ||
                                orderStatus === "completed"
                                  ? "#4CAF50"
                                  : "#8C6C5F",
                              fontWeight: 500,
                            }}
                          >
                            Status:{" "}
                            <span style={{ textTransform: "capitalize" }}>
                              {orderStatus}
                            </span>
                          </p>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            alignItems: "flex-end",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "1.1rem",
                              fontWeight: 600,
                              color: "#6F3132",
                            }}
                          >
                            {formatPrice(orderTotal)}
                          </p>

                          {/* Show cancellation/exchange request submitted message */}
                            {isCancellationRequested(order) && orderStatus !== 'cancelled' && orderStatus !== 'exchanged' && (
                              <div style={{
                                padding: '8px 16px',
                                fontSize: '0.75rem',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: '#FFF9E6',
                                color: '#8B6914',
                                border: '1px solid #FFE69C',
                                borderRadius: '4px',
                                textAlign: 'center'
                              }}>
                                ⏳ {orderStatus.toLowerCase().includes('exchange') ? 'Exchange' : 'Cancellation'} Request Submitted
                              </div>
                            )}

                          {/* Show cancel button if within 24 hours and no cancellation requested */}
                          {canCancelOrder(orderDate) &&
                            orderStatus !== "cancelled" &&
                            !isCancellationRequested(order) && (
                              <button
                                onClick={() => handleCancelClick(order)}
                                style={{
                                  padding: "8px 16px",
                                  fontSize: "0.75rem",
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 500,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  backgroundColor: "#fff",
                                  color: "#d32f2f",
                                  border: "1px solid #d32f2f",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  borderRadius: "4px",
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = "#d32f2f";
                                  e.target.style.color = "#fff";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = "#fff";
                                  e.target.style.color = "#d32f2f";
                                }}
                              >
                                Cancel / Exchange
                              </button>
                            )}

                          {/* Show cancellation period expired if past 24 hours */}
                          {!canCancelOrder(orderDate) &&
                            orderStatus !== "cancelled" &&
                            !isCancellationRequested(order) && (
                              <p
                                style={{
                                  fontSize: "0.7rem",
                                  color: "#999",
                                  fontStyle: "italic",
                                  marginTop: "5px",
                                }}
                              >
                                Cancellation period expired (24hrs)
                              </p>
                            )}
                        </div>
                      </div>

                      {orderItems &&
                        Array.isArray(orderItems) &&
                        orderItems.length > 0 && (
                          <div
                            style={{
                              marginTop: "15px",
                              paddingTop: "15px",
                              borderTop: "1px solid #f0f0f0",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#6b6b6b",
                                marginBottom: "10px",
                                fontWeight: 500,
                              }}
                            >
                              Items ({orderItems.length}):
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {orderItems.map((item, idx) => {
                                const itemName =
                                  item.name ||
                                  item.productName ||
                                  item.product_name ||
                                  "Item";
                                const itemPrice = item.price || item.amount;
                                const itemQty = item.quantity || 1;

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.875rem",
                                      color: "#4C2E2E",
                                    }}
                                  >
                                    <span>
                                      {itemName}
                                      {itemQty > 1 && (
                                        <span style={{ color: "#8C6C5F" }}>
                                          {" "}
                                          x{itemQty}
                                        </span>
                                      )}
                                    </span>
                                    <span style={{ fontWeight: 500 }}>
                                      {formatPrice(itemPrice)}
                                    </span>
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
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
            <button
              type="button"
              className="auth-button cancel-button"
              onClick={() => {
                logout();
                toast.success("You have been logged out successfully.");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            padding: "20px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 400,
                marginBottom: "20px",
                color: "#1a1a1a",
                textAlign: "center",
              }}
            >
              Cancel Order
            </h2>

            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#4C2E2E",
                  marginBottom: "5px",
                }}
              >
                <strong>Order #:</strong>{" "}
                {selectedOrder?.order_number ||
                  selectedOrder?.order_id ||
                  selectedOrder?.id}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#4C2E2E",
                }}
              >
                <strong>Total:</strong>{" "}
                {formatPrice(
                  selectedOrder?.total_amount || selectedOrder?.total,
                )}
              </p>
            </div>

            <div
              style={{
                marginBottom: "20px",
                padding: "20px",
                backgroundColor: "#FFF9E6",
                borderRadius: "4px",
                border: "1px solid #FFE69C",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  marginBottom: "15px",
                  color: "#6F3132",
                }}
              >
                Cancellation & Refund Policy
              </h3>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#4C2E2E",
                  lineHeight: "1.8",
                }}
              >
                <p style={{ marginBottom: "12px" }}>
                  <strong>Cancellation Window:</strong> Orders can be cancelled
                  within 24 hours of placing the order, provided the item has
                  not been shipped.
                </p>
                <p style={{ marginBottom: "12px" }}>
                  <strong>Post-Dispatch:</strong> Once dispatched, cancellations
                  cannot be accepted.
                </p>
                <p style={{ marginBottom: "12px" }}>
                  <strong>Refund Processing:</strong> Prepaid cancellation
                  refunds will be processed to the original payment method
                  within 5–7 working days.
                </p>
                <p style={{ marginBottom: "12px" }}>
                  <strong>COD Orders:</strong> No charges will be applied for
                  cancelled COD orders.
                </p>
                <p style={{ marginBottom: "0" }}>
                  <strong>Important:</strong> Khaddar does not offer refunds for
                  general returns, as our collections are produced in limited
                  quantities. Refunds are only applicable if the product
                  delivered is damaged or incorrect.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                className="form-label"
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                Select Action *
              </label>
              <div style={{ display: "flex", gap: "20px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="requestType"
                    checked={requestType === "Cancellation"}
                    onChange={() => setRequestType("Cancellation")}
                  />
                  Cancel Order
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="requestType"
                    checked={requestType === "Exchange"}
                    onChange={() => setRequestType("Exchange")}
                  />
                  Exchange Order
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label
                className="form-label"
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#4C2E2E",
                }}
              >
                Reason for {requestType} *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={`Please provide a reason for ${requestType.toLowerCase()}...`}
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  resize: "vertical",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6F3132")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            <div
              style={{
                marginBottom: "25px",
                padding: "15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "4px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <input
                type="checkbox"
                id="agreePolicy"
                checked={agreedToPolicy}
                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                style={{
                  marginTop: "3px",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="agreePolicy"
                style={{
                  fontSize: "0.875rem",
                  color: "#4C2E2E",
                  lineHeight: "1.6",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                I have read and agree to Khaddar's{" "}
                <Link
                  to="/cancellation-policy"
                  target="_blank"
                  style={{ color: "#6F3132", textDecoration: "underline" }}
                >
                  Cancellation Policy
                </Link>{" "}
                and{" "}
                <Link
                  to="/refund-policy"
                  target="_blank"
                  style={{ color: "#6F3132", textDecoration: "underline" }}
                >
                  Refund Policy
                </Link>
                . I understand that this order can only be cancelled within 24
                hours if not yet dispatched, and refunds (if applicable) will be
                processed within 5-7 working days.
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeCancelModal}
                disabled={cancelLoading}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  backgroundColor: "#fff",
                  color: "#6b6b6b",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  cursor: cancelLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: cancelLoading ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (!cancelLoading) {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#fff";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCancellation}
                disabled={
                  !agreedToPolicy || !cancelReason.trim() || cancelLoading
                }
                style={{
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  backgroundColor:
                    agreedToPolicy && cancelReason.trim() && !cancelLoading
                      ? "#d32f2f"
                      : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    agreedToPolicy && cancelReason.trim() && !cancelLoading
                      ? "pointer"
                      : "not-allowed",
                  transition: "all 0.3s ease",
                  opacity:
                    agreedToPolicy && cancelReason.trim() && !cancelLoading
                      ? 1
                      : 0.6,
                }}
                onMouseOver={(e) => {
                  if (agreedToPolicy && cancelReason.trim() && !cancelLoading) {
                    e.target.style.backgroundColor = "#b71c1c";
                  }
                }}
                onMouseOut={(e) => {
                  if (agreedToPolicy && cancelReason.trim() && !cancelLoading) {
                    e.target.style.backgroundColor = "#d32f2f";
                  }
                }}
              >
                 {cancelLoading ? 'Processing...' : `Submit ${requestType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;