import React, { useState, useEffect } from 'react';
import './ThreadsOfTravancore.css';
import HeroVideo from '../components/HeroVideo';
import ShopRow from '../components/ShopRow';
import WatchFilmMarquee from '../components/WatchFilmMarquee';

// Collection images
import totFt1 from '../images/ToT-Ft-1.jpg';
import totFt2 from '../images/ToT-Ft-2.jpg';
import totFt3 from '../images/ToT-Ft-3.jpg';
import totFt4 from '../images/ToT-Ft-4.jpg';
import totFt5 from '../images/ToT-Ft-5.jpg';
import heroImage from '../images/HeroImage.jpg';

const ThreadsOfTravancore = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullAbout, setShowFullAbout] = useState(false);

  const collectionImages = [
    { id: 1, src: totFt1, alt: "Threads of Travancore", title: "Threads of Travancore", description: "Handloom cotton and Kasavu, made in Kerala." },
    { id: 2, src: totFt2, alt: "Threads of Travancore", title: "Threads of Travancore", description: "Handloom cotton and Kasavu, made in Kerala." },
    { id: 3, src: totFt3, alt: "Threads of Travancore", title: "Threads of Travancore", description: "Handloom cotton and Kasavu, made in Kerala." },
    { id: 4, src: totFt4, alt: "Threads of Travancore", title: "Threads of Travancore", description: "Handloom cotton and Kasavu, made in Kerala." },
    { id: 5, src: totFt5, alt: "Threads of Travancore", title: "Threads of Travancore", description: "Handloom cotton and Kasavu, made in Kerala." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % collectionImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [collectionImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % collectionImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + collectionImages.length) % collectionImages.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div className="tot-collections-page">
      <HeroVideo
        title='THREADS OF TRAVANCORE'
        subtitle='Crafting fashion that honors tradition'
        className='tot-hero'
        hideButton
        bgImage={heroImage}
      />

      <WatchFilmMarquee
        href="https://youtu.be/5G_e2IazRRw?si=voVvooyCnurQQg43"
        className="tot-watch-ad-marquee"
        contentClassName="tot-watch-ad-marquee-content"
      />

      <div className="tot-collections-hero">
        <div className="tot-hero-content-wrapper">
          <div className="tot-collections-hero">
            <div className="tot-hero-content-wrapper">
              <div className="tot-collections-icon">❖</div>
              <span className="tot-collections-label">About</span>
              <h1 className="tot-collections-title">Threads of Travancore</h1>
              <div className="section-divider">
                <span className="divider-line-full"></span>
              </div>
              <div className="tot-collections-intro">
                <p className="body-text tot-intro-text intro-bold">
                  <strong>Threads of Travancore</strong> is an exploration of what happens when contemporary design
                  becomes a means of preserving heritage. Rooted in the handloom traditions of Kerala,
                  the collection brings together pure <strong>handloom cotton</strong>, the quiet elegance of Kerala's
                  whites and <strong>Kasavu</strong>, and contemporary silhouettes with a subtle Indian sensibility.
                  Woven on traditional <strong>pit looms</strong>, the cotton is exceptionally light, soft and
                  breathable, naturally suited to Kerala's climate. The distinctive <strong>Kasavu borders</strong>
                  are created with fine copper strings coated in silver and gold, giving the zari its
                  characteristic depth and lustre. Every garment carries not only the material, but
                  the accumulated knowledge of generations who have worked with it.
                </p>
                {showFullAbout && (
                  <>
                    <p className="body-text tot-intro-text intro-bold">
                      Threads of Travancore is not simply about preserving the past; it is about creating
                      a future for it. <strong>Handloom is a living craft</strong>, sustained by people whose livelihoods
                      and identities are deeply connected to it. Years of skill cannot be replicated
                      overnight, nor can a heritage survive if there is no reason for the craft to
                      continue. We chose to bring this craft into contemporary fashion because tradition
                      does not have to remain in the past to be preserved. It can evolve, be worn,
                      desired and made relevant again. In doing so, we hope to create a meeting point
                      between design and sustainability, modernity and tradition, and commerce and
                      community.
                    </p>
                    <p className="body-text tot-intro-text intro-bold">
                      Threads of Travancore is for those who recognise that beauty is rarely merely
                      aesthetic; that behind every considered piece lies the <strong>labour, knowledge and
                      cultural memory</strong> of those who made it possible. It is for those who value the human
                      hand in an age increasingly defined by the mechanised and the immediate; who
                      understand that <strong>craftsmanship</strong> is not an antiquarian indulgence, but a living
                      repository of knowledge, identity and history. We see this community not as an
                      audience, but as fellow custodians of that appreciation. In bringing these textiles
                      into contemporary design, we hope to participate in something larger than fashion:
                      the continued relevance, dignity and survival of a craft—and of the people whose
                      hands have carried it this far.
                    </p>
                  </>
                )}
                <button
                  type="button"
                  className="about-read-more-btn"
                  onClick={() => setShowFullAbout((prev) => !prev)}
                >
                  {showFullAbout ? 'Read Less' : 'Read More'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="tot-carousel" className="tot-carousel-section">
        <div className="tot-full-screen-wrapper">
          <div className="tot-carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {collectionImages.map((image) => (
              <div key={image.id} className="tot-carousel-slide-item">
                <div className="tot-image-container">
                  <img src={image.src} alt={image.alt} className="tot-optimized-carousel-img" />
                </div>
              </div>
            ))}
          </div>

          <button className="tot-nav-arrow prev" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="tot-nav-arrow next" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          <div className="tot-carousel-dots-container">
            {collectionImages.map((_, index) => (
              <button
                key={index}
                className={`tot-dot-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="tot-marquee-strip">
        <div className="tot-marquee-content">
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
          <span>🚚 FREE DELIVERY ON ALL ORDERS</span>
          <span>✨ HANDCRAFTED WITH LOVE</span>
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

      <ShopRow
        title="Shop Threads of Travancore"
        subtitle="Handloom cotton and Kasavu, made in Kerala"
        fetchOptions={{ limit: 100 }}
        filterFn={(p) => p.collection === 'tot'}
        viewAllLink="/collections/threads-of-travancore/shop"
        themeClass="tot-theme"
      />

      <section className="tot-video-section">
        <div className="tot-video-wrapper">
          <video
            className="tot-video"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/ToT-Video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="tot-video-overlay-content">
            <p className="tot-video-quote">
              "Khadi is not mere cloth, it is thought." — Mahatma Gandhi
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThreadsOfTravancore;