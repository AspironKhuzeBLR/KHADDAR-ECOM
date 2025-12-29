import React from 'react';
import './Sustainability.css';
import HeroVideo from '../components/HeroVideo';

const Sustainability = () => {
  const practices = [
    {
      id: 1,
      title: 'Natural Dyes',
      description: 'We use plant-based, eco-friendly dyes sourced responsibly to minimize harm to people and the planet.',
      image: 'https://images.unsplash.com/photo-1743708825952-eb9211e1765c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fHN1c3RhaW5hYmVsZSUyMGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 2,
      title: 'Organic Fabrics',
      description: 'Our collections are created from handwoven, natural textiles that are biodegradable and gentle on the earth.',
      image: 'https://images.unsplash.com/photo-1695694477689-bef8ba8fc5c6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHN1c3RhaW5hYmVsZSUyMGNsb3RoaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 3,
      title: 'Artisan Collaboration',
      description: 'We work closely with local artisan communities, ensuring fair wages, ethical practices, and cultural preservation.',
      image: 'https://plus.unsplash.com/premium_photo-1726704085688-81adb9f4e10e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjAwfHxzdXN0YWluYWJlbGUlMjBjbG90aGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 4,
      title: 'Minimal Waste Approach',
      description: 'Every design is thoughtfully created to reduce waste and promote lasting value.',
      image: 'https://images.unsplash.com/photo-1682802739047-24fa5d983e71?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTIzfHxzdXN0YWluYWJlbGUlMjBjbG90aGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: 5,
      title: 'Eco-conscious Packaging',
      description: 'All packaging is biodegradable or recyclable, completing the cycle of sustainability.',
      image: 'https://plus.unsplash.com/premium_photo-1671467857784-73e69ed7a02e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjA0fHxzdXN0YWluYWJlbGUlMjBjbG90aGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=80&w=1200'
    }
  ];

  return (
    <div className="sustainability-page page-with-transparent-header">
      <HeroVideo 
        title='Sustainability' 
        subtitle="At Khaddar, sustainability isn't a trend — it's our foundation."
        fullHeight={true}
      />

      <section className="sustainability-intro">
        <div className="container">
          <div className="intro-text-wrapper">
            <div className="section-icon">❖</div>
            <span className="section-label">Our Commitment</span>
            <h2 className="section-heading">Crafting with Care</h2>
            <p className="body-text intro-paragraph">
              Through every choice, Khaddar is committed to crafting fashion that honors both tradition and the earth. Our commitment to sustainability runs deep, from the materials we choose to the communities we support.
            </p>
          </div>
        </div>
      </section>

      <section className="practices-section">
        <div className="container">
          <h2 className="section-heading">OUR PRACTICES</h2>
          <div className="practices-grid">
            {practices.map((practice) => (
              <div key={practice.id} className="practice-card">
                <div className="practice-image-wrapper">
                  <img src={practice.image} alt={practice.title} className="practice-image" />
                </div>
                <div className="practice-content">
                  <h3 className="practice-title">{practice.title}</h3>
                  <p className="practice-description">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sustainability-video">
        <div className="video-content-wrapper">
          <video
            className="sustainability-video-element"
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1718128306989-a5bd41566cde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2000"
          >
            <source src="https://cdn.pixabay.com/video/2018/10/25/18897-297379518_tiny.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-quote-wrapper">
            <p className="sustainability-quote">
              "Khadi is freedom in fabric." — Mahatma Gandhi
            </p>
          </div>
        </div>
      </section>

      <section className="commitment-section">
        <div className="container">
          <div className="commitment-content">
            <h2 className="commitment-heading">OUR COMMITMENT</h2>
            <p className="commitment-text">
              We believe that fashion should be a force for good. Every thread, every stitch, and every design decision is made with careful consideration of its impact on our planet and the people who create our beautiful garments. By choosing Khaddar, you're choosing to support a future where fashion and sustainability are one.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sustainability;

