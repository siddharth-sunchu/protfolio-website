import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './FAQSection.css';

const faqs = [
  {
    q: 'What exactly happens during the consultation?',
    a: 'We spend 1 hour reviewing your professional background, achievements, and goals. I evaluate which EB-1A criteria you may meet, identify gaps, and give you a clear picture of where you stand — along with practical next steps.',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. I am not an attorney and this is not legal representation. I provide strategic guidance based on my own successful EB-1A experience and understanding of the process. For legal filings, you should work with a qualified immigration attorney.',
  },
  {
    q: 'I don\'t have major awards or hundreds of citations. Can I still qualify?',
    a: 'Absolutely. EB-1A is about how you position your achievements, not just the raw numbers. Many approved cases come from professionals who strategically presented their existing work. That\'s exactly what we\'ll explore together.',
  },
  {
    q: 'What fields does EB-1A cover?',
    a: 'EB-1A covers sciences, arts, education, business, and athletics. If you work in tech, AI, data science, engineering, research, product management, or similar fields — you\'re in the right space.',
  },
  {
    q: 'How is this different from hiring a lawyer directly?',
    a: 'Lawyers handle the legal filing. I help you think strategically about your profile before you even get to that stage — identifying strengths, filling gaps, and building a narrative. Many people consult with me first, then go to a lawyer with a much stronger case.',
  },
  {
    q: 'What if I\'m not ready for EB-1A yet?',
    a: 'That\'s one of the most valuable outcomes of a consultation. If you\'re not ready today, I\'ll help you understand exactly what to work on and create a timeline so you can be ready in 6-12 months.',
  },
  {
    q: 'Is the $50 fee refundable?',
    a: 'The consultation fee is non-refundable as it reserves dedicated time for your session. However, if you need to reschedule, I\'m happy to accommodate.',
  },
];

const FAQItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{faq.q}</span>
        <ChevronDown size={18} className={`faq-chevron ${open ? 'rotated' : ''}`} />
      </button>
      {open && <p className="faq-answer">{faq.a}</p>}
    </div>
  );
};

const FAQSection = () => (
  <section id="faq" className="landing-section faq-section">
    <div className="section-inner">
      <div className="section-label"><HelpCircle size={14} /> FAQ</div>
      <h2 className="section-title" style={{ textAlign: 'center' }}>
        Common <span className="accent">Questions</span>
      </h2>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <FAQItem key={i} faq={faq} />
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
