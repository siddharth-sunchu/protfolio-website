import React from 'react';
import { Lightbulb, Search, Brain, Target, Sparkles } from 'lucide-react';
import './ApproachSection.css';

const points = [
  { icon: <Search size={20} />, text: 'Understand your unique strengths and career story' },
  { icon: <Sparkles size={20} />, text: 'Identify hidden potential within your existing work' },
  { icon: <Brain size={20} />, text: 'Think strategically about positioning and visibility' },
  { icon: <Target size={20} />, text: 'Provide practical insights based on real experience — not just theory' },
];

const ApproachSection = () => (
  <section id="approach" className="landing-section">
    <div className="section-inner">
      <div className="section-label"><Lightbulb size={14} /> What Makes My Approach Different</div>
      <h2 className="section-title">
        Not Generic. Not Legal-Heavy.<br />
        <span className="accent">Grounded in Real Experience.</span>
      </h2>
      <p className="section-text">
        Most guidance around EB-1A is either too generic, too legal-heavy,
        or disconnected from real-world profiles. My approach is different.
      </p>
      <p className="section-text">I work with you to:</p>
      <div className="approach-grid">
        {points.map((point, i) => (
          <div key={i} className="approach-card">
            <div className="approach-icon">{point.icon}</div>
            <p>{point.text}</p>
          </div>
        ))}
      </div>
      <span className="section-highlight">
        Because often, the gap isn't capability. It's clarity.
      </span>
    </div>
  </section>
);

export default ApproachSection;
