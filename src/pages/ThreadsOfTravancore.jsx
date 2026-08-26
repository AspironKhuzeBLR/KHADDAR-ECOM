import React, { useState, useEffect } from 'react';
import '../pages/KolorsOfKutch.css';
import HeroVideo from '../components/HeroVideo';
import ShopRow from '../components/ShopRow';

// Collection images (everything except tot1/tot3, which are reserved for the Community blog)
import tot2 from '../images/tot2.jpg';
import tot4 from '../images/tot4.jpg';
import tot5 from '../images/tot5.png';
import tot6 from '../images/tot6.png';
import tot7 from '../images/tot7.png';
import tot8 from '../images/tot8.png';
import tot9 from '../images/tot9.png';
import tot10 from '../images/tot10.png';
import tot11 from '../images/tot11.png';
import tot12 from '../images/tot12.png';
import tot13 from '../images/tot13.png';

const ThreadsOfTravancore = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const collectionImages = [
    { id: 1, src: tot2, alt: "Kasavu Drape", title: "Kasavu Drape", description: "Golden-bordered handloom cotton, woven on traditional pit looms." },
    { id: 2, src: tot4, alt: "Ivory Handloom", title: "Ivory Handloom", description: "Soft, breathable cotton in Kerala's signature ivory tone." },
    { id: 3, src: tot5, alt: "Coastal Ceremony", title: "Coastal Ceremony", description: "Draped white and gold, honoring quiet backwater traditions." },
    { id: 4, src: tot6, alt: "The Loom", title: "The Loom", description: "Where every thread of the collection begins, by hand." },
    { id: 5, src: tot7, alt: "Threads of Gold", title: "Threads of Gold", description: "Kasavu trim, spun and set by skilled artisans." },
    { id: 6, src: tot8, alt: "Quiet Drape", title: "Quiet Drape", description: "Graceful silhouettes shaped for comfort and elegance." },
    { id: 7, src: tot9, alt: "Kasavu Trim Shawl", title: "Kasavu Trim Shawl", description: "A lightweight layer finished with golden Kasavu edging." },
    { id: 8, src: tot10, alt: "Backwater Linen", title: "Backwater Linen", description: "Inspired by Kerala's serene coastal landscapes." },
    { id: 9, src: tot11, alt: "Ceremonial White", title: "Ceremonial White", description: "Timeless drape work in handcrafted Khaddar cotton." },
    { id: 10, src: tot12, alt: "Handspun Stole", title: "Handspun Stole", description: "A finishing piece, soft and breathable, for any occasion." },
    { id: 11, src: tot13, alt: "Kerala Kasavu", title: "Kerala Kasavu", description: "Heritage craft meets contemporary design in every thread." }
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
    <div className="collections-page">
      <HeroVideo
        title='THREADS OF TRAVANCORE'
        subtitle='Crafting fashion that honors tradition'
        className='tot-hero'
        hideButton
      />

      <div className="collections-hero">
        <div className="hero-content-wrapper">
          <div className="collections-hero">
            <div className="hero-content-wrapper">
              <div className="collections-icon">❖</div>
              <span className="collections-label">About</span>
              <h1 className="collections-title">Threads of Travancore</h1>
              <div className="section-divider">
                <span className="divider-line-full"></span>
              </div>
              <div className="collections-intro">
                <p className="body-text intro-text intro-bold">
                  Threads of Travancore is an exploration of what happens when contemporary design
                  becomes a means of preserving heritage. Rooted in the handloom traditions of Kerala,
                  the collection brings together pure handloom cotton, the quiet elegance of Kerala's
                  whites and Kasavu, and contemporary silhouettes with a subtle Indian sensibility.
                  Woven on traditional pit looms, the cotton is exceptionally light, soft and
                  breathable, naturally suited to Kerala's climate. The distinctive Kasavu borders
                  are created with fine copper strings coated in silver and gold, giving the zari its
                  characteristic depth and lustre. Every garment carries not only the material, but
                  the accumulated knowledge of generations who have worked with it.
                </p>
                <p className="body-text intro-text intro-bold">
                  Threads of Travancore is not simply about preserving the past; it is about creating
                  a future for it. Handloom is a living craft, sustained by people whose livelihoods
                  and identities are deeply connected to it. Years of skill cannot be replicated
                  overnight, nor can a heritage survive if there is no reason for the craft to
                  continue. We chose to bring this craft into contemporary fashion because tradition
                  does not have to remain in the past to be preserved. It can evolve, be worn,
                  desired and made relevant again. In doing so, we hope to create a meeting point
                  between design and sustainability, modernity and tradition, and commerce and
                  community.
                </p>
                <p className="body-text intro-text intro-bold">
                  Threads of Travancore is for those who recognise that beauty is rarely merely
                  aesthetic; that behind every considered piece lies the labour, knowledge and
                  cultural memory of those who made it possible. It is for those who value the human
                  hand in an age increasingly defined by the mechanised and the immediate; who
                  understand that craftsmanship is not an antiquarian indulgence, but a living
                  repository of knowledge, identity and history. We see this community not as an
                  audience, but as fellow custodians of that appreciation. In bringing these textiles
                  into contemporary design, we hope to participate in something larger than fashion:
                  the continued relevance, dignity and survival of a craft—and of the people whose
                  hands have carried it this far.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="tot-carousel" className="collections-carousel-section">
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

          <button className="nav-arrow prev" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="nav-arrow next" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

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
        fetchOptions={{ mainCategory: "Women's Wear", limit: 100 }}
        filterFn={(p) => /^tot\s*-\s*/i.test(p.name)}
        mapFn={(p) => ({ ...p, name: p.name.replace(/^tot\s*-\s*/i, '').trim() })}
        viewAllLink="/collections/threads-of-travancore/shop"
        themeClass="tot-theme"
      />
    </div>
  );
};

export default ThreadsOfTravancore;