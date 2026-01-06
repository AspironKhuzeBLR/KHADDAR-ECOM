import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentStatus } from '../services/orderService';
import './Checkout.css';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State for API data
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  // REMOVED: error and setError state to fix ESLint warnings

  // 1. Extract values from URL search parameters
  const orderId = searchParams.get('order_id') || searchParams.get('id');
  const urlErrorMessage = searchParams.get('message') || searchParams.get('resp_message') || searchParams.get('error');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const result = await getPaymentStatus(orderId);
        if (result.success) {
          setOrderInfo(result.data);
        }
      } catch (err) {
        console.error("Could not fetch order details for failure page");
        // No need to set a local error state as we use urlErrorMessage for display
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    window.scrollTo(0, 0);
  }, [orderId]);

  if (loading) {
    return (
      <div className="checkout-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Processing payment details...</p>
      </div>
    );
  }

  const displayMessage = urlErrorMessage || "We encountered an issue while processing your transaction.";

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
            marginBottom: '15px'
          }}>
            Payment Failed
          </h1>
          
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '35px' }}>
            {displayMessage}
          </p>

          <div style={{ 
            background: '#fafafa', 
            border: '1px dashed #ef4444', 
            padding: '25px', 
            borderRadius: '6px', 
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'left', borderRight: '1px solid #eee' }}>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order Number</p>
              <p style={{ margin: '5px 0 0', fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>{orderInfo?.order_number || 'N/A'}</p>
            </div>
            <div style={{ textAlign: 'left', paddingLeft: '10px' }}>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Attempted Amount</p>
              <p style={{ margin: '5px 0 0', fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>₹{orderInfo?.total_amount ? parseFloat(orderInfo.total_amount).toLocaleString('en-IN') : '0'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              className="place-order-btn" 
              style={{ width: '100%', padding: '16px', background: '#1a1a1a', cursor: 'pointer' }}
              onClick={() => navigate('/checkout')}
            >
              Try Again
            </button>
            
            <Link 
              to="/contact" 
              style={{  
                textAlign: 'center',
                padding: '10px', 
                color: '#666', 
                fontWeight: '400',
                fontSize: '0.95rem',
                textDecoration: 'underline'
              }}
            >
              Need help? Contact Support
            </Link>
          </div>

          <p style={{ marginTop: '30px', fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
            If your bank account was debited, the amount will be refunded automatically within 5-7 working days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;