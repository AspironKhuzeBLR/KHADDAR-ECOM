import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import './ThreadsOfTravancore.css';
import HeroVideo from '../components/HeroVideo';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Story images (curated narrative)
import tot6 from '../images/tot6.png';
import tot7 from '../images/tot7.png';
import tot8 from '../images/tot8.png';
import tot10 from '../images/tot10.png';

const storyImages = [
  { id: 6, src: tot6, line: 'Where the loom begins' },
  { id: 7, src: tot7, line: 'Threads of gold, spun by hand' },
  { id: 8, src: tot8, line: 'Draped in quiet ceremony' },
  { id: 10, src: tot10, line: 'The coast, the calm, the cotton' }
];

const ThreadsOfTravancore = () => {
  const [introRef, introVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();

  return (
    <div className="tot-page">
      <HeroVideo
        title="THREADS OF TRAVANCORE"
        subtitle="Crafting fashion that honors tradition"
        buttonText="EXPLORE THE COLLECTION"
        buttonLink="#tot-story"
        className="tot-hero"
      />

      {/* --- ABOUT --- */}
      <div className="tot-intro-section">
        <div
          ref={introRef}
          className={`tot-intro-wrapper animate-on-scroll ${introVisible ? 'animated' : ''}`}
        >
          <div className="tot-icon">❖</div>
          <span className="tot-label">About</span>
          <h1 className="tot-title">Threads of Travancore</h1>
          <div className="tot-divider"><span className="tot-divider-line"></span></div>
          <p className="tot-intro-text">
            Threads of Travancore celebrates the timeless beauty of Kerala's handloom heritage
            through handcrafted collections in handloom cotton and Kasavu. Woven on traditional
            pit looms by skilled artisans, each fabric reflects generations of craftsmanship,
            blending comfort, elegance, and authenticity.
          </p>
          <p className="tot-intro-text">
            Inspired by Kerala's serene landscapes and vibrant cultural traditions, the collection
            features soft, breathable fabrics with graceful drapes and the signature golden charm
            of Kasavu. Threads of Travancore brings together heritage and contemporary design,
            where every piece tells a story of artistry, tradition, and the enduring beauty of
            handcrafted textiles.
          </p>
        </div>
      </div>

      {/* --- STORY --- */}
      <section id="tot-story" className="tot-story-section">
        <div className="tot-story-list">
          {storyImages.map((image, index) => (
            <ToTStoryRow key={image.id} image={image} reverse={index % 2 !== 0} />
          ))}
        </div>
      </section>

      {/* --- MARQUEE STRIP --- */}
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

      {/* --- CTA --- */}
      <section className="tot-cta-section">
        <div
          ref={ctaRef}
          className={`tot-cta-wrapper animate-on-scroll ${ctaVisible ? 'animated' : ''}`}
        >
          <h2 className="tot-cta-heading">Ready to Experience Threads of Travancore?</h2>
          <p className="tot-cta-subtext">Discover the full collection, available now</p>
          <Link to="/collections/threads-of-travancore/shop" className="tot-cta-btn">
            <span>Explore Collection</span>
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

// Each story row gets its own scroll-observer + a live 3D mouse-tilt effect.
const ToTStoryRow = ({ image, reverse }) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2, triggerOnce: false });
  const imgWrapRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = imgWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const el = imgWrapRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={ref}
      className={`tot-story-row ${reverse ? 'tot-story-reverse' : ''} animate-on-scroll ${
        isVisible ? (reverse ? 'tot-reveal-right animated' : 'tot-reveal-left animated') : (reverse ? 'tot-reveal-right' : 'tot-reveal-left')
      }`}
    >
      <div
        className="tot-story-image-wrap"
        ref={imgWrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img src={image.src} alt="Threads of Travancore collection" className="tot-story-img" />
      </div>
      <p className="tot-story-line">{image.line}</p>
    </div>
  );
};

export default ThreadsOfTravancore;