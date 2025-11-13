import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HeroVideo.css';

const HeroVideo = ({title = 'KHADDAR' , subtitle = 'Crafting fashion that honors tradition', fullHeight }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set video properties for mobile autoplay
      video.setAttribute('muted', 'true');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      
      // Ensure video plays on mobile
      const attemptPlay = async () => {
        try {
          await video.play();
        } catch (error) {
          console.log('Autoplay prevented:', error);
          // If autoplay is prevented, try to play when user interacts
          const handleInteraction = () => {
            video.play().catch(e => console.log('Play failed:', e));
            document.removeEventListener('touchstart', handleInteraction);
            document.removeEventListener('click', handleInteraction);
          };
          document.addEventListener('touchstart', handleInteraction, { once: true });
          document.addEventListener('click', handleInteraction, { once: true });
        }
      };
      
      // Try to play when video is loaded
      if (video.readyState >= 2) {
        attemptPlay();
      } else {
        video.addEventListener('loadeddata', attemptPlay, { once: true });
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <section className="hero-video">
      <div className={`video-wrapper ${fullHeight ? 'full-height' : ''}`}>
        <video
          ref={videoRef}
          className="hero-video-element"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster="https://images.unsplash.com/photo-1718128306989-a5bd41566cde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2000"
        >
          <source src="https://cdn.pixabay.com/video/2020/06/18/42439-431738756_large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay">
          <div className="hero-content">
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            <Link
              to="/collections"
              className="hero-cta hero-cta-fullwidth"
              style={{
                display: 'block',
                width: '95vw',
                transform: 'translateX(-50%)',
                position: 'relative',
                boxSizing: 'border-box'
              }}
            >
              EXPLORE COLLECTIONS
            </Link>
          </div>
        </div>
        <button className="mute-toggle" onClick={toggleMute}>
          {isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </div>
    </section>
  );
};

export default HeroVideo;

