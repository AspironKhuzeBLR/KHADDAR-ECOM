import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import { requestPasswordReset } from '../services/authService';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
      toast.success('Password reset link has been sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Could not send password reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            Enter your registered email address and we'll send you a password reset link.
          </p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {success && (
              <div className="auth-message success">
                Password reset link has been sent to your email. Please check your inbox and click
                the link to reset your password.
              </div>
            )}

            {!success && (
              <>
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

                <div className="form-actions">
                  <button
                    type="submit"
                    className="auth-button"
                    disabled={loading || !email}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

