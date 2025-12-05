import React from 'react';
import './HomeLuxury.css';

// Image 1: Background (Something textural or wide)
import bgImage from '../images/Summer Salt KHADDAR1990.png';

// Image 2: Foreground (The "Top" Image - maybe a close up of weaving or hands)
import topImage from '../images/Summer Salt KHADDAR4678.png'; // Make sure this is a nice clear image

const BrandStory = () => {
  return (
    <section className="collage-section">
      
      {/* 1. BACKGROUND LAYER (Blurred & Dark) */}
      <img src={bgImage} alt="Brand Texture" className="collage-bg parallax-bg" data-speed="0.3" />

      {/* 2. CONTENT LAYER */}
      <div className="collage-container">
        
        {/* LEFT SIDE: The Floating Photo Card */}
        <div className="photo-card-wrapper animate-child">
          <img src={topImage} alt="Artisan weaving" className="photo-card-img" />
        </div>

        {/* RIGHT SIDE: The Text */}
        <div className="collage-text-content">
          <span className="luxury-sub animate-child" style={{color: '#D4AF37'}}>The Origin</span>
          <h2 className="luxury-head animate-child">The Soul of<br/>Clothing</h2>
          <p className="luxury-text animate-child" style={{color: '#f0f0f0'}}>
            Khaddar began with a simple thought — to return to the soul of clothing. 
            Inspired by the spirit of India's indigenous fabrics and the artisans who carry 
            forward centuries-old traditions.
          </p>
          <p className="luxury-text animate-child" style={{color: '#f0f0f0', marginTop: '-1rem'}}>
            Every piece is a journey from the skilled hands of local weavers to your wardrobe, 
            crafted with respect for the land and its people.
          </p>
          <div className="animate-child" style={{marginTop: '2rem'}}>
             <span className="luxury-link">Explore Our Heritage</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BrandStory;