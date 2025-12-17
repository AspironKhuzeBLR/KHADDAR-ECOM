import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../services/orderService';
import './Auth.css'; // Reusing auth/profile styles for consistency

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isBootstrapped } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isBootstrapped) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await getOrderById(id);
                setOrder(response.data || response.order || response);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Could not load order details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, isAuthenticated, isBootstrapped, navigate]);

    if (loading) return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        </div>
    );

    if (error || !order) return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container">
                    <h2>Order Not Found</h2>
                    <p>{error || 'The requested order could not be found.'}</p>
                    <Link to="/profile" className="auth-button" style={{ marginTop: '20px', display: 'inline-block', textAlign: 'center' }}>
                        Back to Orders
                    </Link>
                </div>
            </div>
        </div>
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="auth-container" style={{ maxWidth: '900px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h1>Order Details</h1>
                        <Link to="/profile" style={{ color: '#6F3132', textDecoration: 'none' }}>← Back to Profile</Link>
                    </div>

                    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <p style={{ color: '#6b6b6b', fontSize: '0.9rem' }}>Order Number</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>#{order.order_number || order.id}</p>
                            </div>
                            <div>
                                <p style={{ color: '#6b6b6b', fontSize: '0.9rem' }}>Date</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{formatDate(order.created_at || order.orderDate)}</p>
                            </div>
                            <div>
                                <p style={{ color: '#6b6b6b', fontSize: '0.9rem' }}>Status</p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    backgroundColor: order.order_status === 'completed' ? '#e8f5e9' : '#fff3e0',
                                    color: order.order_status === 'completed' ? '#2e7d32' : '#f57c00',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                }}>
                                    {order.order_status || 'Pending'}
                                </span>
                            </div>
                            <div>
                                <p style={{ color: '#6b6b6b', fontSize: '0.9rem' }}>Payment</p>
                                <span style={{
                                    textTransform: 'capitalize',
                                    color: order.payment_status === 'completed' ? '#2e7d32' : '#f57c00'
                                }}>
                                    {order.payment_status || 'Pending'} ({order.payment_method})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="order-items-section" style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Items</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {order.items && order.items.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: 'white', padding: '15px', border: '1px solid #f0f0f0' }}>
                                    {/* Placeholder for image if available, else generic */}
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                        IMG
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{item.name || item.product_name}</h3>
                                        <p style={{ color: '#6b6b6b', fontSize: '0.9rem' }}>
                                            Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'} | Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <div style={{ fontWeight: '500' }}>
                                        {formatPrice(item.price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-summary-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ width: '100%', maxWidth: '350px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#6b6b6b' }}>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#6b6b6b' }}>Shipping</span>
                                <span>{order.shipping_cost ? formatPrice(order.shipping_cost) : 'Free'}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #ddd', margin: '15px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.2rem' }}>
                                <span>Total</span>
                                <span style={{ color: '#6F3132' }}>{formatPrice(order.total_amount || order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Shipping Address</h3>
                        <p style={{ color: '#555', lineHeight: '1.6' }}>
                            {order.shipping_address}<br />
                            {order.city}, {order.state} - {order.pincode}<br />
                            Phone: {order.customer_phone}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
