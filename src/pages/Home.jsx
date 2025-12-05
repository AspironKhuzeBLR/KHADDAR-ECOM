import React, { useEffect } from 'react';
import HeroVideo from '../components/HeroVideo';
import VisionSection from '../components/VisionSection';
import AboutSection from '../components/AboutSection';
import MissionSection from '../components/MissionSection';
import BrandStory from '../components/BrandStory';
import FeaturedCollection from '../components/FeaturedCollection';

// Import the CSS file that makes the background cream
import '../components/HomeLuxury.css'; 

const FloatingShapes = () => (
  <div className="floating-shapes">
    <div className="floating-shape"></div>
    <div className="floating-shape"></div>
    <div className="floating-shape"></div>
    <div className="floating-shape"></div>
  </div>
);

const Home = () => {
  // Initialize scroll-triggered animations
  useEffect(() => {
    // Observer for section reveal animations
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            // Add staggered animation to children
            const children = entry.target.querySelectorAll('.animate-child');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('child-visible');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    // Observe all sections
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => sectionObserver.observe(section));

    // Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      
      parallaxElements.forEach((el) => {
        const speed = el.dataset.speed || 0.5;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const yPos = (scrolled - el.offsetTop) * speed;
          el.style.transform = `translateY(${yPos * 0.3}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      sectionObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home-page-container page-loaded">
      <HeroVideo />
      <div className="luxury-wrapper pattern-khadi gradient-orbs">
        <FloatingShapes />
        <div className="scroll-section" data-section="vision">
          <VisionSection />
        </div>
        <div className="scroll-section" data-section="about">
          <AboutSection />
        </div>
        <div className="scroll-section" data-section="mission">
          <MissionSection />
        </div>
        <div className="scroll-section" data-section="brand">
          <BrandStory />
        </div>
        <div className="scroll-section" data-section="featured">
          <FeaturedCollection />
        </div>
      </div>
    </div>
  );
};

export default Home;