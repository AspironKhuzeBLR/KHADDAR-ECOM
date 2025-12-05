import React from 'react';
import './HomeLuxury.css';

// 1. Background Image
import bgImg from '../images/Summer Salt KHADDAR8863.png'; 
// 2. Foreground Image
import topImg from '../images/Summer Salt KHADDAR8836.png'; 

const MissionSection = () => {
  return (
    <section className="collage-section">
      
      {/* Background Layer */}
      <img src={bgImg} alt="Mission Background" className="collage-bg parallax-bg" data-speed="0.3" />

      {/* Content Layer (Reverse: Text Left, Image Right) */}
      <div className="collage-container reverse">
        
        {/* RIGHT SIDE: The Floating Photo Card */}
        <div className="photo-card-wrapper animate-child">
          <img src={topImg} alt="Sustainable Fabric" className="photo-card-img" />
        </div>

        {/* LEFT SIDE: The Text */}
        <div className="collage-text-content">
          <span className="luxury-sub animate-child" style={{color: '#D4AF37'}}>Our Mission</span>
          <h2 className="luxury-head animate-child">To Protect &<br/>Preserve</h2>
          <p className="luxury-text animate-child" style={{color: '#f0f0f0'}}>
            Our mission is to protect the planet by exclusively choosing organic 
            fabrics and natural dyes. We stand against the tide of fast fashion, 
            weaving India's rich stories into fashion that is meant to be 
            treasured, not consumed.
          </p>
          <div className="animate-child" style={{marginTop: '2rem'}}>
             <span className="luxury-link">See Our Impact</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MissionSection;