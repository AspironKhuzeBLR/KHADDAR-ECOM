import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getPaymentStatus } from '../services/orderService'; // Adjust path as needed
import './Checkout.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for API data
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract the UUID (order_id) from the URL
  const orderId = searchParams.get('order_id') || searchParams.get('id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setLoading(false);
        setError("No Order ID found in URL.");
        return;
      }

      try {
        const result = await getPaymentStatus(orderId);
        if (result.success) {
          setOrderInfo(result.data);
        } else {
          setError("Payment verification failed.");
        }
      } catch (err) {
        setError("We couldn't verify your payment status.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
    
    // Clear cart on mount
    sessionStorage.removeItem('cartItems');
    window.scrollTo(0, 0);
  }, [orderId]);

  // Loading Screen
  if (loading) {
    return (
      <div className="checkout-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Verifying your payment, please wait...</p>
      </div>
    );
  }

  // Error Screen (If verification fails)
  if (error || !orderInfo) {
    return (
      <div className="checkout-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#ef4444' }}>Verification Issue</h2>
          <p>{error || "We could not find your order details."}</p>
          <button onClick={() => navigate('/shop')} className="place-order-btn" style={{ marginTop: '20px' }}>Back to Shop</button>
        </div>
      </div>
    );
  }

  // SUCCESS UI (Your existing styled UI)
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
          {/* Success Icon */}
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
            marginBottom: '15px'
          }}>
            Payment Successful!
          </h1>
          
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '35px' }}>
            Thank you for your purchase, {orderInfo.customer_name}. Your order has been placed successfully and is being processed.
          </p>

          {/* Order Details Box (Using data from your API) */}
          <div style={{ 
            background: '#fafafa', 
            border: '1px dashed #e0e0e0',
            padding: '25px', 
            borderRadius: '6px', 
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'left', borderRight: '1px solid #eee' }}>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order Number</p>
              {/* API Key: order_number */}
              <p style={{ margin: '5px 0 0', fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>{orderInfo.order_number}</p>
            </div>
            <div style={{ textAlign: 'left', paddingLeft: '10px' }}>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount Paid</p>
              {/* API Key: total_amount */}
              <p style={{ margin: '5px 0 0', fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>₹{parseFloat(orderInfo.total_amount).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              className="place-order-btn" 
              style={{ width: '100%', padding: '16px', cursor: 'pointer' }}
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