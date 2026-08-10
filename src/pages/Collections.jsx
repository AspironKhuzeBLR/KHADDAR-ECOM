import React from 'react';
import { Link } from 'react-router-dom';
import './Collections.css';
import HeroVideo from '../components/HeroVideo';

// Card cover images
import kutchCover from '../images/Summer Salt KHADDAR2431.png';
import travancoreCover from '../images/ToT-hero.jpg';

const Collections = () => {
  return (
    <div className="collections-page collections-hub-page">
      <HeroVideo
        title="COLLECTIONS"
        subtitle="Crafting fashion that honors tradition"
      />

      <div className="collections-hero">
        <div className="hero-content-wrapper">
          <div className="collections-icon">❖</div>
          <span className="collections-label">Our Collections</span>
          <h1 className="collections-title">Choose Your Story</h1>
          <div className="section-divider">
            <span className="divider-line-full"></span>
          </div>
          <div className="collections-intro">
            <p className="body-text intro-text intro-bold">
              Every Khaddar collection is rooted in a place, a craft, and the hands that shaped it.
              Explore our two current collections below.
            </p>
          </div>
        </div>
      </div>

      {/* --- COLLECTION SELECTION CARDS --- */}
      <section className="collections-hub-grid">
        <Link to="/collections/kolors-of-kutch" className="collection-hub-card">
          <div className="collection-hub-card-image">
            <img src={kutchCover} alt="Kolors of Kutch" />
          </div>
          <div className="collection-hub-card-content">
            <span className="collection-hub-card-label">Collection 01</span>
            <h2 className="collection-hub-card-title">Kolors of Kutch</h2>
            <p className="collection-hub-card-desc">
              Handloom weaving, bandhani tie-dyeing, and mirror work from Bhujodi & Ajrakhpur.
            </p>
            <span className="collection-hub-card-cta">Explore Collection →</span>
          </div>
        </Link>

        <Link to="/collections/threads-of-travancore" className="collection-hub-card">
          <div className="collection-hub-card-image">
            <img src={travancoreCover} alt="Threads of Travancore" />
          </div>
          <div className="collection-hub-card-content">
            <span className="collection-hub-card-label">Collection 02</span>
            <h2 className="collection-hub-card-title">Threads of Travancore</h2>
            <p className="collection-hub-card-desc">
              A Kerala collection woven from coastal calm and timeless, minimalist draping.
            </p>
            <span className="collection-hub-card-cta">Explore Collection →</span>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default Collections;