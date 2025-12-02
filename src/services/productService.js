/**
 * Product Service - Handles all product data fetching
 * 
 * API Endpoints:
 * - GET /products?page=1&limit=5 - Get all products with pagination
 * - GET /products?category=4&page=1&limit=6 - Filter by category
 * - GET /products?in_stock_only=true&page=2&limit=8 - Filter by stock
 * - GET /products?category=1&in_stock_only=true&page=1&limit=6 - Combined filters
 * - GET /products/:id - Get product by ID
 * - GET /categories - Get all categories
 * 
 * Admin Endpoints:
 * - POST /admin/products - Add new product
 * - PUT /admin/products/:id - Update product
 * - DELETE /admin/products/:id - Delete product
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

// Helper: Build URL with query parameters
const buildUrl = (path, params = {}) => {
  // Handle both absolute URLs and relative paths (for proxy)
  let baseUrl;
  if (API_BASE_URL) {
    baseUrl = `${API_BASE_URL}${path}`;
  } else {
    // In development with proxy, use relative path
    baseUrl = path;
  }
  
  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
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

// Helper: Get admin token
const getAdminToken = () => {
  return sessionStorage.getItem('adminToken');
};

/**
 * Fetch products with pagination and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 12)
 * @param {number|string} options.category - Category ID to filter by
 * @param {boolean} options.inStockOnly - Filter only in-stock products
 * @param {string} options.mainCategory - Main category filter (Men's Wear, Women's Wear)
 * @returns {Promise<Object>} { products: [], pagination: { page, limit, total, totalPages } }
 */
// Main category IDs (from API)
const MAIN_CATEGORY_IDS = {
  "Men's Wear": 1,
  "Women's Wear": 4
};

