# API Integration Guide

## Overview
The application is structured to easily switch from mock data to real backend API calls. All data fetching is centralized in the `productService.js` file.

## Current Status
- ✅ **Currently using mock data** - Everything works with dummy data
- ✅ **API-ready structure** - Just need to update configuration to switch to real API

## How to Switch to Real API

### Step 1: Update Configuration
Open `src/services/config.js` and modify:

```javascript
export const API_CONFIG = {
  USE_MOCK_DATA: false,  // Change to false
  API_BASE_URL: 'https://your-api-domain.com/api',  // Update with your backend URL
  // ... rest of config
};
```

Or set via environment variable:
```bash
# Create .env file in project root
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

### Step 2: Ensure Backend API Endpoints Match

Your backend API should provide the following endpoints:

#### 1. Fetch Products
```
GET /api/products?gender=men&category=shirts
GET /api/products?gender=women&category=blouses
```

**Expected Response Format:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "price": "₹2,500",
      "category": "shirts",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

Or simply return an array:
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "price": "₹2,500",
    "category": "shirts",
    "image": "https://example.com/image.jpg"
  }
]
```

#### 2. Fetch Product Detail
```
GET /api/products/mens-wear-1
GET /api/products/womens-wear-2
```

**Expected Response Format:**
```json
{
  "product": {
    "id": 1,
    "name": "Product Name",
    "category": "shirts",
    "gender": "men",
    "price": "₹2,500",
    "salePrice": null,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "sizes": [ "S", "M", "L"],
    "colors": ["White", "Blue"],
    "description": "Product description...",
    "details": "Product details...",
    "care": "Care instructions...",
    "sizeChart": {
      "top": [
        { "size": "XS", "chest": "40", "waist": "38", "hips": "40", "length": "28" }
      ]
    }
  }
}
```

Or return the product object directly:
```json
{
  "id": 1,
  "name": "Product Name",
  // ... all product fields
}
```

#### 3. Fetch Categories
```
GET /api/categories?gender=men
GET /api/categories?gender=women
```

**Expected Response Format:**
```json
{
  "categories": [
    {
      "id": "shirts",
      "name": "Shirts",
      "description": "Category description..."
    }
  ]
}
```

Or return an array directly:
```json
[
  {
    "id": "shirts",
    "name": "Shirts",
    "description": "Category description..."
  }
]
```

## Error Handling
The service includes automatic fallback to mock data if API calls fail. This ensures the application continues to work even if the backend is temporarily unavailable.

## Testing API Integration

1. **Keep mock data enabled** initially while testing
2. **Test with real API** by setting `USE_MOCK_DATA: false` and updating `API_BASE_URL`
3. **Check browser console** for any API errors
4. **Verify data format** matches expected structure

## File Structure

```
src/
  services/
    config.js          # API configuration (single place to update)
    productService.js  # All product data fetching logic
  pages/
    ShopMen.jsx        # Uses fetchProducts('men', category)
    ShopWomen.jsx      # Uses fetchProducts('women', category)
    ProductDetail.jsx  # Uses fetchProductDetail(slug)
```

## Key Functions

### `fetchProducts(gender, category)`
- Fetches list of products for a gender
- Optional category filter
- Returns array of product objects

### `fetchProductDetail(productSlug)`
- Fetches detailed product information
- Returns single product object or null

### `fetchCategories(gender)`
- Fetches categories for a gender
- Returns array of category objects

## Notes

- All API calls are asynchronous and use async/await
- Loading states are handled in components
- Error handling with fallback to mock data
- Service functions can be easily extended for additional endpoints
- Current implementation uses mock data but structure is API-ready

