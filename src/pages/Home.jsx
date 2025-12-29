import React, { useEffect } from 'react';
import HeroVideo from '../components/HeroVideo';
import VisionSection from '../components/VisionSection';
import AboutSection from '../components/AboutSection';
import MissionSection from '../components/MissionSection';
import BrandStory from '../components/BrandStory';
import FeaturedCollection from '../components/FeaturedCollection';
import './Home.css';

// Elegant heritage divider component
const HeritageDivider = ({ variant = 'default' }) => (
  <div className={`heritage-divider heritage-divider-${variant}`}>
    <span className="divider-line"></span>
    <span className="divider-motif">❖</span>
    <span className="divider-line"></span>
  </div>
);

const Home = () => {
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => sectionObserver.observe(section));
    
    return () => {
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <div className="home-page-container page-loaded">
      {/* Hero with Image */}
      <HeroVideo />
      
      
      
      {/* Vision Section */}
      <div className="scroll-section">
        <VisionSection />
      </div>
      
      <HeritageDivider variant="light" />
      
      {/* About Section - with image */}
      <div className="scroll-section">
        <AboutSection />
      </div>
      
      {/* Mission Section */}
      <div className="scroll-section">
        <MissionSection />
      </div>
      
      <HeritageDivider variant="light" />
      
      {/* Brand Story - with image */}
      <div className="scroll-section">
        <BrandStory />
      </div>
      
      <HeritageDivider variant="light" />
      
      {/* Featured Collection */}
      <div className="scroll-section">
        <FeaturedCollection />
      </div>
    </div>
  );
};

export default Home;
