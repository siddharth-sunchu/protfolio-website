import React from 'react';
import { Calendar, MessageSquare, Map } from 'lucide-react';
import './ProcessSection.css';

const steps = [
  {
    num: '01',
    icon: <Calendar size={28} />,
    title: 'Book Your Session',
    desc: 'Pick a time that works for you. Pay the $50 consultation fee to confirm.',
  },
  {
    num: '02',
    icon: <MessageSquare size={28} />,
    title: 'Deep-Dive Conversation',
    desc: 'We review your background, achievements, and goals in a focused 1-hour call.',
  },
  {
    num: '03',
    icon: <Map size={28} />,
    title: 'Get Your Roadmap',
    desc: 'Walk away with a clear understanding of where you stand and what to do next.',
  },
];

const ProcessSection = () => (
  <section className="landing-section process-section">
    <div className="section-inner">
      <div className="section-label">How It Works</div>
      <h2 className="section-title" style={{ textAlign: 'center' }}>
        Three Simple Steps to <span className="accent">Clarity</span>
      </h2>
      <div className="process-grid">
        {steps.map((step, i) => (
          <div key={i} className="process-card">
            <div className="process-num">{step.num}</div>
            <div className="process-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
