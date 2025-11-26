/**
 * API Configuration
 * 
 * Backend API base URL configuration
 * Update BACKEND_BASE_URL or set REACT_APP_API_BASE_URL environment variable
 */

// Backend API Configuration
const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://apikhadar-production-9635.up.railway.app';

export const API_CONFIG = {
  // Backend API base URL
  API_BASE_URL: BACKEND_BASE_URL,
  
  // API endpoints (relative to base URL)
  ENDPOINTS: {
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:slug',
    CATEGORIES: '/categories',
    CART: '/cart',
    ORDERS: '/orders',
    AUTH: '/auth'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000
};

