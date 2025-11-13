import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { signIn } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, login, isBootstrapped } = useAuth();

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
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    const isAdminEmail = email.toLowerCase() === 'admin@gmail.com';
    const adminPassword = 'admin123';

    if (isAdminEmail) {
      if (password === adminPassword) {
        localStorage.setItem('adminToken', 'admin-auth-token-12345');
        localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', email }));
        setLoading(false);
        navigate('/admin/dashboard');
        return;
      }

      setLoading(false);
      setError('Invalid admin credentials. Please try again.');
      return;
    }

    try {
      const result = await signIn({ email, password });
      const userProfile =
        result?.user || {
          email,
          name: deriveNameFromEmail(email)
        };
      login(result.token, {
        user: userProfile,
        persist: rememberMe
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
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
            {error && <div className="auth-message error">{error}</div>}

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
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
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
