import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import {
  requestOtp,
  verifyOtp,
  signup,
  storeSignupData,
  RESEND_COOLDOWN_SECONDS
} from '../services/authService';
import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 6;

const Register = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'details'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapped } = useAuth();
  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isBootstrapped, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp' && otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  }, [step]);

  const handleOtpInputChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, '');
    const nextDigits = [...otpDigits];
    nextDigits[index] = value ? value.slice(-1) : '';
    setOtpDigits(nextDigits);
    if (value && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const nextDigits = [...otpDigits];
      if (nextDigits[index]) {
        nextDigits[index] = '';
        setOtpDigits(nextDigits);
      } else if (index > 0) {
        otpInputsRef.current[index - 1]?.focus();
        nextDigits[index - 1] = '';
        setOtpDigits(nextDigits);
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      otpInputsRef.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const nextDigits = Array(OTP_LENGTH)
      .fill('')
      .map((_, index) => pasted[index] || '');
    setOtpDigits(nextDigits);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    if (focusIndex >= 0) {
      otpInputsRef.current[focusIndex]?.focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await requestOtp(email);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setInfoMessage('Check your email for the verification OTP.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const otpValue = otpDigits.join('');
    if (otpValue.length < OTP_LENGTH) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await verifyOtp({ email, otp: otpValue });
      setStep('details');
      setInfoMessage('OTP verified! Please complete your profile.');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await signup({
        name: formData.name,
        address: formData.address,
        password: formData.password,
        email: email
      });
      // Store name and email from signup so it can be used during login
      storeSignupData(email, formData.name);
      setInfoMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Could not complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await requestOtp(email);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setInfoMessage('OTP resent. Check your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message || 'Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetToEmail = () => {
    setStep('email');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setCooldown(0);
    setInfoMessage('');
    setError('');
  };

  const renderMessages = () => (
    <>
      {error && <div className="auth-message error">{error}</div>}
      {infoMessage && <div className="auth-message success">{infoMessage}</div>}
    </>
  );

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            {step === 'email' && 'Enter your email to get started.'}
            {step === 'otp' && 'Verify your email with the OTP sent to you.'}
            {step === 'details' && 'Complete your profile to finish signup.'}
          </p>
          <form
            className="auth-form"
            onSubmit={
              step === 'email'
                ? handleEmailSubmit
                : step === 'otp'
                  ? handleOtpVerify
                  : handleDetailsSubmit
            }
          >
            {renderMessages()}

            {step === 'email' && (
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
            )}

            {step === 'otp' && (
              <>
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">Enter OTP</label>
                  <div
                    className="otp-inputs"
                    onPaste={handleOtpPaste}
                    role="group"
                    aria-label="One time password"
                  >
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        pattern="[0-9]"
                        value={digit}
                        onChange={(e) => handleOtpInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        ref={(element) => {
                          otpInputsRef.current[index] = element;
                        }}
                        className="form-input otp-input"
                        aria-label={`Digit ${index + 1}`}
                        autoFocus={index === 0}
                        disabled={loading}
                      />
                    ))}
                  </div>
                  <div className="otp-actions">
                    <button
                      type="button"
                      className="otp-change-email"
                      onClick={resetToEmail}
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      className="otp-resend"
                      onClick={handleResendOtp}
                      disabled={cooldown > 0 || loading}
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'details' && (
              <>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    rows="3"
                    placeholder="Enter your full address"
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
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Create a password"
                      required
                      disabled={loading}
                      minLength={6}
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
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      disabled={loading}
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
              </>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="auth-button"
                disabled={
                  loading ||
                  (step === 'email' && !email) ||
                  (step === 'otp' && otpDigits.join('').length !== OTP_LENGTH) ||
                  (step === 'details' &&
                    (!formData.name ||
                      !formData.address ||
                      !formData.password ||
                      !formData.confirmPassword))
                }
              >
                {loading
                  ? 'Please wait...'
                  : step === 'email'
                    ? 'Send OTP'
                    : step === 'otp'
                      ? 'Verify OTP'
                      : 'Create Account'}
              </button>
            </div>

            {step === 'email' && (
              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
