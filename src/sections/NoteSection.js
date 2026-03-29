import React from 'react';
import { Heart } from 'lucide-react';
import './NoteSection.css';

const NoteSection = () => (
  <section className="landing-section note-section">
    <div className="section-inner">
      <div className="note-card">
        <Heart size={28} className="note-icon" />
        <h2>A Note from Me</h2>
        <p>
          I'm still growing, learning, and evolving in my own journey —
          and that's exactly why I understand how complex and personal this process can feel.
        </p>
        <p>
          If you're serious about exploring EB-1A,
          I'd be happy to support you with clarity and direction.
        </p>
        <span className="note-signature">— Shalmali</span>
      </div>
    </div>
  </section>
);

export default NoteSection;
