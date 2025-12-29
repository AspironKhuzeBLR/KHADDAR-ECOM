import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

const culturalThoughts = [
  {
    quote: "Khadi is not just a fabric; it is a movement.",
    context: "— Narendra Modi"
  },
  {
    quote: "Indian crafts are living traditions.",
    context: "— Pupul Jayakar"
  },
  {
    quote: "Craft is the language of the people.",
    context: "— Pupul Jayakar"
  },
  {
    quote: "Tradition is a living force.",
    context: "— Rabindranath Tagore"
  },
  {
    quote: "Khadi is freedom in fabric.",
    context: "— Mahatma Gandhi"
  },
  {
    quote: "To save crafts is to save livelihoods.",
    context: "— Kamaladevi Chattopadhyay"
  },
  {
    quote: "The soul of India lives in its villages.",
    context: "— Sarojini Naidu"
  }
];

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentThought, setCurrentThought] = useState(culturalThoughts[0]);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      // Pick a random thought
      const randomIndex = Math.floor(Math.random() * culturalThoughts.length);
      setCurrentThought(culturalThoughts[randomIndex]);
      
      // Start transition
      setIsTransitioning(true);
      
      // After 2 seconds, complete transition
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <>
      {/* Transition Overlay */}
      <div className={`page-transition-overlay ${isTransitioning ? 'active' : ''}`}>
        <div className="transition-content">
          {/* Decorative element */}
          <div className="transition-motif">◇</div>
          
          {/* Quote */}
          <blockquote className="transition-quote">
            "{currentThought.quote}"
          </blockquote>
          
          {/* Context */}
          <p className="transition-context">{currentThought.context}</p>
          
          {/* Loading indicator */}
          <div className="transition-loader">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className={`page-content ${isTransitioning ? 'transitioning' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default PageTransition;

