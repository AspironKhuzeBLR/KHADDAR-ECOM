import React from 'react';
import './BrandStory.css';

// Add image for this section
import brandImg from '../images/Summer Salt KHADDAR8836.png';

const BrandStory = () => {
  return (
    <section className="brand-section">
      <div className="brand-container">
        {/* Content Side (Left) */}
        <div className="brand-content">
          <div className="content-accent">❖</div>
          <span className="brand-label">The Origin</span>
          <h2 className="brand-heading">The Soul of Clothing</h2>
          <p className="brand-text">
            Khaddar began with a simple thought — to return to the soul of clothing. 
            Inspired by the spirit of India's indigenous fabrics and the artisans who carry 
            forward centuries-old traditions.
          </p>
          <p className="brand-text">
            Every piece is a journey from the skilled hands of local weavers to your wardrobe, 
            crafted with respect for the land and its people.
          </p>
        </div>
        
        {/* Image Side (Right) */}
        <div className="brand-image-wrapper">
          <img 
            src={brandImg} 
            alt="The Soul of Khaddar" 
            className="brand-image"
          />
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
