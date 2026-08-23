import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HeroVideo.css';

// Your specific image
import heroImg from '../images/Summer Salt KHADDAR1990.png'; 

const HeroVideo = ({
  title = '',
  subtitle = <>Wear a story<br />Wear sustainability</>,
  buttonText = 'EXPLORE COLLECTIONS',
  buttonLink = '/collections',
  fullHeight,
  className = '',
  bgImage,
  hideText = false,
  hideButton = false,
  collectionSelector = false
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <section className={`hero-video ${className}`}>
      <div className={`video-wrapper ${fullHeight ? 'full-height' : ''}`}>

        <div className="hero-img-container">
           <img 
            src={bgImage || heroImg} 
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
            {!hideText && (
              <>
                <span className="hero-tagline">Heritage • Sustainability • Craftsmanship</span>
                <h1 className="hero-title">{title}</h1>
                {subtitle && <p className="hero-subtitle">{subtitle}</p>}
              </>
            )}

            {!hideButton && (
              collectionSelector ? (
                <div className="hero-collection-selector">
                  <button
                    type="button"
                    className="hero-cta hero-cta-fullwidth"
                    onClick={() => setSelectorOpen((prev) => !prev)}
                  >
                    {buttonText}
                  </button>
                  {selectorOpen && (
                    <div className="hero-collection-dropdown">
                      <Link to="/collections" onClick={() => setSelectorOpen(false)}>
                        Kolors of Kutch
                      </Link>
                      <span className="hero-dropdown-divider">|</span>
                      <Link to="/collections/threads-of-travancore" onClick={() => setSelectorOpen(false)}>
                        Threads of Travancore
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={buttonLink}
                  className="hero-cta hero-cta-fullwidth"
                >
                  {buttonText}
                </Link>
              )
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroVideo;