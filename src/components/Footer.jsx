import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  // Logo is in public folder - using the actual filename
  const logo = '/logo_file_page-0001.png';
  const location = useLocation();

  const handleLinkClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    // If different page, let Link handle navigation naturally
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="footer-logo-link" onClick={(e) => handleLinkClick(e, '/')}>
              <img src={logo} alt="Khaddar Logo" className="footer-logo" />
            </Link>
            <p className="footer-text">
              A conscious fashion brand celebrating Indian craftsmanship and sustainable living.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">EXPLORE</h4>
            <ul className="footer-links">
              <li><Link to="/" onClick={(e) => handleLinkClick(e, '/')}>Home</Link></li>
              <li><Link to="/collections" onClick={(e) => handleLinkClick(e, '/collections')}>Collections</Link></li>
              <li><Link to="/shop/mens-wear" onClick={(e) => handleLinkClick(e, '/shop/mens-wear')}>Men's Wear</Link></li>
              <li><Link to="/shop/womens-wear" onClick={(e) => handleLinkClick(e, '/shop/womens-wear')}>Women's Wear</Link></li>
              <li><Link to="/community" onClick={(e) => handleLinkClick(e, '/community')}>Community</Link></li>
              <li><Link to="/sustainability" onClick={(e) => handleLinkClick(e, '/sustainability')}>Sustainability</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">POLICIES</h4>
            <ul className="footer-links">
              <li><Link to="/privacy-policy" onClick={(e) => handleLinkClick(e, '/privacy-policy')}>Privacy Policy</Link></li>
              <li><Link to="/refund-policy" onClick={(e) => handleLinkClick(e, '/refund-policy')}>Refund Policy</Link></li>
              <li><Link to="/cancellation-policy" onClick={(e) => handleLinkClick(e, '/cancellation-policy')}>Cancellation Policy</Link></li>
              <li><Link to="/shipping-policy" onClick={(e) => handleLinkClick(e, '/shipping-policy')}>Shipping Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">CONNECT</h4>
            <div className="social-links">
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://youtube.com" className="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Khaddar. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link to="/contact">Contact Us</Link>
            <span>|</span>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

