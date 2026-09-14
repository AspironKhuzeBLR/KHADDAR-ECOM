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
import { supabase } from './supabaseClient';

const API_BASE_URL = API_CONFIG.API_BASE_URL;
const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 15000;

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

const buildUrl = (path, params = {}) => {
  let baseUrl;
  if (API_BASE_URL) {
    baseUrl = `${API_BASE_URL}${path}`;
  } else {
    baseUrl = path;
  }
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.error("BACKEND VALIDATION ERROR:", data); 
      throw new Error(data?.message || data?.error || JSON.stringify(data));
    }
    const text = await response.text();
    console.error("BACKEND ERROR TEXT:", text);
    throw new Error(`HTTP error ${response.status}: ${text}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

const getAdminToken = () => {
  return sessionStorage.getItem('adminToken');
};

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
    
    if (mainCategory && MAIN_CATEGORY_IDS[mainCategory]) {
        params.main_category = MAIN_CATEGORY_IDS[mainCategory];
    }
    if (category) {
        params.sub_category = category;
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
    
    const products = data.products || data.data || data || [];
    
    const apiPagination = data.pagination || {};
    const pagination = {
      page: apiPagination.currentPage || parseInt(page),
      limit: apiPagination.limit || parseInt(limit),
      total: apiPagination.totalProducts || products.length,
      totalPages: apiPagination.totalPages || 1,
      hasNextPage: apiPagination.hasNextPage || false,
      hasPrevPage: apiPagination.hasPrevPage || false
    };

    const transformedProducts = products.map(transformProduct);

    // Hide any product explicitly unpublished from the admin dashboard, and -
    // as an extra safety net - keep ToT out of the live/production build
    // while it stays visible during local development (npm start).
    const visibleProducts = transformedProducts.filter((p) => {
      if (!p.isLive) return false;
      if (process.env.NODE_ENV === 'production' && p.collection === 'tot') return false;
      return true;
    });

    return {
      products: visibleProducts,
      pagination
    };
    } catch (error) {
      console.error('Error fetching products:', error);
    throw error;
  }
};

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

export const fetchProductDetail = async (productSlugOrId) => {
  try {
    const isNumericId = /^\d+$/.test(productSlugOrId);
    
    if (isNumericId) {
      return await fetchProductById(productSlugOrId);
    }
    
    const idMatch = productSlugOrId.match(/[-_](\d+)$/);
    if (idMatch) {
      return await fetchProductById(idMatch[1]);
    }
    
    console.error('Could not determine product ID from:', productSlugOrId);
    return null;
  } catch (error) {
    console.error('Error fetching product detail:', error);
          return null;
  }
};

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

export const fetchCategoriesByGender = async (gender) => {
  try {
    const allCategories = await fetchCategories();
    
    const mainCategory = gender === 'men' ? "Men's Wear" : "Women's Wear";
    
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

export const addProduct = async (productData) => {
  const token = getAdminToken();
  try {
    const url = `${API_BASE_URL}/admin/products`;
    
    const isFormData = productData instanceof FormData;

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: isFormData ? productData : JSON.stringify(productData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Add Product Error:", error);
    throw error;
  }
};

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData) 
      })
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

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
    
    const transformedProducts = products.map(product => {
      const { mainCategory, subCategory } = extractCategories(product.categories);
      const { description: cleanDesc } = extractPiecesData(product.description);
      const totProductPrefix = /^tot\s*-\s*/i;
      return {
        id: product.id,
        name: (product.name || '').replace(totProductPrefix, '').trim(),
        category: mainCategory || product.main_category || "Men's Wear",
        subCategory: subCategory || product.sub_category || '',
        price: product.price,
        stock: product.stock || 0,
        image: product.images?.[0]?.image_url || product.image || '',
        images: product.images || [],
        description: cleanDesc,
        rawName: product.name || '',
        rawDescription: product.description || '',
        slug: product.slug || '',
        isFeatured: product.is_featured || false,
        isLive: !isMarkedHidden(product.description),
        sizes: product.sizes || [
          { size: 'S', stock: 0 },
          { size: 'M', stock: 0 },
          { size: 'L', stock: 0 },
          { size: 'XL', stock: 0 }
        ]
      };
    });

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
 * Threads of Travancore products are tagged in the admin panel's Collection
 * dropdown, stored internally as a "ToT - " name prefix.
 */
const TOT_PREFIX = /^tot\s*-\s*/i;

/**
 * A product can be hidden from customer-facing pages (while staying fully
 * editable/manageable in the admin dashboard) via a "[[HIDDEN]]" marker
 * appended to its description - toggled by the "Show product live on site"
 * checkbox in the admin dashboard's product form and product list.
 */
const HIDDEN_MARKER = /\n*\[\[HIDDEN\]\]/i;
const isMarkedHidden = (rawText) => /\[\[HIDDEN\]\]/i.test(rawText || '');

/**
 * Set/piece pricing is encoded invisibly in the description field as
 * [[PIECES_DATA:{...}]]  This extracts it and returns a clean description.
 */
const extractPiecesData = (rawDescription) => {
  const description = (rawDescription || '').replace(HIDDEN_MARKER, '').trim();
  const match = description.match(/\[\[PIECES_DATA:(.*?)\]\]/s);
  if (!match) {
    return { description, pieces: null, fullSetPrice: null };
  }
  let parsed = null;
  try {
    // Base64-decoded format (current)
    parsed = JSON.parse(decodeURIComponent(escape(atob(match[1]))));
  } catch (e) {
    // Fallback: older plain-JSON format, in case any products were saved before this fix
    try {
      parsed = JSON.parse(match[1]);
    } catch (e2) {
      parsed = null;
    }
  }
  return {
    description: description.replace(/\[\[PIECES_DATA:.*?\]\]/s, '').trim(),
    pieces: parsed?.pieces || null,
    fullSetPrice: parsed?.fullSet ?? null
  };
};

const transformProduct = (product) => {
  const { mainCategory, subCategory } = extractCategories(product.categories);
  const rawName = product.name || '';
  const isTot = TOT_PREFIX.test(rawName);
  const { description, pieces, fullSetPrice } = extractPiecesData(product.description);

  return {
    id: product.id,
    name: rawName.replace(TOT_PREFIX, '').trim(),
    collection: isTot ? 'tot' : 'kok',
    isLive: !isMarkedHidden(product.description),
    price: formatPrice(product.price),
    priceRaw: product.price,
    category: subCategory || product.sub_category || '',
    mainCategory: mainCategory || product.main_category || '',
    image: product.images?.[0]?.image_url || product.image || '',
    images: product.images || [],
    stock: product.stock || 0,
    inStock: (product.stock || 0) > 0,
    slug: product.slug || `product-${product.id}`,
    description: description,
    pieces: pieces,
    fullSetPrice: fullSetPrice,
    isFeatured: product.is_featured || false
  };
};

const transformProductDetail = (product) => {
  if (!product) return null;
  
  const { mainCategory, subCategory } = extractCategories(product.categories);
  const images = product.images?.map(img => img.image_url) || [product.image].filter(Boolean);
  const resolvedMainCategory = mainCategory || product.main_category || '';
  const gender = resolvedMainCategory === "Men's Wear" ? 'men' : 'women';
    const menSizeChart = {
    top: [
      { size: 'S', chest: '36', waist: '34' },
      { size: 'M', chest: '38', waist: '36' },
      { size: 'L', chest: '40', waist: '38' },
      { size: 'XL', chest: '42', waist: '40' },
      {size: 'XXL', chest: '---', waist: '42'}
    ]
  };

  const womenSizeChart = {
    top: [
      { size: 'S', chest: '34', waist: '30' },
      { size: 'M', chest: '36', waist: '32' },
      { size: 'L', chest: '38', waist: '34' },
      { size: 'XL', chest: '40', waist: '36' }
    ]
  };

  const { description, pieces, fullSetPrice } = extractPiecesData(product.description);

  return {
    id: product.id,
    name: (product.name || '').replace(TOT_PREFIX, '').trim(),
    collection: TOT_PREFIX.test(product.name || '') ? 'tot' : 'kok',
    isLive: !isMarkedHidden(product.description),
    category: subCategory || product.sub_category || '',
    mainCategory: resolvedMainCategory,
    gender: resolvedMainCategory === "Men's Wear" ? 'men' : 'women',
    price: formatPrice(product.price),
    priceRaw: product.price,
    salePrice: product.sale_price ? formatPrice(product.sale_price) : null,
    images: images,
    image: images[0] || '',
    sizes: product.sizes || ['S', 'M', 'L', 'XL'],
    colors: product.colors || ['Default'],
    description: description,
    pieces: pieces,
    fullSetPrice: fullSetPrice,
    details: product.details || 'Handwoven Fabric and Organic Cotton',
    care: product.care || 'Hand wash with mild detergent. Dry inside out in shade.',
    stock: product.stock || 0,
    inStock: (product.stock || 0) > 0,
    slug: product.slug || '',
    isFeatured: product.is_featured || false,
   sizeChart: product.size_chart || (gender === 'men' ? menSizeChart : womenSizeChart)
  };
};

const formatPrice = (price) => {
  if (typeof price === 'string' && price.includes('₹')) {
    return price;
  }
  const numPrice = parseFloat(price) || 0;
  return `₹${numPrice.toLocaleString('en-IN')}`;
};

export const expandProductsWithPieces = (products) => {
  const expanded = [];
  products.forEach((product) => {
    expanded.push(product);
    if (product.pieces && product.pieces.length > 0) {
      product.pieces.forEach((piece) => {
        expanded.push({
          ...product,
          virtualId: `${product.id}-piece-${piece.label.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${product.name} - ${piece.label}`,
          price: formatPrice(piece.price),
          priceRaw: piece.price,
          category: piece.label, // e.g. a "Trousers" piece is filterable under "Trousers", not the parent's own category (e.g. "Co-ords")
          isPieceVariant: true,
          pieceLabel: piece.label
        });
      });
    }
  });
  return expanded;
};

export const uploadImageToSupabase = async (file) => {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    
    const filePath = `product images/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed: ' + error.message);
  }
};