import React, { useState, useRef, useEffect } from 'react';
import './Community.css';
import HeroVideo from '../components/HeroVideo';

const Community = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef(null);

  const artisanImages = [
    '/blog-images/IMG_1625.PNG',
    '/blog-images/IMG_1626.PNG',
    '/blog-images/IMG_1627.PNG',
    '/blog-images/IMG_1628.PNG'
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // 0.75x speed (slower)
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % artisanImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [artisanImages.length]);

  const handleOpenModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmail('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    console.log('Email submitted:', email);
    alert('Thank you for joining our community! We\'ll be in touch soon.');
    handleCloseModal();
  };
 
  return (
    <div className="community-page page-with-transparent-header">
      <HeroVideo 
        title='Community' 
        subtitle='Building bridges between tradition and innovation, one collaboration at a time.'
        fullHeight={true}
      />

      {/* Artisan Story Section */}
      <section className="artisan-story-section">
        <div className="container">
          <div className="artisan-story-wrapper">
            <div className="story-icon">❖</div>
            <span className="story-label">Our Artisans</span>
            <h2 className="story-heading">Artisans from Kutch & Ajrakhpur</h2>
            
            <div className="story-content-grid">
              {/* Decorative Pattern Elements */}
              <div className="story-pattern story-pattern-left">
                <div className="pattern-diamond"></div>
                <div className="pattern-dots"></div>
              </div>
              <div className="story-pattern story-pattern-right">
                <div className="pattern-diamond"></div>
                <div className="pattern-dots"></div>
              </div>

              {/* Photo Carousel */}
              <div className="story-photo-section">
                <div className="story-photo-wrapper">
                  <div className="carousel-container">
                    {artisanImages.map((image, index) => (
                      <div 
                        key={index}
                        className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                          opacity: index === currentSlide ? 1 : 0,
                          transform: index === currentSlide ? 'scale(1)' : 'scale(0.95)'
                        }}
                      >
                        <img 
                          src={image} 
                          alt={`Artisan ${index + 1}`} 
                          className="story-collage-image"
                        />
                        <div className="glow-sweep"></div>
                      </div>
                    ))}
                  </div>
                  <div className="image-outline-glow"></div>
                </div>
              </div>

              {/* Text Content */}
              <div className="story-text-content">
                <div className="text-decorative-accent"></div>
                <p className="story-paragraph">
                  From the culturally rich regions of Kutch and Ajrakhpur in Gujarat, these artisans carry forward traditions that have lived through generations. Their craft is not simply a profession, but a way of life - one shaped by stories, rituals, and an intimate relationship with their surroundings.
                </p>
                <p className="story-paragraph">
                  The motifs they create are inspired by age-old folklore, memory, and regional symbolism. Each form holds meaning, reflecting nature, belief systems, and the rhythms of community life. Having grown up immersed in this heritage, these skills live instinctively in their hands, refined over time, yet deeply rooted in ancestry.
                </p>
                <p className="story-paragraph">
                  At Khaddar, we engage with these artisans through shared values and mutual respect, supporting the continuation of practices that honour India's living cultural legacy - quietly, thoughtfully, and with integrity.
                </p>
                <div className="text-decorative-line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-video">
        <div className="video-section-wrapper">
          <video
            ref={videoRef}
            className="community-video-element"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/11355806-uhd_3840_2160_25fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay-content">
            <p className="video-quote-community">
              "Tradition is a living force." — Rabindranath Tagore
            </p>
          </div>
        </div>
      </section>

      <section className="community-intro">
        <div className="container">
          <div className="intro-content">
            <div className="section-icon">❖</div>
            <span className="section-label">Join Our Community</span>
            <h2 className="section-heading">Building Together</h2>
            <p className="body-text intro-text">
              At Khaddar, we believe that fashion is a collaborative art. Our community initiatives and collaborations bring together artisans, designers, and cultural enthusiasts to create something meaningful. Through these partnerships, we aim to preserve traditional crafts, support local communities, and inspire new generations to appreciate the beauty of handcrafted excellence.
            </p>
          </div>
        </div>
      </section>

      <section className="community-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-heading">JOIN OUR COMMUNITY</h2>
            <p className="cta-text">
              Interested in collaborating with us? We'd love to hear from artisans, designers, and organizations passionate about sustainable fashion and traditional crafts.
            </p>
            <button onClick={handleOpenModal} className="cta-button">GET IN TOUCH</button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="community-modal-overlay" onClick={handleCloseModal}>
          <div className="community-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="community-modal-close" 
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h2 className="community-modal-title">Join our community</h2>
            <p className="community-modal-text">
              Be part of our mission to preserve traditional craftsmanship and support sustainable fashion.
            </p>
            <form className="community-modal-form" onSubmit={handleSubmit}>
              <div className="community-modal-input-wrapper">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="community-modal-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="community-modal-button">
                Join
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;

