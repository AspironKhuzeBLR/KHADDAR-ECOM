import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Collections.css';
import HeroVideo from '../components/HeroVideo';

const Collections = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const collectionImages = [
    {
      id: 1,
      src: "https://smrgampincrwtgtbnzon.supabase.co/storage/v1/object/public/product-images/product%20images/RED%20AJRAKH%20DRESS.jpg",
      alt: 'Kutch Handicrafts',
      title: 'Traditional Ajrakh Dress',
      description: 'Handcrafted with authentic Ajrakh block printing'
    },
    {
      id: 2,
      src: 'https://smrgampincrwtgtbnzon.supabase.co/storage/v1/object/public/product-images/product%20images/RED%20PRINT%20AJRAKH%20SHIRT.jpg',
      alt: 'Kutch Heritage',
      title: 'Heritage Print Shirt',
      description: 'Contemporary design meets traditional craft'
    },
  ];

  // Auto-advance carousel
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
    <div className="collections-page page-with-transparent-header">
      <HeroVideo
        title='COLLECTIONS'
        subtitle='Crafting fashion that honors tradition'
        buttonText='SHOP BY CATEGORY'
      />
      <div className="collections-hero">
        <div className="hero-content-wrapper">
          <div className="collections-icon">✧</div>
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

      {/* CAROUSEL SECTION */}
      <section className="collections-carousel">
        <div className="carousel-container">
          <div className="carousel-wrapper">
            {/* Carousel Slides */}
            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {collectionImages.map((image) => (
                <div key={image.id} className="carousel-slide">
                  <div className="carousel-image-wrapper">
                    <img src={image.src} alt={image.alt} className="carousel-image" />
                    <div className="carousel-overlay">
                      <div className="carousel-content">
                        <h3 className="carousel-title">{image.title}</h3>
                        <p className="carousel-description">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button className="carousel-arrow carousel-arrow-prev" onClick={prevSlide} aria-label="Previous slide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="carousel-arrow carousel-arrow-next" onClick={nextSlide} aria-label="Next slide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Dot Indicators */}
            <div className="carousel-indicators">
              {collectionImages.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SHOP BUTTON SECTION --- */}
      <section className="collections-shop-action">
        <div className="container">
          <div className="shop-action-content">
            <Link to="/shop-collections" className="collections-btn">
              Shop The Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collections;