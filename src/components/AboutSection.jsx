import React from 'react';
import './AboutSection.css';

// Add image for this section
import aboutImg from '../images/Summer Salt KHADDAR7742.png';

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        {/* Image Side */}
        <div className="about-image-wrapper">
          <div className="image-frame"></div>
          <img 
            src={aboutImg} 
            alt="Khaddar Craftsmanship" 
            className="about-image"
          />
        </div>
        
        {/* Content Side */}
        <div className="about-content">
          <div className="content-accent">❖</div>
          <span className="about-label">Who We Are</span>
          <h2 className="about-heading">Honoring Roots, Inspiring Future</h2>
          <p className="about-text">
            Born from a love for Indian craftsmanship, authentic storytelling, 
            and sustainable living. Our collections showcase the artistry of 
            local artisans through timeless, minimalist designs woven carefully 
            with nature and culture at heart.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
