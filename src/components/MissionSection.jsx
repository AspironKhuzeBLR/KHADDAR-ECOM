import React from 'react';
import './MissionSection.css';

const MissionSection = () => {
  return (
    <section className="mission-section pattern-bg">
      <div className="mission-container">
        <div className="mission-icon">❖</div>
        <span className="mission-label">Our Mission</span>
        <h2 className="mission-heading">To Protect & Preserve</h2>
        <p className="mission-text">
          Our mission is to protect the planet by exclusively choosing organic
          fabrics and natural dyes. We stand against the tide of fast fashion,
          weaving India's rich stories into fashion that is meant to be
          treasured, not consumed.
        </p>
      </div>
    </section>
  );
};

export default MissionSection;
