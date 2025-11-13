/**
 * Product Service - Handles all product data fetching
 * 
 * HOW TO SWITCH TO REAL API:
 * 1. Open src/services/config.js
 * 2. Set USE_MOCK_DATA to false
 * 3. Update API_BASE_URL with your backend URL
 * 4. Ensure your backend API endpoints match the expected format:
 *    - GET /api/products?gender=men&category=shirts (optional category)
 *    - GET /api/products/:slug (product detail)
 *    - GET /api/categories?gender=men
 * 
 * The service will automatically use real API calls once USE_MOCK_DATA is false.
 * Mock data is kept as fallback for error handling.
 */

import { API_CONFIG } from './config';
import { getStoredAuthToken } from './authService';

// Mock product database - This will be replaced with API calls later
const MOCK_PRODUCTS_MEN = [
  { id: 1, name: 'Classic White Shirt', price: '₹2,500', category: 'shirts', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Linen Trousers', price: '₹3,200', category: 'trousers', image: 'https://images.unsplash.com/photo-1624378515199-9a1fd46859f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Cotton Co-ord Set', price: '₹4,500', category: 'co-ords', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Blazer Jacket', price: '₹6,500', category: 'blazers-jackets', image: 'https://images.unsplash.com/photo-1594938291221-94fa82b6e683?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Handwoven Kurta', price: '₹3,800', category: 'kurtas', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Denim Shirt', price: '₹2,800', category: 'shirts', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
];

const MOCK_PRODUCTS_WOMEN = [
  { id: 1, name: 'Embroidered Blouse', price: '₹2,800', category: 'blouses', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Linen Skirt', price: '₹3,500', category: 'skirts-trousers', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Cotton Co-ord Set', price: '₹4,800', category: 'co-ords', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Tailored Blazer', price: '₹6,200', category: 'blazers-jackets', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Handwoven Kurta', price: '₹3,600', category: 'kurtas', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Elegant Dress', price: '₹5,500', category: 'dresses', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Silk Saree', price: '₹8,500', category: 'sarees', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { id: 8, name: 'Classic Blouse', price: '₹2,500', category: 'blouses', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
];

// Mock detailed product data
const MOCK_PRODUCT_DETAILS = {
  'mens-wear-1': {
    id: 1,
    name: 'Classic White Shirt',
    category: 'shirts',
    gender: 'men',
    price: '₹2,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1624378515199-9a1fd46859f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Beige'],
    description: 'A classic white shirt crafted with premium sustainable fabrics for timeless elegance. Perfect for both formal and casual occasions.',
    details: 'Organic Cotton and Handwoven Fabric',
    care: 'Hand wash with mild detergent. Dry inside out in shade to prevent lightening.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
        { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
        { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
        { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
      ]
    }
  },
  'mens-wear-2': {
    id: 2,
    name: 'Linen Trousers',
    category: 'trousers',
    gender: 'men',
    price: '₹3,200',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1624378515199-9a1fd46859f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Beige', 'Black'],
    description: 'Tailored linen trousers in sustainable fabrics, perfect for both formal and casual occasions. Comfortable and stylish.',
    details: 'Organic Linen and Natural Dyes',
    care: 'Hand wash with mild detergent. Dry flat in shade.',
    sizeChart: {
      bottom: [
        { size: 'XS', waist: '30', hips: '38', length: '39' },
        { size: 'S', waist: '32', hips: '40', length: '40' },
        { size: 'M', waist: '34', hips: '42', length: '41' },
        { size: 'L', waist: '36', hips: '44', length: '42' }
      ]
    }
  },
  // Add default product structure for other products
  'mens-wear-3': {
    id: 3,
    name: 'Cotton Co-ord Set',
    category: 'co-ords',
    gender: 'men',
    price: '₹4,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Cotton Co-ord Set crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
        { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
        { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
        { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
      ]
    }
  },
  'mens-wear-4': {
    id: 4,
    name: 'Blazer Jacket',
    category: 'blazers-jackets',
    gender: 'men',
    price: '₹6,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1594938291221-94fa82b6e683?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1594938291221-94fa82b6e683?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Blazer Jacket crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
        { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
        { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
        { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
      ]
    }
  },
  'mens-wear-5': {
    id: 5,
    name: 'Handwoven Kurta',
    category: 'kurtas',
    gender: 'men',
    price: '₹3,800',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Handwoven Kurta crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
        { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
        { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
        { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
      ]
    }
  },
  'mens-wear-6': {
    id: 6,
    name: 'Denim Shirt',
    category: 'shirts',
    gender: 'men',
    price: '₹2,800',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Denim Shirt crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '40', waist: '38', hips: '40', length: '28' },
        { size: 'S', chest: '42', waist: '40', hips: '42', length: '29' },
        { size: 'M', chest: '44', waist: '42', hips: '44', length: '30' },
        { size: 'L', chest: '46', waist: '44', hips: '46', length: '31' }
      ]
    }
  },
  'womens-wear-1': {
    id: 1,
    name: 'Embroidered Blouse',
    category: 'blouses',
    gender: 'women',
    price: '₹2,800',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['White', 'Ivory', 'Beige'],
    description: 'Elegant blouse with intricate embroidery details, crafted from premium sustainable fabrics. Perfect for special occasions.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  },
  'womens-wear-2': {
    id: 2,
    name: 'Linen Skirt',
    category: 'skirts-trousers',
    gender: 'women',
    price: '₹3,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Navy', 'Beige', 'Olive'],
    description: 'Flowing skirt with elegant drape, crafted from premium linen. Comfortable and refined style.',
    details: 'Organic Linen and Natural Dyes',
    care: 'Hand wash with mild detergent. Dry flat in shade.',
    sizeChart: {
      bottom: [
        { size: 'XS', waist: '28', hips: '36', length: '38' },
        { size: 'S', waist: '30', hips: '38', length: '39' },
        { size: 'M', waist: '32', hips: '40', length: '40' },
        { size: 'L', waist: '34', hips: '42', length: '41' }
      ]
    }
  },
  'womens-wear-3': {
    id: 3,
    name: 'Cotton Co-ord Set',
    category: 'co-ords',
    gender: 'women',
    price: '₹4,800',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Cotton Co-ord Set crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  },
  'womens-wear-4': {
    id: 4,
    name: 'Tailored Blazer',
    category: 'blazers-jackets',
    gender: 'women',
    price: '₹6,200',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Tailored Blazer crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  },
  'womens-wear-5': {
    id: 5,
    name: 'Handwoven Kurta',
    category: 'kurtas',
    gender: 'women',
    price: '₹3,600',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Handwoven Kurta crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  },
  'womens-wear-6': {
    id: 6,
    name: 'Elegant Dress',
    category: 'dresses',
    gender: 'women',
    price: '₹5,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Elegant Dress crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  },
  'womens-wear-7': {
    id: 7,
    name: 'Silk Saree',
    category: 'sarees',
    gender: 'women',
    price: '₹8,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['One Size'],
    colors: ['Default'],
    description: 'Silk Saree crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: null
  },
  'womens-wear-8': {
    id: 8,
    name: 'Classic Blouse',
    category: 'blouses',
    gender: 'women',
    price: '₹2,500',
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Default'],
    description: 'Classic Blouse crafted with premium sustainable fabrics for timeless elegance.',
    details: 'Handwoven Fabric and Organic Cotton',
    care: 'Hand wash with mild detergent. Dry inside out in shade.',
    sizeChart: {
      top: [
        { size: 'XS', chest: '38', waist: '36', hips: '38', length: '26' },
        { size: 'S', chest: '40', waist: '38', hips: '40', length: '27' },
        { size: 'M', chest: '42', waist: '40', hips: '42', length: '28' },
        { size: 'L', chest: '44', waist: '42', hips: '44', length: '29' }
      ]
    }
  }
};

// Configuration: Set to false when ready to use real API
const USE_MOCK_DATA = API_CONFIG.USE_MOCK_DATA;
const API_BASE_URL = API_CONFIG.API_BASE_URL;

/**
 * Fetch products for a specific gender
 * @param {string} gender - 'men' or 'women'
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of products
 */
export const fetchProducts = async (gender, category = null) => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const products = gender === 'men' ? MOCK_PRODUCTS_MEN : MOCK_PRODUCTS_WOMEN;
    
    if (category) {
      return products.filter(product => product.category === category);
    }
    
    return products;
  } else {
    // Real API call - Replace this when backend is ready
    try {
      const url = `${API_BASE_URL}/products?gender=${gender}${category ? `&category=${category}` : ''}`;
      const token = getStoredAuthToken();
      const response = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {}
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      return data.products || data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data on error
      const products = gender === 'men' ? MOCK_PRODUCTS_MEN : MOCK_PRODUCTS_WOMEN;
      return category ? products.filter(p => p.category === category) : products;
    }
  }
};

/**
 * Fetch product detail by slug
 * @param {string} productSlug - Product slug (e.g., 'mens-wear-1')
 * @returns {Promise<Object|null>} Product detail object or null if not found
 */
export const fetchProductDetail = async (productSlug) => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return MOCK_PRODUCT_DETAILS[productSlug] || null;
  } else {
    // Real API call - Replace this when backend is ready
    try {
      const url = `${API_BASE_URL}/products/${productSlug}`;
      const token = getStoredAuthToken();
      const response = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {}
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch product detail');
      }
      
      const data = await response.json();
      return data.product || data;
    } catch (error) {
      console.error('Error fetching product detail:', error);
      // Fallback to mock data on error
      return MOCK_PRODUCT_DETAILS[productSlug] || null;
    }
  }
};

