import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => (
  <section id="hero" className="hero-section">
    <div className="hero-inner">
      <div className="hero-badge">
        <Shield size={14} />
        <span>EB-1A Approved &amp; Guiding Others</span>
      </div>
      <h1 className="hero-title">
        From Aspiration to Approval —<br />
        <span className="hero-accent">Navigating EB-1A</span> with<br />
        Clarity and Strategy
      </h1>
      <p className="hero-subtitle">
        I successfully secured the EB-1A — one of the most competitive U.S. immigration
        pathways — and now I help high-achieving professionals position themselves with confidence.
      </p>
      <div className="hero-actions">
        <a href="#booking" className="hero-cta">
          <span>Book a Consultation</span>
          <ArrowRight size={18} />
        </a>
        <a href="#about" className="hero-secondary">Learn My Approach</a>
      </div>
    </div>
    {/* Stats Bar */}
    <div className="stats-bar">
      <div className="stat-block">
        <span className="stat-number">EB-1A</span>
        <span className="stat-label">Approved</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-block">
        <span className="stat-number">1 Hour</span>
        <span className="stat-label">Deep-Dive Session</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-block">
        <span className="stat-number">$50</span>
        <span className="stat-label">Consultation Fee</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-block">
        <span className="stat-number">10+</span>
        <span className="stat-label">Years in Tech</span>
      </div>
    </div>
  </section>
);

export default HeroSection;
