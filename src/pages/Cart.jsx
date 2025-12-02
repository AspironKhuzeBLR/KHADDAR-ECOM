import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Shop.css';

const Cart = () => {
  const { isAuthenticated, isBootstrapped } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load cart items from sessionStorage
    const savedCart = sessionStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        setCartItems(items);
      } catch (error) {
        console.error('Error parsing cart items:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  }, [isAuthenticated, isBootstrapped, navigate]);

  const updateQuantity = (itemId, size, color, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId, size, color);
      return;
    }
    const updatedItems = cartItems.map(item =>
      (item.id === itemId && item.size === size && item.color === color)
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedItems);
    sessionStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const removeItem = (itemId, size, color) => {
    const updatedItems = cartItems.filter(item => 
      !(item.id === itemId && item.size === size && item.color === color)
    );
    setCartItems(updatedItems);
    sessionStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Handle both string and number price formats
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[₹,]/g, '')) 
        : (item.priceRaw || item.price || 0);
      return total + price * (item.quantity || 1);
    }, 0);
  };

  if (!isBootstrapped || loading) {
    return (
      <div className="shop-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="shop-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}>Your Cart is Empty</h2>
            <p style={{ marginBottom: '30px', color: '#6b6b6b' }}>
              Start shopping to add items to your cart.
            </p>
            <Link to="/shop/mens-wear" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="container">
        <div style={{ padding: '140px 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '2rem', 
            fontWeight: 400, 
            letterSpacing: '0.05em',
            marginBottom: '40px',
            textTransform: 'uppercase'
          }}>
            Shopping Cart
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px', marginBottom: '40px' }}>
            <div>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '30px 0',
                    borderBottom: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ width: '120px', height: '120px', backgroundColor: '#f5f5f5', flexShrink: 0 }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontSize: '1rem', 
                      fontWeight: 400,
                      marginBottom: '10px'
                    }}>
                      {item.name}
                    </h3>
                    {item.size && (
                      <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '5px' }}>
                        Size: {item.size}
                      </p>
                    )}
                    {item.color && (
                      <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '15px' }}>
                        Color: {item.color}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, (item.quantity || 1) - 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid #e0e0e0',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, (item.quantity || 1) + 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid #e0e0e0',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontSize: '1rem', 
                        fontWeight: 400 
                      }}>
                        {typeof item.price === 'string' ? item.price : `₹${(item.priceRaw || item.price || 0).toLocaleString('en-IN')}`}
                      </span>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          color: '#6b6b6b',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.875rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              padding: '30px', 
              border: '1px solid #e0e0e0',
              height: 'fit-content',
              position: 'sticky',
              top: '140px'
            }}>
              <h2 style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontSize: '1.25rem', 
                fontWeight: 400,
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Order Summary
              </h2>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '15px',
                fontSize: '0.875rem',
                color: '#6b6b6b'
              }}>
                <span>Subtotal</span>
                <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '15px',
                fontSize: '0.875rem',
                color: '#6b6b6b'
              }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ 
                borderTop: '1px solid #e0e0e0',
                paddingTop: '20px',
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                fontWeight: 400
              }}>
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>
              <button
                className="auth-button"
                style={{ width: '100%', marginTop: '30px' }}
                onClick={() => {
                  // Save cart items to sessionStorage for checkout
                  sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
                  navigate('/checkout');
                }}
              >
                Proceed to Checkout
              </button>
              <Link
                to="/shop/mens-wear"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '15px',
                  color: '#1a1a1a',
                  textDecoration: 'underline',
                  fontSize: '0.875rem'
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