export const fetchProducts = async (options = {}) => {
  const {
    page = API_CONFIG.DEFAULT_PAGE,
    limit = API_CONFIG.DEFAULT_LIMIT,
    category = null,
    inStockOnly = false,
    mainCategory = null
  } = options;

  try {
    const params = {
      page,
      limit
    };
    
    // If a specific sub-category is selected, use it
    // Otherwise, if mainCategory is specified, use the main category ID
    if (category) {
      params.category = category;
    } else if (mainCategory && MAIN_CATEGORY_IDS[mainCategory]) {
      params.category = MAIN_CATEGORY_IDS[mainCategory];
    }

    if (inStockOnly) {
      params.in_stock_only = 'true';
    }

    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS, params);
    
    const response = await withTimeout(
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    const data = await handleResponse(response);
    
    // Transform API response to consistent format
    const products = data.products || data.data || data || [];
    
    // Normalize pagination format (API uses currentPage, we normalize to page)
    const apiPagination = data.pagination || {};
    const pagination = {
      page: apiPagination.currentPage || parseInt(page),
      limit: apiPagination.limit || parseInt(limit),
      total: apiPagination.totalProducts || products.length,
      totalPages: apiPagination.totalPages || 1,
      hasNextPage: apiPagination.hasNextPage || false,
      hasPrevPage: apiPagination.hasPrevPage || false
    };

    // Transform product data to match frontend expectations
    const transformedProducts = products.map(transformProduct);

    return {
      products: transformedProducts,
      pagination
    };
    } catch (error) {
      console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch product by ID
 * @param {number|string} productId - Product ID
 * @returns {Promise<Object>} Product detail object
 */
export const fetchProductById = async (productId) => {
  try {
    const path = `${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`;
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    
    const response = await withTimeout(
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    const data = await handleResponse(response);
    const product = data.product || data.data || data;
    
    return transformProductDetail(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Fetch product detail by slug or ID
 * Supports both numeric IDs and string slugs
 * @param {string|number} productSlugOrId - Product slug or ID
 * @returns {Promise<Object|null>} Product detail object or null if not found
 */
export const fetchProductDetail = async (productSlugOrId) => {
  try {
    // Check if it's a numeric ID (either number or string of digits)
    const isNumericId = /^\d+$/.test(productSlugOrId);
    
    if (isNumericId) {
      // Fetch directly by ID
      return await fetchProductById(productSlugOrId);
    }
    
    // Try to extract ID from slug patterns like 'mens-wear-21' or 'product-21'
    const idMatch = productSlugOrId.match(/[-_](\d+)$/);
    if (idMatch) {
      return await fetchProductById(idMatch[1]);
    }
    
    // If no ID found, the slug might be the actual product slug from API
    // Try fetching all products and finding by slug (fallback)
    // For now, return null - products should use ID-based URLs
    console.error('Could not determine product ID from:', productSlugOrId);
    return null;
  } catch (error) {
    console.error('Error fetching product detail:', error);
          return null;
  }
};

/**
 * Fetch all categories
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategories = async () => {
  try {
    const path = API_CONFIG.ENDPOINTS.CATEGORIES;
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    
    const response = await withTimeout(
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    const data = await handleResponse(response);
    return data.categories || data.data || data || [];
    } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch categories filtered by main category (for sidebar navigation)
 * @param {string} gender - 'men' or 'women' to filter categories
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategoriesByGender = async (gender) => {
  try {
    const allCategories = await fetchCategories();
    
    // Map gender to main_category
    const mainCategory = gender === 'men' ? "Men's Wear" : "Women's Wear";
    
    // Filter categories by main_category if the data includes it
    // Otherwise return all categories
    const filteredCategories = allCategories.filter(cat => {
      if (cat.main_category) {
        return cat.main_category === mainCategory;
      }
      return true;
    });

    return filteredCategories.map(cat => ({
      id: cat.id,
      name: cat.name || cat.sub_category,
      description: cat.description || ''
    }));
    } catch (error) {
    console.error('Error fetching categories by gender:', error);
      return [];
    }
};

// ============================================
// ADMIN API FUNCTIONS
// ============================================

/**
 * Add a new product (Admin)
 * @param {Object} productData - Product data to add
 * @returns {Promise<Object>} Created product
 */
export const addProduct = async (productData) => {
  const token = getAdminToken();
  
  try {
    const path = API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS;
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    
    const response = await withTimeout(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formatProductForAPI(productData))
      })
    );

    const data = await handleResponse(response);
    return data.product || data.data || data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update a product (Admin)
 * @param {number|string} productId - Product ID to update
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export const updateProduct = async (productId, productData) => {
  const token = getAdminToken();
  
  try {
    const path = `${API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS}/${productId}`;
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    
    const response = await withTimeout(
      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formatProductForAPI(productData))
      })
    );

    const data = await handleResponse(response);
    return data.product || data.data || data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product (Admin)
 * @param {number|string} productId - Product ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteProduct = async (productId) => {
  const token = getAdminToken();
  
  try {
    const path = `${API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS}/${productId}`;
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    
    const response = await withTimeout(
      fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
    );

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Fetch all products for admin (with pagination)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} { products: [], pagination: {} }
 */
export const fetchAdminProducts = async (options = {}) => {
  const {
    page = 1,
    limit = 50
  } = options;

  try {
    const params = { page, limit };
    const url = buildUrl(API_CONFIG.ENDPOINTS.PRODUCTS, params);
    
    const response = await withTimeout(
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    const data = await handleResponse(response);
    const products = data.products || data.data || data || [];
    
    // Transform for admin display
    const transformedProducts = products.map(product => {
      const { mainCategory, subCategory } = extractCategories(product.categories);
      return {
        id: product.id,
        name: product.name,
        category: mainCategory || product.main_category || "Men's Wear",
        subCategory: subCategory || product.sub_category || '',
        price: product.price,
        stock: product.stock || 0,
        image: product.images?.[0]?.image_url || product.image || '',
        description: product.description || '',
        slug: product.slug || '',
        isFeatured: product.is_featured || false
      };
    });

    // Normalize pagination
    const apiPagination = data.pagination || {};
    return {
      products: transformedProducts,
      pagination: {
        page: apiPagination.currentPage || page,
        limit: apiPagination.limit || limit,
        total: apiPagination.totalProducts || products.length,
        totalPages: apiPagination.totalPages || 1
      }
    };
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract main and sub category from categories array
 */
const extractCategories = (categories) => {
  if (!categories || !Array.isArray(categories)) {
    return { mainCategory: '', subCategory: '' };
  }
  
  const mainCat = categories.find(c => c.type === 'main');
  const subCat = categories.find(c => c.type === 'sub');
  
  return {
    mainCategory: mainCat?.name || '',
    subCategory: subCat?.name || ''
  };
};

/**
 * Transform API product to frontend format
 */
const transformProduct = (product) => {
  const { mainCategory, subCategory } = extractCategories(product.categories);
  
  return {
    id: product.id,
    name: product.name,
    price: formatPrice(product.price),
    priceRaw: product.price,
    category: subCategory || product.sub_category || '',
    mainCategory: mainCategory || product.main_category || '',
    image: product.images?.[0]?.image_url || product.image || '',
    images: product.images || [],
    stock: product.stock || 0,
    inStock: (product.stock || 0) > 0,
    slug: product.slug || `product-${product.id}`,
    description: product.description || '',
    isFeatured: product.is_featured || false
  };
};

/**
 * Transform API product detail to frontend format
 */
const transformProductDetail = (product) => {
  if (!product) return null;
  
  const { mainCategory, subCategory } = extractCategories(product.categories);
  const images = product.images?.map(img => img.image_url) || [product.image].filter(Boolean);
  const resolvedMainCategory = mainCategory || product.main_category || '';
  
  return {
    id: product.id,
    name: product.name,
    category: subCategory || product.sub_category || '',
    mainCategory: resolvedMainCategory,
    gender: resolvedMainCategory === "Men's Wear" ? 'men' : 'women',
    price: formatPrice(product.price),
    priceRaw: product.price,
    salePrice: product.sale_price ? formatPrice(product.sale_price) : null,
    images: images,
    image: images[0] || '',
    sizes: product.sizes || ['XS', 'S', 'M', 'L', 'XL'],
    colors: product.colors || ['Default'],
    description: product.description || '',
    details: product.details || 'Handwoven Fabric and Organic Cotton',
    care: product.care || 'Hand wash with mild detergent. Dry inside out in shade.',
    stock: product.stock || 0,
    inStock: (product.stock || 0) > 0,
    slug: product.slug || '',
    isFeatured: product.is_featured || false,
    sizeChart: product.size_chart || {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' },
        { size: 'XL', chest: '46', waist: '44', hips: '46', length: '30' }
      ]
    }
  };
};

/**
 * Format product data for API submission
 */
const formatProductForAPI = (product) => {
  const apiProduct = {
    name: product.name,
    description: product.description || '',
    price: parseFloat(product.price) || 0,
    stock: parseInt(product.stock) || 0,
    main_category: product.category || product.main_category || "Men's Wear",
    sub_category: product.subCategory || product.sub_category || ''
  };

  // Handle images
  if (product.image || product.images) {
    const imageUrl = product.image || product.images?.[0]?.image_url || product.images?.[0];
    if (imageUrl) {
      apiProduct.images = [{
        image_url: imageUrl,
        alt_text: product.name,
        sort_order: 1
      }];
    }
  }

  // Include slug if updating
  if (product.slug) {
    apiProduct.slug = product.slug;
  }

  return apiProduct;
};

/**
 * Format price to Indian Rupee format
 */
const formatPrice = (price) => {
  if (typeof price === 'string' && price.includes('₹')) {
    return price;
  }
  const numPrice = parseFloat(price) || 0;
  return `₹${numPrice.toLocaleString('en-IN')}`;
};
