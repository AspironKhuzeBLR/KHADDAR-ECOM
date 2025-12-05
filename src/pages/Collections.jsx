import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Collections.css';
import HeroVideo from '../components/HeroVideo';

const Collections = () => {
  const collectionImages = [
    {
      id: 1,
      src: "https://smrgampincrwtgtbnzon.supabase.co/storage/v1/object/public/product-images/product%20images/RED%20AJRAKH%20DRESS.jpg ",
      alt: 'Kutch Handicrafts'
    },
    {
      id: 2,
      src: 'https://smrgampincrwtgtbnzon.supabase.co/storage/v1/object/public/product-images/product%20images/RED%20PRINT%20AJRAKH%20SHIRT.jpg',
      alt: 'Kutch Heritage'
    },
  ];

  return (
    <div className="collections-page page-with-transparent-header">
       <HeroVideo title='Collections' subtitle='Crafting fashion that honors tradition'/>
      <div className="collections-hero">
        <div className="hero-content-wrapper">
          <h1 className="collections-title">KOLOURS OF KUTCH</h1>
          <div className="collections-intro">
            <p className="body-text intro-text">
              Introducing exceptional fabric creations, which showcase the rich heritage and artistic prowess of Kutch. The artisans specialize in various techniques, such as handloom weaving, bandhani tie-dyeing, and intricate embroidery like mirror work and thread work. Fabrics from Kutch often feature vibrant colors, geometric patterns, and intricate detailing.
            </p>
            <p className="body-text intro-text">
              Kolours of Kutch is a blend of the fabrics from bhujodi, Kutch & Ajrakhpur and designs tailor made in such a way that each piece tells a story of skill, tradition, and cultural identity.
            </p>
          </div>
        </div>
      </div>

      <section className="collections-gallery">
        <div className="container">
          <div className="gallery-grid">
            {collectionImages.map((image) => (
              <div key={image.id} className="gallery-item">
                <div className="gallery-image-wrapper">
                  <img src={image.src} alt={image.alt} className="gallery-image" />
                  <div className="gallery-overlay">
                    <span className="gallery-label">{image.alt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW BUTTON SECTION START --- */}
      <section className="collections-shop-action">
        <div className="container">
          <div className="shop-action-content">
            <Link to="/shop-collections" className="collections-btn" style={{marginTop : "-130px", borderRadius:"10px"}}>
              Shop The Collection
            </Link>
          </div>
        </div>
      </section>
      {/* --- NEW BUTTON SECTION END --- */}

      <section className="collections-video">
        <div className="video-container">
          <video
            className="collections-video-element"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1718128306989-a5bd41566cde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2000"
          >
            <source src="https://cdn.pixabay.com/video/2024/03/29/206029_tiny.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-text-overlay">
            <p className="video-quote">
              "Each piece tells a story of skill, tradition, and cultural identity."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collections;