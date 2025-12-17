/**
 * Order Service - Handles order placement, payment, and history
 * 
 * Endpoints:
 * - POST /orders - Create new order
 * - POST /orders/:id/pay - Submit payment details
 * - GET /orders/my-orders - Get user's order history
 * - GET /orders/:id - Get specific order details
 */

import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.API_BASE_URL;
const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 15000;

// Helper: Add timeout to fetch requests
const withTimeout = (promise, timeout = REQUEST_TIMEOUT) => {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error('Request timed out. Please try again.'));
        }, timeout);
    });

    return Promise.race([
        promise.finally(() => clearTimeout(timeoutHandle)),
        timeoutPromise
    ]);
};

// Helper: Handle API response
const handleResponse = async (response) => {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.error('API Error JSON:', data);
            throw new Error(data?.message || data?.error || JSON.stringify(data) || `HTTP error ${response.status}`);
        }
        const text = await response.text();
        console.error('API Error Text:', text);
        throw new Error(text || `HTTP error ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
};

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Created order response
 */
export const createOrder = async (orderData) => {
    try {
        const path = API_CONFIG.ENDPOINTS.ORDERS;
        const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const token = sessionStorage.getItem('khaddar.auth.token') || sessionStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await withTimeout(
            fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData)
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

/**
 * Submit payment for an order
 * @param {string} orderId - Order ID
 * @param {Object} paymentData - Payment details (e.g., transaction_id)
 * @returns {Promise<Object>} Payment confirmation
 */
export const submitPayment = async (orderId, paymentData) => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/pay`;
        const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const response = await withTimeout(
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error submitting payment:', error);
        throw error;
    }
};

/**
 * Get user's order history
 * @param {string} email - User email
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} List of orders
 */
export const getMyOrders = async (email, page = 1, limit = 10) => {
    try {
        // Construct URL with query params
        const path = `${API_CONFIG.ENDPOINTS.ORDERS}/my-orders`;
        let url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const queryParams = new URLSearchParams({
            email,
            page,
            limit
        });

        url = `${url}?${queryParams.toString()}`;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

/**
 * Get order details by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId) => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`;
        const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};
