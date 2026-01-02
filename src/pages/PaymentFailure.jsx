import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
          {/* Elegant Failure Icon */}
          <div style={{ 
            width: '100px', height: '100px', 
            background: '#fef2f2', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 30px' 
          }}>
            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
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
            Payment Failed
          </h1>
          
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
            We encountered an issue while processing your transaction. Don't worry, no funds were deducted from your account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              className="place-order-btn" 
              style={{ width: '100%', padding: '16px', background: '#1a1a1a' }}
              onClick={() => navigate('/checkout')}
            >
              Try Again
            </button>
            
            <Link 
              to="/contact" 
              style={{  
                textAlign: 'center',
                padding: '16px', 
                color: '#666', 
                fontWeight: '400',
                fontSize: '0.95rem',
                textDecoration: 'underline'
              }}
            >
              Need help? Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;