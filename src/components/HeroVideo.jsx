import React from 'react';
import { Link } from 'react-router-dom';
import './HeroVideo.css';

// Your specific image
import heroImg from '../images/Summer Salt KHADDAR1990.png'; 

const HeroVideo = ({ title = '', subtitle = <>Wear a story<br />Wear sustainability</>, buttonText = 'EXPLORE COLLECTIONS',   buttonLink = '/collections', fullHeight, className = '' }) => {  
  
  return (
    <section className={`hero-video ${className}`}>
      <div className={`video-wrapper ${fullHeight ? 'full-height' : ''}`}>

        
        <div className="hero-img-container">
           <img 
            src={heroImg} 
            alt="Khaddar Luxury Collection" 
            className="hero-bg-img"
          />
        </div>

        {/* 2. FILM GRAIN (Adds texture/movie feel) */}
        <div className="effect-layer film-grain"></div>

        {/* 3. GOLDEN LIGHT SWEEP (Simulates moving sunlight) */}
        <div className="effect-layer light-sweep"></div>

        {/* 4. CONTENT OVERLAY */}
        <div className="video-overlay">
          <div className="hero-content">
            <span className="hero-tagline">Heritage • Sustainability • Craftsmanship</span>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            <Link
              to={buttonLink}
              className="hero-cta hero-cta-fullwidth"
            >
              {buttonText}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroVideo;