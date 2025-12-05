import React from 'react';
import { Link } from 'react-router-dom';
import './HomeLuxury.css'; 

// Using a specific image from your folder
import collectionBg from '../images/Summer Salt KHADDAR3495.png';

const FeaturedCollection = () => {
  return (
    <section className="featured-section">
      
      {/* The Background Image */}
      <img 
        src={collectionBg} 
        alt="Kolours of Kutch Background" 
        className="featured-bg-img"
      />

      {/* The Blended Content Box */}
      <div className="glass-overlay-content">
        <h2 className="featured-title">KOLOURS OF KUTCH</h2>
        
        <p className="featured-desc">
          Introducing exceptional fabric creations which showcase the rich 
          heritage and artistic prowess of Kutch. Experience the blend of 
          vibrant culture and woven mastery.
        </p>
        
        <Link 
          to="/collections" 
          style={{
            display: 'inline-block',
            padding: '12px 40px',
            border: '1px solid #ffffff',
            color: '#ffffff',
            fontFamily: 'Montserrat',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '0.85rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#ffffff'; 
            e.target.style.color = '#000000';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'transparent'; 
            e.target.style.color = '#ffffff';
          }}
        >
          Explore Collection
        </Link>
      </div>
      
    </section>
  );
};

export default FeaturedCollection;