/**
 * Fetch categories for a specific gender
 * @param {string} gender - 'men' or 'women'
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategories = async (gender) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (gender === 'men') {
      return [
        { id: 'shirts', name: 'Shirts', description: 'Classic and contemporary shirts crafted with premium fabrics for timeless elegance.' },
        { id: 'trousers', name: 'Trousers', description: 'Tailored trousers in sustainable fabrics, perfect for both formal and casual occasions.' },
        { id: 'co-ords', name: 'Co-ords', description: 'Coordinated sets that seamlessly blend comfort with sophisticated style.' },
        { id: 'blazers-jackets', name: 'Blazers / Jackets', description: 'Structured blazers and versatile jackets designed for modern sophistication.' },
        { id: 'kurtas', name: 'Kurtas', description: 'Handwoven kurtas celebrating traditional craftsmanship with contemporary aesthetics.' }
      ];
    } else {
      return [
        { id: 'blouses', name: 'Blouses', description: 'Elegant blouses with intricate details, crafted from premium sustainable fabrics.' },
        { id: 'skirts-trousers', name: 'Skirts/ Trousers', description: 'Flowing skirts and tailored trousers that combine comfort with refined style.' },
        { id: 'co-ords', name: 'Co-ords', description: 'Perfectly coordinated sets that offer effortless elegance and modern sophistication.' },
        { id: 'blazers-jackets', name: 'Blazers/ Jackets', description: 'Structured blazers and versatile jackets for contemporary power dressing.' },
        { id: 'kurtas', name: 'Kurtas', description: 'Traditional kurtas reimagined with modern silhouettes and sustainable craftsmanship.' },
        { id: 'dresses', name: 'Dresses', description: 'Timeless dresses that celebrate feminine elegance and sustainable design.' },
        { id: 'sarees', name: 'Sarees', description: 'Handwoven sarees honoring traditional artistry with contemporary elegance.' }
      ];
    }
  } else {
    // Real API call
    try {
      const url = `${API_BASE_URL}/categories?gender=${gender}`;
      const token = getStoredAuthToken();
      const response = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {}
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      return data.categories || data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array on error
      return [];
    }
  }
};

