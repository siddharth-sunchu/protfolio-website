import React from 'react';
import { Target, Check } from 'lucide-react';
import './WhoSection.css';

const criteria = [
  'A professional in tech, AI, data, research, or similar fields',
  'Already doing meaningful work but unsure how it fits EB-1A',
  'Feeling overwhelmed by conflicting advice online',
  'Looking for a practical, structured way forward',
];

const WhoSection = () => (
  <section id="who" className="landing-section" style={{ background: '#050505' }}>
    <div className="section-inner">
      <div className="section-label"><Target size={14} /> Who This Is For</div>
      <h2 className="section-title">
        This Is for You <span className="accent">If You Are...</span>
      </h2>
      <div className="who-list">
        {criteria.map((item, i) => (
          <div key={i} className="who-item">
            <Check size={20} className="who-check" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhoSection;
