import React from 'react';
import './HomeLuxury.css';

// 1. Background Image
import bgImg from '../images/Summer Salt KHADDAR2362.png'; 
// 2. Foreground Image
import topImg from '../images/Summer Salt KHADDAR1990.png'; 

const AboutSection = () => {
  return (
    <section className="collage-section">
      
      {/* Background Layer */}
      <img src={bgImg} alt="About Background" className="collage-bg parallax-bg" data-speed="0.3" />

      {/* Content Layer (Standard: Image Left, Text Right) */}
      <div className="collage-container">
        
        {/* LEFT SIDE: The Floating Photo Card */}
        <div className="photo-card-wrapper animate-child">
          <img src={topImg} alt="Craftsmanship Detail" className="photo-card-img" />
        </div>

        {/* RIGHT SIDE: The Text */}
        <div className="collage-text-content">
          <span className="luxury-sub animate-child" style={{color: '#D4AF37'}}>Who We Are</span>
          <h2 className="luxury-head animate-child">Honoring Roots,<br/>Inspiring Future</h2>
          <p className="luxury-text animate-child" style={{color: '#f0f0f0'}}>
            Born from a love for Indian craftsmanship, authentic storytelling, 
            and sustainable living. Our collections showcase the artistry of 
            local artisans through timeless, minimalist designs woven carefully 
            with nature and culture at heart.
          </p>
          <div className="animate-child" style={{marginTop: '2rem'}}>
             <span className="luxury-link">Our Philosophy</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;