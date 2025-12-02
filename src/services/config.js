/**
 * API Configuration
 * 
 * Backend API base URL configuration
 * Update BACKEND_BASE_URL or set REACT_APP_API_BASE_URL environment variable
 * 
 * In development, the proxy in package.json handles CORS
 * In production, we use the full URL
 */

// Backend API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (isDevelopment ? '' : 'https://djbudi2bkm.us-east-1.awsapprunner.com');

export const API_CONFIG = {
  // Backend API base URL
  API_BASE_URL: BACKEND_BASE_URL,
  
  // API endpoints (relative to base URL)
  ENDPOINTS: {
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    CATEGORIES: '/categories',
    CART: '/cart',
    ORDERS: '/orders',
    AUTH: '/auth',
    // Admin endpoints
    ADMIN_PRODUCTS: '/admin/products'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 15000,
  
  // Default pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12
};

