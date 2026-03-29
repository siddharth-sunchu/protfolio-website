import React from 'react';
import { ArrowRight } from 'lucide-react';
import './FooterCTA.css';

const FooterCTA = () => (
  <section className="footer-cta-section">
    <div className="footer-cta-inner">
      <h2>Ready to Take the Next Step?</h2>
      <p>
        Let's evaluate your profile and map out a clear path forward.
      </p>
      <a href="#booking" className="footer-cta-btn">
        <span>Book Your Consultation</span>
        <ArrowRight size={18} />
      </a>
    </div>
  </section>
);

export default FooterCTA;
