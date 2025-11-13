import { API_CONFIG } from './config';

const TOKEN_STORAGE_KEY = 'khaddar.auth.token';
const EMAIL_STORAGE_KEY = 'khaddar.auth.email';
const USER_STORAGE_KEY = 'khaddar.auth.user';

const USE_MOCK_DATA = API_CONFIG.USE_MOCK_DATA;
const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 10000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  if (!path) return API_CONFIG.API_BASE_URL;
  try {
    return new URL(path, API_CONFIG.API_BASE_URL).toString();
  } catch (error) {
    const base = API_CONFIG.API_BASE_URL.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
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

const mockDatabase = {
  otpStore: new Map()
};

const generateMockOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const deriveNameFromEmail = (email) => {
  if (!email) return 'Khaddar Member';
  const localPart = email.split('@')[0] || '';
  const cleaned = localPart.replace(/[\W_]+/g, ' ').trim();
  if (!cleaned) return 'Khaddar Member';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const requestOtp = async (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  if (USE_MOCK_DATA) {
    await delay(800);
    const otp = generateMockOtp();
    mockDatabase.otpStore.set(email.toLowerCase(), otp);
    console.info('[Mock OTP]', email, otp);
    return { message: 'OTP sent successfully.' };
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/request-otp`);
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

  if (USE_MOCK_DATA) {
    await delay(600);
    const storedOtp = mockDatabase.otpStore.get(email.toLowerCase());
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid OTP. Please check and try again.');
    }
    mockDatabase.otpStore.delete(email.toLowerCase());
    // Mock JWT payload
    const token = `mock-jwt-token-${Date.now()}`;
    const name = deriveNameFromEmail(email);
    return { token, user: { email, name } };
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

export const storeAuthToken = (token, user = null) => {
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

export const clearStoredAuth = () => {
  if (!isBrowser) return;
  // Clear sessionStorage only
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(EMAIL_STORAGE_KEY);
  window.sessionStorage.removeItem(USER_STORAGE_KEY);
  // Also clear localStorage as a safety measure (in case old data exists)
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
};

export const RESEND_COOLDOWN_SECONDS = 30;

// Sign in with email and password
export const signIn = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  if (USE_MOCK_DATA) {
    await delay(800);
    // Mock validation - accept any password for demo
    const token = `mock-jwt-token-${Date.now()}`;
    const name = deriveNameFromEmail(email);
    return { token, user: { email, name } };
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/signin`);
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

// Complete signup after OTP verification
export const completeSignup = async ({ email, name, address, password, otp }) => {
  if (!email || !name || !address || !password || !otp) {
    throw new Error('All fields are required.');
  }

  if (USE_MOCK_DATA) {
    await delay(800);
    // Verify OTP first
    const storedOtp = mockDatabase.otpStore.get(email.toLowerCase());
    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid OTP. Please verify again.');
    }
    mockDatabase.otpStore.delete(email.toLowerCase());
    const token = `mock-jwt-token-${Date.now()}`;
    return { token, user: { email, name, address } };
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/complete-signup`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name, address, password, otp })
    }).then(handleResponse)
  );
};

// Request password reset
export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new Error('Email is required.');
  }

  if (USE_MOCK_DATA) {
    await delay(800);
    console.info('[Mock] Password reset link sent to', email);
    return { message: 'Password reset link sent to your email.' };
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
export const resetPassword = async ({ token, password, confirmPassword }) => {
  if (!token || !password || !confirmPassword) {
    throw new Error('Token, password, and confirmation are required.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  if (USE_MOCK_DATA) {
    await delay(800);
    console.info('[Mock] Password reset successful');
    return { message: 'Password reset successfully. Please sign in with your new password.' };
  }

  const url = buildUrl(`${API_CONFIG.ENDPOINTS.AUTH}/reset-password`);
  return withTimeout(
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password, confirmPassword })
    }).then(handleResponse)
  );
};


