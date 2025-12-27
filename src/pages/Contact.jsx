import React, { useState } from 'react';
import './Contact.css';
import HeroVideo from '../components/HeroVideo';
// Importing icons from react-icons library
import { FaInstagram, FaFacebookF, FaYoutube, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Contact = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    console.log('Email submitted:', email);
    alert('Thank you for joining our community! We\'ll be in touch soon.');
    setEmail('');
  };

  return (
    <div className="contact-page page-with-transparent-header">
      <HeroVideo 
        title='Contact Us'  
        subtitle="We'd love to hear from you."
        fullHeight={true}
      />
      
      <section className="contact-content">
        <div className="container">
          
          <div className="contact-wrapper">
            
            {/* Header Text */}
            <div className="contact-header">
              <h2 className="info-heading">GET IN TOUCH</h2>
              <div className="heading-underline"></div>
              <p className="info-text">
                If you're interested in our collections, want to collaborate, or have questions about sustainability practices, we are here to assist you.
              </p>
            </div>

            {/* Horizontal Row */}
            <div className="contact-horizontal-row">
              
              {/* Email Section */}
              <div className="contact-card">
                <div className="icon-circle-large">
                  <FaEnvelope />
                </div>
                <h3 className="info-subheading">EMAIL</h3>
                <a href="mailto:info@khaddar.com" className="info-link-large">
                  info@khaddar.com
                </a>
              </div>

              {/* Vertical Divider */}
              <div className="vertical-divider"></div>

              {/* Phone Section */}
              <div className="contact-card">
                <div className="icon-circle-large">
                  <FaPhoneAlt />
                </div>
                <h3 className="info-subheading">PHONE</h3>
                <a href="tel:+917899888491" className="info-link-large">
                  +91 78998 88491
                </a>
                <a href="tel:+918296704777" className="info-link-large">
                  +91 82967 04777
                </a>
              </div>

              {/* Vertical Divider */}
              <div className="vertical-divider"></div>

              {/* Social Section */}
              <div className="contact-card">
                <div className="icon-circle-large">
                   {/* Heart icon or Share icon could go here, or we remove the top icon for this specific card since icons are below. 
                       Let's keep a 'Connect' icon for consistency. */}
                   <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>@</span> 
                </div>
                <h3 className="info-subheading">FOLLOW US</h3>
                
                {/* Social Icons Row */}
                <div className="social-row">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="YouTube">
                    <FaYoutube />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-icon">✦</div>
          <h2 className="newsletter-heading">Join our community</h2>
          <p className="newsletter-text">
            Be part of our mission to preserve traditional craftsmanship and support sustainable fashion.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-button">JOIN</button>
          </form>
        </div>
      </section>

      <section className="contact-image-section">
        <div className="contact-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1743708825952-eb9211e1765c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fHN1c3RhaW5hYmVsZSUyMGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&q=80&w=2000" 
            alt="Contact us"
            className="contact-image"
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;