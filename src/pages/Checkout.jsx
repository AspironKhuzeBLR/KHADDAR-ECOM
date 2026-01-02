import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder, submitPayment } from '../services/orderService';
import './Checkout.css';

const Checkout = () => {
  const { isAuthenticated, isBootstrapped, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Order state
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment method - HDFC by default
  const paymentMethod = 'hdfc';

  // Shipping details
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get cart items from sessionStorage or API
    const savedCart = sessionStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Pre-fill user details if available
    if (user) {
      setShippingDetails(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }

    setLoading(false);
  }, [isAuthenticated, isBootstrapped, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[₹,]/g, ''))
        : item.price;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingDetails[field]?.trim()) {
        toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Validate phone
    if (!/^[6-9]\d{9}$/.test(shippingDetails.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingDetails.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(shippingDetails.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      // Map cart items to API format
      const orderItems = cartItems.map(item => ({
        product_id: item.id || item.productId,
        name: item.name,
        size: item.size || 'M',
        color: item.color || 'Default',
        quantity: item.quantity || 1,
        price: typeof item.price === 'string'
          ? parseFloat(item.price.replace(/[₹,]/g, ''))
          : item.price
      }));

      const orderData = {
        customer_name: shippingDetails.fullName,
        customer_email: shippingDetails.email,
        customer_phone: shippingDetails.phone,
        shipping_address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        pincode: shippingDetails.pincode,
        items: orderItems,
        subtotal: calculateSubtotal(),
        total_amount: calculateTotal(),
        payment_method: paymentMethod
      };

      console.log('Creating Order:', JSON.stringify(orderData, null, 2));
      const orderResponse = await createOrder(orderData);
      console.log('Order Response:', orderResponse);

      // Extract Order ID from response structure
      const orderId = orderResponse?.data?.order_id || orderResponse?.order_id;

      if (orderId) {
        console.log('Submitting Payment for Order:', orderId);
        const paymentData = { payment_method: paymentMethod };
        const paymentResponse = await submitPayment(orderId, paymentData);
        console.log('Payment Response:', paymentResponse);

        // CHECK FOR HDFC REDIRECT URL
        if (paymentResponse?.data?.payment_url) {
            // Replaced toast.info with toast.success to avoid the error
            toast.success('Redirecting to Payment Gateway...');
            
            // Clear cart before redirecting
            sessionStorage.removeItem('cartItems');

            // Redirect to the actual HDFC Bank payment page
            window.location.href = paymentResponse.data.payment_url;
        } 
        else if (paymentResponse && (paymentResponse.success || paymentResponse.status === 'success')) {
          sessionStorage.removeItem('cartItems');
          setCurrentOrder(orderResponse.data);
          setShowPaymentModal(true);
          toast.success('🎉 Order placed successfully!');
        } else {
          throw new Error('Payment initialization failed');
        }
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order/Payment error:', error);
      toast.error(error.message || 'Failed to process order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };


  if (!isBootstrapped || loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-loading">
            <div className="loading-spinner"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <h2>Your Cart is Empty</h2>
            <p>Add some items to your cart before checking out.</p>
            <Link to="/shop/mens-wear" className="checkout-btn primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <Link to="/cart" className="back-to-cart">← Back to Cart</Link>
        </div>

        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="checkout-forms">
            {/* Shipping Details */}
            <section className="checkout-section">
              <h2>Shipping Details</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingDetails.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">Street Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    placeholder="House/Flat No., Street, Landmark"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={shippingDetails.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingDetails.country}
                    disabled
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="summary-item">
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="placeholder-image"></div>
                      )}
                      <span className="item-qty">{item.quantity || 1}</span>
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      {item.size && <span className="item-variant">Size: {item.size}</span>}
                    </div>
                    <span className="item-price">
                      ₹{(typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[₹,]/g, ''))
                        : item.price
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>

              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="btn-spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>

              <p className="terms-note">
                By placing this order, you agree to our{' '}
                <Link to="/terms">Terms & Conditions</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showPaymentModal && currentOrder && (
        <div className="modal-overlay">
          <div className="payment-modal success-modal">
            <div className="modal-header success-header">
              <div className="success-icon">✓</div>
              <h2>Payment Successful!</h2>
            </div>
            <div className="modal-body">
              <div className="success-message">
                <p className="success-text">
                  Thank you for your purchase! Your payment has been processed successfully and your order is confirmed.
                </p>
                
                <div className="order-details-card">
                  <h3>Order Details</h3>
                  <div className="detail-row">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{currentOrder?.order_number || currentOrder?.order_id || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount Paid:</span>
                    <span className="detail-value">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">HDFC Payment Gateway</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{shippingDetails.email}</span>
                  </div>
                </div>

                <p className="confirmation-note">
                  📧 A confirmation email has been sent to <strong>{shippingDetails.email}</strong>
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  className="confirm-payment-btn success-btn" 
                  onClick={() => navigate('/profile')}
                >
                  View My Orders
                </button>
                <button 
                  className="secondary-btn" 
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;