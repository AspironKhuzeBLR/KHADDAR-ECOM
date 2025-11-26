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
    
    // TODO: Fetch cart items from API
    // For now, using empty cart
    setCartItems([]);
    setLoading(false);
  }, [isAuthenticated, isBootstrapped, navigate]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[₹,]/g, '')) || 0;
      return total + price * item.quantity;
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
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
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
                        <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                        {item.price}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
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
                  // TODO: Navigate to checkout
                  alert('Checkout functionality coming soon!');
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

