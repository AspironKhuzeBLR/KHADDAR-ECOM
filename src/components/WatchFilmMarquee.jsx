import React, { useEffect, useState } from 'react';
import './WatchFilmMarquee.css';

const getYouTubeEmbedUrl = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  const videoId = match ? match[1] : '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
};

const WatchFilmMarquee = ({ href, className, contentClassName }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={`watch-film-trigger ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <div className={contentClassName}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>THREADS OF TRAVANCORE — <em>WATCH THE FILM</em> ▶</span>
          ))}
        </div>
      </button>

      {isOpen && (
        <div className="watch-film-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="watch-film-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="watch-film-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close video"
            >
              ✕
            </button>
            <div className="watch-film-modal-video-wrap">
              <iframe
                src={getYouTubeEmbedUrl(href)}
                title="Watch the Film"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WatchFilmMarquee;
