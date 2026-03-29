import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import './ComparisonSection.css';

const h1bItems = [
  'Visa stamping headaches',
  'Employer dependency & restrictions',
  'Layoff anxiety',
  'Years-long backlog wait',
  'Limited travel freedom',
  'Business restrictions',
];

const eb1aItems = [
  'No employer sponsorship needed',
  'Green card in as little as 1 year',
  'Complete job & business freedom',
  'No visa stamping required',
  'Travel without restrictions',
  'Path to citizenship in 5 years',
];

const ComparisonSection = () => (
  <section className="landing-section comparison-section">
    <div className="section-inner">
      <div className="section-label">Why EB-1A?</div>
      <h2 className="section-title" style={{ textAlign: 'center' }}>
        The Traditional Path vs. <span className="accent">EB-1A</span>
      </h2>
      <p className="section-text" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 2.5rem' }}>
        If you're stuck in the H-1B/EB-2/EB-3 cycle, EB-1A offers a fundamentally different path.
      </p>
      <div className="comparison-grid">
        <div className="comparison-col col-traditional">
          <h3>H-1B / EB-2 / EB-3</h3>
          {h1bItems.map((item, i) => (
            <div key={i} className="comparison-item negative">
              <X size={16} />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="comparison-col col-eb1a">
          <h3>EB-1A Green Card</h3>
          {eb1aItems.map((item, i) => (
            <div key={i} className="comparison-item positive">
              <Check size={16} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <a href="#consultation" className="comparison-cta">
          <span>Check If You Qualify</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </section>
);

export default ComparisonSection;
