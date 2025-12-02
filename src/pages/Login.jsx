import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { signIn, getStoredSignupName, clearSignupData } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login, isBootstrapped } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isBootstrapped) return;
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isBootstrapped, navigate]);

  const deriveNameFromEmail = (value) => {
    if (!value) return 'Khaddar Member';
    const localPart = value.split('@')[0] || '';
    const cleaned = localPart.replace(/[\W_]+/g, ' ').trim();
    if (!cleaned) return 'Khaddar Member';
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);

    try {
      const result = await signIn({ email, password });
      
      // Decode JWT to extract email and role
      let userEmail = email;
      let userRole = 'user';
      
      if (result.accessToken) {
        try {
          const base64Url = result.accessToken.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userEmail = decoded.email || email;
            userRole = decoded.role || result?.role || result?.user?.role || 'user';
          }
        } catch (e) {
          // If decoding fails, use provided email and check response
          userEmail = email;
          userRole = result?.role || result?.user?.role || 'user';
        }
      }
      
      // Check if user is admin from API response
      const isAdmin = userRole === 'admin' || 
                      result?.role === 'admin' || 
                      result?.user?.role === 'admin' ||
                      result?.is_admin === true;
      
      // Get name from signup data (stored during registration)
      let userName = getStoredSignupName(userEmail);
      
      // If name not found from signup, try to get from login response
      if (!userName && result?.user?.name) {
        userName = result.user.name;
      }
      if (!userName && result?.name) {
        userName = result.name;
      }
      
      // If still no name, derive from email as last resort
      if (!userName) {
        userName = deriveNameFromEmail(userEmail);
      }
      
      const userProfile = {
        email: userEmail,
        name: userName,
        role: isAdmin ? 'admin' : 'user'
      };
      
      if (isAdmin) {
        // Store admin tokens and redirect to dashboard
        sessionStorage.setItem('adminToken', result.accessToken);
        sessionStorage.setItem('adminUser', JSON.stringify({ 
          username: userName, 
          email: userEmail,
          role: 'admin'
        }));
        
        // Also login via AuthContext
        login(result.accessToken, result.refreshToken, {
          user: userProfile
        });
        
        clearSignupData();
        toast.success('Welcome back, Admin!');
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        // Regular user - store and redirect to home
        login(result.accessToken, result.refreshToken, {
          user: userProfile
        });
        
        clearSignupData();
        toast.success('Welcome back! You have signed in successfully.');
        
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    } catch (err) {
      toast.error(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">
            Enter your email and password to access your account.
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot your password?
              </Link>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Keep me signed in on this device
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="auth-button"
                disabled={loading || !email || !password}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
