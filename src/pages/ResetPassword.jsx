import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';
import { resetPassword } from '../services/authService';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      toast.error('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token, toast]);

  // Password validation - must contain letters, numbers, and symbols
  const validatePassword = (pwd) => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    // eslint-disable-next-line no-useless-escape
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    return hasLetter && hasNumber && hasSymbol && pwd.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (!validatePassword(password)) {
      toast.error('Password must contain letters, numbers, and symbols.');
      return;
    }
    if (!token) {
      toast.error('Invalid reset token. Please request a new password reset link.');
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
      toast.success('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your new password below. After resetting, you'll need to sign in with your new
            password.
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {success && (
              <div className="auth-message success">
                Password reset successfully! Redirecting to sign in page...
              </div>
            )}

            {!success && (
              <>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="Enter new password"
                      required
                      disabled={loading || tokenError}
                      minLength={6}
                    />
                    <span className="password-hint">
                      Use 6+ characters with letters, numbers & symbols (e.g., @, #, $)
                    </span>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={loading || tokenError}
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

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                      disabled={loading || tokenError}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      disabled={loading || tokenError}
                    >
                      {showConfirmPassword ? (
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

                <div className="form-actions">
                  <button
                    type="submit"
                    className="auth-button"
                    disabled={loading || !token || !password || !confirmPassword}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </>
            )}

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
              {tokenError && (
                <p>
                  Need a new reset link?{' '}
                  <Link to="/forgot-password" className="auth-link">
                    Request password reset
                  </Link>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

