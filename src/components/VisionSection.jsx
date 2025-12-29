import React from 'react';
import './VisionSection.css';

const VisionSection = () => {
  return (
    <section className="vision-section pattern-bg">
      <div className="vision-container">
        <div className="vision-icon">❖</div>
        <span className="vision-label">Our Vision</span>
        <h2 className="vision-heading">Reshaping the Fashion Landscape</h2>
        <p className="vision-text">
          To reshape the fashion landscape by showcasing India's unparalleled
          craftsmanship. We are empowering artisans and creating a lasting impact
          that prioritizes people, planet, and artistry over trends.
        </p>
        {/* <div className="vision-accent">
          <span></span><span></span><span></span>
        </div> */}
      </div>
    </section>
  );
};


export default VisionSection;
