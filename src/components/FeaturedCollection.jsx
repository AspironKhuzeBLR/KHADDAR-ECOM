import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedCollection.css';

// Using a specific image from your folder
import collectionBg from '../images/Summer Salt KHADDAR3495.png';

const FeaturedCollection = () => {
  return (
    <section className="featured-collection-section">
      <div className="featured-collection-wrapper">
        <div className="featured-collection-image">
          <img 
            src={collectionBg} 
            alt="Kolours of Kutch Collection" 
          />
          <div className="featured-overlay">
            <div className="featured-content">
              <div className="featured-icon">❖</div>
              <span className="featured-label">Discover The Collection</span>
              <h2 className="featured-title">Kolours of Kutch</h2>
              <p className="featured-description">
                Introducing exceptional fabric creations which showcase the rich 
                heritage and artistic prowess of Kutch. Experience the blend of 
                vibrant culture and woven mastery.
              </p>
              <Link to="/collections" className="featured-link">
                <span>Explore Collection</span>
                <span className="link-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
