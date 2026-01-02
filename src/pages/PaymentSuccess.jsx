import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Checkout.css'; // Reusing your existing checkout styles for consistency

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Most gateways pass order info back in the URL
  const orderId = searchParams.get('order_id') || searchParams.get('orderNo') || 'N/A';

  useEffect(() => {
    // Clear cart on mount to ensure it's empty after successful purchase
    sessionStorage.removeItem('cartItems');
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="checkout-page">
      <div className="checkout-container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          maxWidth: '600px', 
          width: '100%', 
          textAlign: 'center', 
          padding: '60px 40px',
          background: '#fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          borderRadius: '8px'
        }}>
          {/* Animated/Attractive Success Icon */}
          <div style={{ 
            width: '100px', height: '100px', 
            background: '#f0fdf4', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 30px' 
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h1 style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '2.4rem', 
            fontWeight: '400', 
            color: '#1a1a1a',
            marginBottom: '15px',
            letterSpacing: '-0.02em'
          }}>
            Order Confirmed!
          </h1>
          
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '35px' }}>
            Thank you for your purchase. We've received your payment and are now preparing your handcrafted pieces.
          </p>

          <div style={{ 
            background: '#fafafa', 
            border: '1px dashed #e0e0e0',
            padding: '20px', 
            borderRadius: '6px', 
            marginBottom: '40px' 
          }}>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order ID</p>
            <p style={{ margin: '5px 0 0', fontSize: '1.2rem', fontWeight: '500', color: '#1a1a1a' }}>{orderId}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              className="place-order-btn" 
              style={{ width: '100%', padding: '16px' }}
              onClick={() => navigate('/profile')}
            >
              View My Orders
            </button>
            
            <Link 
              to="/shop/mens-wear" 
              style={{ 
                textAlign: 'center',
                padding: '16px', 
                textDecoration: 'none', 
                color: '#1a1a1a', 
                fontWeight: '500',
                border: '1px solid #1a1a1a',
                borderRadius: '4px',
                fontSize: '0.95rem'
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;