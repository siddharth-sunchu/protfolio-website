import React from 'react';
import { User } from 'lucide-react';

const AboutSection = () => (
  <section id="about" className="landing-section" style={{ background: '#050505' }}>
    <div className="section-inner">
      <div className="section-label"><User size={14} /> About</div>
      <h2 className="section-title">
        I Built My Career <span className="accent">Step by Step</span>
      </h2>
      <p className="section-text">
        I come from a non-traditional background and built my career in the global tech industry.
        Over the years, I've worked on high-impact projects, contributed to innovation in data and AI,
        and developed a strong professional footprint.
      </p>
      <p className="section-text">
        Like many, I once looked at EB-1A and thought:
      </p>
      <span className="section-highlight">
        "Is this even possible for me?"
      </span>
      <p className="section-text">
        What I realized through the journey is this: EB-1A is not just about having achievements.
        It's about how you <strong style={{ color: '#fff' }}>position, present, and connect your story</strong>.
      </p>
      <p className="section-text">
        I navigated the process strategically — understanding what matters, what doesn't,
        and how to build a compelling narrative.
      </p>
      <span className="section-highlight">
        Today, I bring that clarity to others.
      </span>
    </div>
  </section>
);

export default AboutSection;
