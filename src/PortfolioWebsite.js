import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ArrowUp } from 'lucide-react';
import { ConsultationSection } from './Components';
import HeroSection from './sections/HeroSection';
import ComparisonSection from './sections/ComparisonSection';
import AboutSection from './sections/AboutSection';
import ProcessSection from './sections/ProcessSection';
import ApproachSection from './sections/ApproachSection';
import WhoSection from './sections/WhoSection';
import HowSection from './sections/HowSection';
import FAQSection from './sections/FAQSection';
import NoteSection from './sections/NoteSection';
import FooterCTA from './sections/FooterCTA';
import './PortfolioWebsite.css';

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'approach', label: 'Approach' },
  { id: 'who', label: 'Who It\'s For' },
  { id: 'how', label: 'How I Help' },
  { id: 'faq', label: 'FAQ' },
];

const PortfolioWebsite = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="site-wrapper">
      {/* Header */}
      <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="header-inner">
          <a href="#hero" className="site-logo">
            <span className="logo-accent">Shalmali</span> Patil
          </a>
          <nav className="desktop-nav">
            {NAV_LINKS.map(link => (
              <a key={link.id} href={`#${link.id}`} className="nav-link">{link.label}</a>
            ))}
          </nav>
          <a href="#booking" className="header-cta">Book Consultation</a>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isMenuOpen && (
          <nav className="mobile-nav">
            {NAV_LINKS.map(link => (
              <a key={link.id} href={`#${link.id}`} className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}>{link.label}</a>
            ))}
            <a href="#booking" className="mobile-nav-link mobile-nav-cta"
              onClick={() => setIsMenuOpen(false)}>Book Consultation →</a>
          </nav>
        )}
      </header>

      <main>
        <HeroSection />
        <ComparisonSection />
        <AboutSection />
        <ProcessSection />
        <ApproachSection />
        <WhoSection />
        <HowSection />
        <section id="consultation" className="section-dark">
          <ConsultationSection />
        </section>
        <FAQSection />
        <NoteSection />
        <FooterCTA />
      </main>

      {/* Floating CTA */}
      <a href="#booking" className={`floating-cta ${scrolled ? 'visible' : ''}`}>
        <ArrowRight size={16} />
        <span>Book Now — $50</span>
      </a>

      {/* Scroll to top */}
      <button
        className={`scroll-top ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <p className="footer-brand"><span className="logo-accent">Shalmali</span> Patil</p>
            <p className="footer-email">
              <a href="mailto:shalupatil15@gmail.com">shalupatil15@gmail.com</a>
            </p>
          </div>
          <div className="footer-right">
            <p className="footer-disclaimer">
              Disclaimer: This is strategic consultation, not legal advice.
              For legal filings, please work with a qualified immigration attorney.
            </p>
            <p className="footer-copy">&copy; {new Date().getFullYear()} Shalmali Patil. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioWebsite;
