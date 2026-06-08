import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  createOrder,
  submitPayment,
} from "../services/orderService";
import "./Checkout.css";

const Checkout = () => {
  const { isAuthenticated, isBootstrapped, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Shipping details
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Get cart items from sessionStorage or API
    const savedCart = sessionStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Pre-fill user details if available
    if (user) {
      setShippingDetails((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }

    setLoading(false);
  }, [isAuthenticated, isBootstrapped, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Only allow numbers for phone and pincode
    if (name === "phone" || name === "pincode") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      setShippingDetails((prev) => ({
        ...prev,
        [name]: onlyNums,
      }));
      return;
    }

    setShippingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[₹,]/g, ""))
          : item.price;
      return total + price * (item.quantity || 1);
    }, 0);
  };

   const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[₹,]/g, ""))
          : item.price;
      return total + price * (item.quantity || 1);
    }, 0);
  };

   const calculateTaxAmount = () => {
    const total = calculateTotal();
    return (total * 5) / 105; 
  };

  const calculateSubtotalExclTax = () => {
    return calculateTotal() - calculateTaxAmount();
  };

  const validateForm = () => {
    const required = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];
    for (const field of required) {
      if (!shippingDetails[field]?.trim()) {
        toast.error(
          `Please enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return false;
      }
    }

    // --- ADDED ADDRESS LENGTH VALIDATION HERE ---
    if (shippingDetails.address.trim().length < 10) {
      toast.error(
        "Address is too short. Please provide a more detailed address (at least 10 characters).",
      );
      return false;
    }

    // Validate phone
    if (!/^[6-9]\d{9}$/.test(shippingDetails.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingDetails.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(shippingDetails.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setProcessing(true);

    try {
      const orderItems = cartItems.map((item) => ({
        product_id: item.id || item.productId,
        name: item.name,
        size: item.size || "M",
        color: item.color || "Default",
        quantity: item.quantity || 1,
        price:
          typeof item.price === "string"
            ? parseFloat(item.price.replace(/[₹,]/g, ""))
            : item.price,
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
        payment_method: paymentMethod, // This will be 'cod' or 'upi'
      };

      // 1. Create Order
      const orderResponse = await createOrder(orderData);
      const orderId = orderResponse?.data?.order_id || orderResponse?.order_id;

      if (!orderId) throw new Error("Failed to create order");{
        toast.success("Redirecting to secure payment...");
        const paymentResponse = await submitPayment(orderId, {
          payment_method: paymentMethod,
        });

        if (paymentResponse?.data?.payment_url) {
          sessionStorage.removeItem("cartItems");
          window.location.href = paymentResponse.data.payment_url;
        } else {
          throw new Error("Payment gateway could not be reached.");
        }
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      // Display error message clearly
      let msg = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.errors) msg = parsed.errors[0].msg;
      } catch (e) {}
      toast.error(msg || "An error occurred during checkout");
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
          <Link to="/cart" className="back-to-cart">
            ← Back to Cart
          </Link>
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

            {/* Payment Method Selection */}
            <section className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                {/* Online Payment Option */}
                <div
                  className={`payment-option ${paymentMethod !== "cod" ? "selected" : ""}`} // Selected if NOT cod
                  onClick={() => setPaymentMethod("upi")} // Set to 'upi' which the backend accepts
                  style={{ cursor: "pointer" }}
                >
                  <span className="payment-icon">💳</span>
                  <div className="payment-info">
                    <span className="payment-name">Online Payment</span>
                    <span className="payment-desc">
                      Credit/Debit Card, UPI, Net Banking
                    </span>
                  </div>
                  {paymentMethod !== "cod" && (
                    <span className="payment-check">✓</span>
                  )}
                </div>
              </div>
              <div className="secure-payment-badge">
                <span className="lock-icon">🔒</span>
                <span>Your information is safe and secure</span>
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
                      {item.size && (
                        <span className="item-variant">Size: {item.size}</span>
                      )}
                    </div>
                    <span className="item-price">
                      ₹
                      {(typeof item.price === "string"
                        ? parseFloat(item.price.replace(/[₹,]/g, ""))
                        : item.price
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{calculateSubtotalExclTax().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>₹{calculateTaxAmount().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
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
                  "Proceed to Payment"
                )}
              </button>
              <p className="terms-note">
                By placing this order, you agree to our{" "}
                <Link to="/terms">Terms & Conditions</Link> and{" "}
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
