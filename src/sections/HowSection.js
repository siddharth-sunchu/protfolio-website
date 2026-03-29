import React from 'react';
import { Rocket, BarChart3, ShieldCheck, AlertTriangle, Map } from 'lucide-react';
import './HowSection.css';

const services = [
  { icon: <BarChart3 size={22} />, title: 'Profile Evaluation', desc: 'Evaluate where you stand today against the 10 EB-1A criteria' },
  { icon: <ShieldCheck size={22} />, title: 'Strategic Strengthening', desc: 'Understand how to strengthen your profile strategically' },
  { icon: <AlertTriangle size={22} />, title: 'Avoid Pitfalls', desc: 'Avoid common mistakes that slow down or weaken applications' },
  { icon: <Map size={22} />, title: 'Clear Roadmap', desc: 'Build a clearer roadmap toward EB-1A readiness' },
];

const HowSection = () => (
  <section id="how" className="landing-section">
    <div className="section-inner">
      <div className="section-label"><Rocket size={14} /> How I Can Help</div>
      <h2 className="section-title">
        1:1 Consultations with <span className="accent">Honest Guidance</span>
      </h2>
      <p className="section-text">
        Through personalized consultations, I help you navigate the EB-1A process
        with clarity and confidence.
      </p>
      <div className="how-grid">
        {services.map((s, i) => (
          <div key={i} className="how-card">
            <div className="how-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
      <p className="section-text" style={{ textAlign: 'center', marginTop: '2rem' }}>
        No fluff. No unrealistic promises.<br />
        <strong style={{ color: '#fff' }}>Just honest, experience-driven guidance.</strong>
      </p>
    </div>
  </section>
);

export default HowSection;
