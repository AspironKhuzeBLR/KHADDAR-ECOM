import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Checkout.css';

const Checkout = () => {
  const { isAuthenticated, isBootstrapped, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment method - only online payment options (NO COD as per client request)
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
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

  // Payment methods available (NO COD)
  const paymentMethods = [
    { 
      id: 'upi', 
      name: 'UPI Payment', 
      description: 'Pay using UPI (GPay, PhonePe, Paytm)',
      icon: '📱'
    },
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      description: 'Pay securely with Visa, Mastercard, RuPay',
      icon: '💳'
    },
    { 
      id: 'netbanking', 
      name: 'Net Banking', 
      description: 'Pay through your bank account',
      icon: '🏦'
    },
    { 
      id: 'wallet', 
      name: 'Digital Wallet', 
      description: 'Pay using Paytm, Amazon Pay, etc.',
      icon: '👛'
    }
  ];

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

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    // Free shipping above ₹5000
    return subtotal >= 5000 ? 0 : 199;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
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
      // Simulate payment processing
      // In production, this would integrate with a payment gateway like Razorpay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        items: cartItems,
        shipping: shippingDetails,
        paymentMethod: paymentMethod,
        subtotal: calculateSubtotal(),
        shippingCost: calculateShipping(),
        total: calculateTotal(),
        orderDate: new Date().toISOString()
      };
      
      console.log('Order placed:', orderData);
      
      // Clear cart
      sessionStorage.removeItem('cartItems');
      
      // Show success and redirect
      toast.success('Order placed successfully! Redirecting to payment...');
      
      // In production, redirect to payment gateway
      setTimeout(() => {
        toast.success('Payment successful! Thank you for your order.');
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
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

            {/* Payment Method */}
            <section className="checkout-section">
              <h2>Mode of Payment</h2>
              <p className="payment-note">
                Select your preferred payment method. All transactions are secure and encrypted.
              </p>
              
              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-icon">{method.icon}</span>
                    <div className="payment-info">
                      <span className="payment-name">{method.name}</span>
                      <span className="payment-desc">{method.description}</span>
                    </div>
                    <span className="payment-check">✓</span>
                  </label>
                ))}
              </div>
              
              <div className="secure-payment-badge">
                <span className="lock-icon">🔒</span>
                <span>Your payment information is secure and encrypted</span>
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
              
              <div className="summary-row">
                <span>Shipping</span>
                <span className={calculateShipping() === 0 ? 'free-shipping' : ''}>
                  {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping()}`}
                </span>
              </div>
              
              {calculateShipping() > 0 && (
                <div className="shipping-note">
                  Free shipping on orders above ₹5,000
                </div>
              )}
              
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
                  `Pay ₹${calculateTotal().toLocaleString('en-IN')}`
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
    </div>
  );
};

export default Checkout;

