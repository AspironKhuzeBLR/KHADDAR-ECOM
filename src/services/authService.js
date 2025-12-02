import { API_CONFIG } from './config';

const TOKEN_STORAGE_KEY = 'khaddar.auth.token';
const REFRESH_TOKEN_STORAGE_KEY = 'khaddar.auth.refreshToken';
const EMAIL_STORAGE_KEY = 'khaddar.auth.email';
const USER_STORAGE_KEY = 'khaddar.auth.user';
const SIGNUP_NAME_KEY = 'khaddar.signup.name';
const SIGNUP_EMAIL_KEY = 'khaddar.signup.email';

const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 10000;

const withTimeout = (promise, timeout = REQUEST_TIMEOUT) => {
  if (!timeout) {
    return promise;
  }
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

const buildUrl = (path) => {
  const baseUrl = API_CONFIG.API_BASE_URL;
  
  // Handle empty base URL (development with proxy)
  if (!baseUrl) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Handle full URL
  const base = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const parseErrorMessage = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    return data?.message || data?.error || 'Something went wrong. Please try again.';
  }
  const text = await response.text();
  return text || 'Something went wrong. Please try again.';
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const requestOtp = async (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/send-otp`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    }).then(handleResponse)
  );
};

export const verifyOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new Error('Email and OTP are required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/verify-otp`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    }).then(handleResponse)
  );
};

const isBrowser = typeof window !== 'undefined';

export const storeAuthToken = (token, refreshToken = null, user = null) => {
  if (!isBrowser) return;

  const normalizedUser =
    typeof user === 'string'
      ? { email: user }
      : user && typeof user === 'object'
        ? user
        : null;

  try {
    // Always use sessionStorage only
    if (token) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (refreshToken) {
      window.sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
      window.sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }

    if (normalizedUser) {
      const serialized = JSON.stringify(normalizedUser);
      window.sessionStorage.setItem(USER_STORAGE_KEY, serialized);
      if (normalizedUser.email) {
        window.sessionStorage.setItem(EMAIL_STORAGE_KEY, normalizedUser.email);
      } else {
        window.sessionStorage.removeItem(EMAIL_STORAGE_KEY);
      }
    } else {
      window.sessionStorage.removeItem(USER_STORAGE_KEY);
      window.sessionStorage.removeItem(EMAIL_STORAGE_KEY);
    }

    // Clean up any existing localStorage entries (one-time cleanup)
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to persist auth session', error);
  }
};

export const getStoredAuthToken = () => {
  if (!isBrowser) return null;
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
};

export const getStoredUser = () => {
  if (!isBrowser) return null;
  const stored = window.sessionStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to parse stored user profile', error);
    return null;
  }
};

export const getStoredEmail = () => {
  const storedUser = getStoredUser();
  if (storedUser?.email) {
    return storedUser.email;
  }
  if (!isBrowser) return null;
  return window.sessionStorage.getItem(EMAIL_STORAGE_KEY);
};

export const getStoredRefreshToken = () => {
  if (!isBrowser) return null;
  return window.sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

// Store signup data temporarily (until user logs in)
export const storeSignupData = (email, name) => {
  if (!isBrowser) return;
  try {
    if (email) {
      window.sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
    }
    if (name) {
      window.sessionStorage.setItem(SIGNUP_NAME_KEY, name);
    }
  } catch (error) {
    console.warn('Failed to store signup data', error);
  }
};

// Get stored signup name
export const getStoredSignupName = (email) => {
  if (!isBrowser) return null;
  try {
    const storedEmail = window.sessionStorage.getItem(SIGNUP_EMAIL_KEY);
    if (storedEmail === email) {
      return window.sessionStorage.getItem(SIGNUP_NAME_KEY);
    }
  } catch (error) {
    console.warn('Failed to get signup data', error);
  }
  return null;
};

// Clear signup data after successful login
export const clearSignupData = () => {
  if (!isBrowser) return;
  window.sessionStorage.removeItem(SIGNUP_NAME_KEY);
  window.sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
};

export const clearStoredAuth = () => {
  if (!isBrowser) return;
  // Clear sessionStorage only
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(EMAIL_STORAGE_KEY);
  window.sessionStorage.removeItem(USER_STORAGE_KEY);
  // Also clear localStorage as a safety measure (in case old data exists)
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
};

export const RESEND_COOLDOWN_SECONDS = 30;

// Get user profile
export const getUserProfile = async (token) => {
  if (!token) {
    throw new Error('Token is required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/profile`);
  return withTimeout(
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(handleResponse)
  );
};

// Get user orders
export const getUserOrders = async (token) => {
  if (!token) {
    throw new Error('Token is required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.ORDERS}`);
  return withTimeout(
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(handleResponse)
  );
};

// Sign in with email and password
export const signIn = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/login`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    }).then(handleResponse)
  );
};

// Signup after OTP verification
export const signup = async ({ name, address, password, email }) => {
  if (!name || !address || !password) {
    throw new Error('Name, address, and password are required.');
  }
  if (!email) {
    throw new Error('Email is required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/signup`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signup-email': email
      },
      body: JSON.stringify({ name, address, password })
    }).then(handleResponse)
  );
};

// Request password reset
export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/forgot-password`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    }).then(handleResponse)
  );
};

// Reset password with token
export const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new Error('Token and new password are required.');
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/reset-password`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    }).then(handleResponse)
  );
};


