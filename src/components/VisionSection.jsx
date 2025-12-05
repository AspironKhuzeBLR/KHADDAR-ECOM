import React from 'react';
import './HomeLuxury.css';

// 1. Background Image (Abstract/Texture)
import bgImg from '../images/Summer Salt KHADDAR8836.png'; 
// 2. Foreground Image (The Focus)
import topImg from '../images/Summer Salt KHADDAR4678.png'; 

const VisionSection = () => {
  return (
    <section className="collage-section">
      
      {/* Background Layer */}
      <img src={bgImg} alt="Vision Background" className="collage-bg" />

      {/* Content Layer (Reverse: Text Left, Image Right) */}
      <div className="collage-container reverse">
        
        {/* RIGHT SIDE: The Floating Photo Card */}
        <div className="photo-card-wrapper">
          <img src={topImg} alt="Visionary Weaver" className="photo-card-img" />
        </div>

        {/* LEFT SIDE: The Text */}
        <div className="collage-text-content">
          <span className="luxury-sub" style={{color: '#D4AF37'}}>Our Vision</span>
          <h2 className="luxury-head">Reshaping the<br/>Landscape</h2>
          <p className="luxury-text" style={{color: '#f0f0f0'}}>
            To reshape the fashion landscape by showcasing India's unparalleled 
            craftsmanship. We are empowering artisans and creating a lasting impact 
            that prioritizes people, planet, and artistry over trends.
          </p>
          <div style={{marginTop: '2rem'}}>
             <span className="luxury-link">Read Our Vision</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default VisionSection;