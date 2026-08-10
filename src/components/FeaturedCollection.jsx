import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FeaturedCollection.css';

import kutchBg from '../images/Summer Salt KHADDAR3495.png';
import travancoreBg from '../images/tot5.png';

const slides = [
  {
    id: 'kutch',
    image: kutchBg,
    label: 'Discover The Collection',
    title: 'Kolours of Kutch',
    description:
      'Introducing exceptional fabric creations which showcase the rich heritage and artistic prowess of Kutch. Experience the blend of vibrant culture and woven mastery.',
    link: '/collections'
  },
  {
    id: 'travancore',
    image: travancoreBg,
    label: 'A Kerala Collection',
    title: 'Threads of Travancore',
    description:
      "Drawn from Kerala's backwaters and the quiet ceremony of draped white and gold. Hand-finished in Khaddar cotton, honoring a slower, coastal way of dressing.",
    link: '/collections/threads-of-travancore',
    hideText: true
  }
];

const FeaturedCollection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrent(index);

  return (
    <section className="featured-collection-section">
      <div className="featured-collection-wrapper">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`featured-collection-image featured-slide featured-slide-${slide.id} ${
              index === current ? 'featured-slide-active' : ''
            }`}
          >
            <img src={slide.image} alt={slide.title} />
            <div className={`featured-overlay ${slide.hideText ? 'featured-overlay-light' : ''}`}>
              <div className={`featured-content ${slide.hideText ? 'featured-content-btn-only' : ''}`}>
                {!slide.hideText && (
                  <>
                    <div className="featured-icon">❖</div>
                    <span className="featured-label">{slide.label}</span>
                    <h2 className="featured-title">{slide.title}</h2>
                    <p className="featured-description">{slide.description}</p>
                  </>
                )}
                <Link to={slide.link} className="featured-link">
                  <span>Explore Collection</span>
                  <span className="link-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide indicator dots */}
        <div className="featured-dots-container">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`featured-dot ${index === current ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Show ${slide.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;