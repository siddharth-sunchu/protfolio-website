import React, { useState, useEffect, useRef } from 'react';
import { Linkedin, Book, Database, FileText, Award, Calendar } from 'lucide-react';
import photo from './shalmali_photo.jpg'; // Make sure to have the correct path to your photo
import './IntroductionSection.css';

const IntroductionSection = () => {
  const nameRef = useRef(null);
  const titleRef = useRef(null);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const typeName = (text, ref, delay, callback) => {
      let i = 0;
      ref.current.textContent = ''; // Clear the content before typing
      const interval = setInterval(() => {
        if (i < text.length) {
          ref.current.textContent = text.slice(0, i + 1);
          i++;
        } else {
          clearInterval(interval);
          if (callback) callback();
        }
      }, delay);
    };

    typeName("Shalmali Patil", nameRef, 150, () => {
      setTimeout(() => {
        // titleRef.current.textContent = "Global Tech Leader & Innovator";
        titleRef.current.textContent = "BI Lead @ Amazon Web Services (AWS) | Award Winning Executive Infoscion | Researcher | ML | Data Analytics | Forecasting | Data Management";
        // AWS Finance Analytics and Science Team BI Lead @ Amazon Web Services (AWS) | Award Winning Executive Infoscion | Researcher | ML | Data Analytics | Forecasting | Data Management
        titleRef.current.style.opacity = 1;
      }, 500);
    });

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(cursorInterval);
    };
  }, []);

  const socialLinks = [
    { icon: <Linkedin size={20} />, url: 'https://www.linkedin.com/in/shalmalipatil/', name: 'LinkedIn' },
    { icon: <Database size={20} />, url: 'https://scholar.google.com/citations?user=2vPciC4AAAAJ&hl=en', name: 'Google Scholar' },
    { icon: <Book size={20} />, url: 'https://www.researchgate.net/profile/Shalmali-Patil-2', name: 'ResearchGate' },
    { icon: <FileText size={20} />, url: 'https://orcid.org/0009-0000-4091-2264', name: 'ORCID' },
    { icon: <Award size={20} />, url: 'https://www.webofscience.com/wos/author/record/IUP-8957-2023', name: 'Publons' },
    { icon: <FileText size={20} />, url: 'https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=7228067', name: 'SSRN' },
    { icon: <Book size={20} />, url: 'https://independent.academia.edu/ShalmaliPatil', name: 'Academia' },
  ];

  return (
    <section className="intro-section">
      <div className="container">
        <div className="content-wrapper">
          <div className="text-content">
            <h1 className="intro-heading">
              <span className="hello-text">Hello, I'm</span>
              <br />
              <span ref={nameRef} className="name-text"></span>
              <span className={`cursor ${showCursor ? 'visible' : 'invisible'}`}>|</span>
            </h1>
            <h2 ref={titleRef} className="title-text"></h2>
            <p className="intro-description">
              As a data and AI leader with global experience, I specialize in transforming complex challenges into innovative solutions that drive business success. My expertise spans business intelligence, data analysis, machine learning applications and program management, with a proven track record of delivering impactful outcomes in enterprise software, cloud analytics, and AI-driven strategies. From contributing to groundbreaking research on ethical AI and recommender systems to leading transformative projects at Amazon, my journey reflects a commitment to innovation, excellence, and fostering inclusivity in technology while shaping a smarter, data-driven future.
            </p>
            <p className="intro-description">
              Dedicated to fostering innovation and mentoring the next generation of leaders, I am committed to leveraging the power of data to create impactful solutions that shape the future of industries worldwide.
            </p>
            <div className="consultation-cta-inline">
              <a href="#consultation" className="consultation-cta-btn">
                <Calendar size={20} />
                <span>Book EB-1A Consultation — $50</span>
              </a>
            </div>
          </div>
          <div className="image-container">
            <img src={photo} alt="Shalmali Patil" className="profile-image" />
          </div>
        </div>
        <div className="social-links">
          <h3>Find Me Online</h3>
          <div className="links-container">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="social-link">
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
