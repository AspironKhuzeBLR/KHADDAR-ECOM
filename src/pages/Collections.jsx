import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Collections.css';
import HeroVideo from '../components/HeroVideo';

// 1. IMPORTING YOUR IMAGES
import img2431 from '../images/Summer Salt KHADDAR2431.png';
import img3561 from '../images/Summer Salt KHADDAR3561.png';
import img4678 from '../images/Summer Salt KHADDAR4678.png';
import img3571 from '../images/Summer Salt KHADDAR3571.png';
import img7742 from '../images/Summer Salt KHADDAR7742.png';
import img8789 from '../images/Summer Salt KHADDAR8789.png';
import img8863 from '../images/Summer Salt KHADDAR8863.png';
import img8836 from '../images/Summer Salt KHADDAR8836.png';

const Collections = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 2. PROFESSIONAL DATA ARRAY
  const collectionImages = [
    {
      id: 1,
      src: img2431,
      alt: "Signature Khaddar",
      title: "The Signature Khaddar",
      description: "A timeless blend of hand-spun comfort and intricate Kutch detailing."
    },
    {
      id: 2,
      src: img3561,
      alt: "Azure Traditions",
      title: "Azure Traditions",
      description: "Honoring ancient dyeing techniques with deep indigo hues and breathable textures."
    },
    {
      id: 3,
      src: img4678,
      alt: "Desert Embroidery",
      title: "Desert Embroidery",
      description: "Every stitch tells a story of the Rann, featuring authentic mirror work."
    },
    {
      id: 4,
      src: img3571,
      alt: "Saffron Skies",
      title: "Saffron Skies",
      description: "Vibrant palettes inspired by the Kutchi sunset, crafted in the heart of Bhujodi."
    },
    {
      id: 5,
      src: img7742,
      alt: "Coastal Breeze",
      title: "Coastal Breeze",
      description: "Lightweight fabrics designed for elegance under the golden summer sun."
    },
    {
      id: 6,
      src: img8789,
      alt: "Geometric Heritage",
      title: "Geometric Heritage",
      description: "Contemporary silhouettes meet traditional block-printing heritage."
    },
    {
      id: 7,
      src: img8863,
      alt: "Artisanal Grace",
      title: "Artisanal Grace",
      description: "Soft textures that showcase the artistic prowess of local master weavers."
    },
    {
      id: 8,
      src: img8836,
      alt: "The Bhujodi Legacy",
      title: "The Bhujodi Legacy",
      description: "Heritage craft meets high-fashion sophistication in every thread."
    }
  ];

  // 3. SLIDER LOGIC
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % collectionImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [collectionImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % collectionImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + collectionImages.length) % collectionImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="collections-page">
      <HeroVideo
        title='COLLECTIONS'
        subtitle='Crafting fashion that honors tradition'
        buttonText='SHOP BY CATEGORY'
      />

      <div className="collections-hero">
        <div className="hero-content-wrapper">
          <div className="collections-hero">
            <div className="hero-content-wrapper">
              <div className="collections-icon">❖</div>
              <span className="collections-label">Our Collection</span>
              <h1 className="collections-title">Kolours of Kutch</h1>
              <div className="section-divider">
                <span className="divider-line-full"></span>
              </div>
              <div className="collections-intro">
                <p className="body-text intro-text intro-bold">
                  Introducing exceptional fabric creations, which showcase the rich heritage and artistic prowess of Kutch. The artisans specialize in various techniques, such as <strong>handloom weaving</strong>, <strong>bandhani tie-dyeing</strong>, and intricate embroidery like <strong>mirror work</strong> and <strong>thread work</strong>. Fabrics from Kutch often feature vibrant colors, geometric patterns, and intricate detailing.
                </p>
                <p className="body-text intro-text intro-bold">
                  <strong>Kolours of Kutch</strong> is a blend of the fabrics from <strong>Bhujodi</strong>, <strong>Kutch</strong> & <strong>Ajrakhpur</strong> and designs tailor made in such a way that each piece tells a story of skill, tradition, and cultural identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FULL SCREEN CAROUSEL --- */}
      <section className="collections-carousel-section">
        <div className="full-screen-wrapper">
          <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {collectionImages.map((image) => (
              <div key={image.id} className="carousel-slide-item">
                <div className="image-container">
                  <img src={image.src} alt={image.alt} className="optimized-carousel-img" />
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button className="nav-arrow prev" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="nav-arrow next" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* Dots */}
          <div className="carousel-dots-container">
            {collectionImages.map((_, index) => (
              <button
                key={index}
                className={`dot-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="marquee-strip">
        <div className="marquee-content">
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
        </div>
      </div>

      <section className="collections-shop-action">
        <div className="container">
          <h2 className="shop-action-heading">Ready to Experience Authentic Craftsmanship?</h2>
          <p className="shop-action-subtext">Discover our complete range of handcrafted collections</p>
          <Link to="/shop-collections" className="collections-btn">
            <span>Explore Full Collection</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Collections;