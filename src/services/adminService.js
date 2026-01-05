/**
 * Admin Service - Handles admin dashboard and order management
 * 
 * Endpoints:
 * - PUT /orders/:id/status - Update order status
 * - GET /admin/orders/all - Get all orders
 * - GET /admin/dashboard/recent-orders - Get recent orders
 * - GET /admin/dashboard/summary - Get dashboard summary
 * - GET /admin/dashboard/comprehensive - Get comprehensive dashboard stats
 * - GET /admin/dashboard/revenue-analytics - Get revenue analytics
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

// Helper: Get admin token
const getAdminToken = () => {
    const token = sessionStorage.getItem('adminToken') ||
        sessionStorage.getItem('khaddar.auth.token') ||
        sessionStorage.getItem('token');
    console.log('getAdminToken returning:', token);
    return token;
};

// Helper: Handle API response
const handleResponse = async (response) => {
    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            throw new Error(data?.message || data?.error || `HTTP error ${response.status}`);
        }
        throw new Error(`HTTP error ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status (e.g., 'completed')
 * @returns {Promise<Object>} API response
 */
export const updateOrderStatus = async (orderId, status) => {
  const token = getAdminToken();
  try {
    // FIX: Explicitly add /api before /orders
    // The browser was hitting: http://localhost:3000/orders
    // The backend wants: http://localhost:3000/api/orders
    const url = `${API_BASE_URL}/api/orders/${orderId}/status`; 

    console.log(`Updating order status:`, { orderId, status, url });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Ensure the key is 'order_status' and value is 'completed'
      body: JSON.stringify({ order_status: status }) 
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get all orders (Admin)
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>} List of all orders
 */
export const getAllOrders = async (page = 1, limit = 10) => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ADMIN_ORDERS}/all`;
        let url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const queryParams = new URLSearchParams({ page, limit });
        url = `${url}?${queryParams.toString()}`;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};

/**
 * Get recent orders
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>} Recent orders
 */
export const getRecentOrders = async (page = 1, limit = 5) => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD}/recent-orders`;
        let url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const queryParams = new URLSearchParams({ page, limit });
        url = `${url}?${queryParams.toString()}`;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        throw error;
    }
};

/**
 * Get dashboard summary
 * @returns {Promise<Object>} Dashboard summary stats
 */
export const getDashboardSummary = async () => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD}/summary`;
        const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }
};

/**
 * Get comprehensive dashboard stats
 * @returns {Promise<Object>} Comprehensive stats
 */
export const getDashboardComprehensive = async () => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD}/comprehensive`;
        const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching comprehensive stats:', error);
        throw error;
    }
};

/**
 * Get revenue analytics
 * @param {number} year - Year to fetch analytics for
 * @returns {Promise<Object>} Revenue analytics data
 */
export const getRevenueAnalytics = async (year = new Date().getFullYear()) => {
    try {
        const path = `${API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD}/revenue-analytics`;
        let url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

        const queryParams = new URLSearchParams({ year });
        url = `${url}?${queryParams.toString()}`;

        const response = await withTimeout(
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAdminToken()}`
                }
            })
        );

        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        throw error;
    }
};
