import React from 'react';
import { Link } from 'react-router-dom';
import './HomeLuxury.css'; 
import './FeaturedCollection.css';

// Using a specific image from your folder
import collectionBg from '../images/Summer Salt KHADDAR3495.png';

const FeaturedCollection = () => {
  return (
    <section className="featured-section">
      
      {/* The Background Image */}
      <img 
        src={collectionBg} 
        alt="Kolours of Kutch Background" 
        className="featured-bg-img parallax-bg"
        data-speed="0.2"
      />

      {/* The Blended Content Box */}
      <div className="glass-overlay-content">
        <h2 className="featured-title animate-child">KOLOURS OF KUTCH</h2>
        
        <p className="featured-desc animate-child">
          Introducing exceptional fabric creations which showcase the rich 
          heritage and artistic prowess of Kutch. Experience the blend of 
          vibrant culture and woven mastery.
        </p>
        
        <Link 
          to="/collections" 
          className="featured-cta animate-child"
        >
          Explore Collection
        </Link>
      </div>
      
    </section>
  );
};

export default FeaturedCollection;