import React from 'react';
import HeroVideo from '../components/HeroVideo'; // Assuming this exists and works
import VisionSection from '../components/VisionSection';
import AboutSection from '../components/AboutSection';
import MissionSection from '../components/MissionSection';
import BrandStory from '../components/BrandStory';
import FeaturedCollection from '../components/FeaturedCollection';

// Import the CSS file that makes the background cream
import '../components/HomeLuxury.css'; 

const Home = () => {
  return (
    <div className="home-page-container">
      <HeroVideo />
      <div className="luxury-wrapper">
        <VisionSection />
        <AboutSection />
        <MissionSection />
        <BrandStory />
        <FeaturedCollection />
      </div>

    </div>
  );
};

export default Home;