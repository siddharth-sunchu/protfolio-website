import { useEffect } from 'react';
import {
  CheckCircle,
  Calendar,
  FileText,
  Star,
  Clock,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="thankyou-page">
      <div className="thankyou-container">
        <div className="thankyou-card">
          <div className="thankyou-icon-wrapper">
            <CheckCircle size={80} className="thankyou-icon" />
          </div>

          <h1 className="thankyou-title">Thank You for Your Payment!</h1>

          <p className="thankyou-subtitle">
            Your EB-1A consultation with Shalmali is now confirmed.
            This is the first step toward building your extraordinary ability
            petition — you're already on the right track.
          </p>

          <div className="thankyou-quote">
            <Heart size={20} className="quote-icon" />
            <p>
              Shalmali looks forward to reviewing your profile and helping you
              craft a compelling EB-1A strategy. Every great journey starts with
              a single step — and you've just taken yours.
            </p>
          </div>

          <div className="thankyou-next-steps">
            <h2>What to Expect Next</h2>
            <div className="next-step-item">
              <Calendar size={20} />
              <span>A calendar invite with meeting link will arrive in your inbox shortly</span>
            </div>
            <div className="next-step-item">
              <FileText size={20} />
              <span>Prepare your resume, publications list, and any awards or recognitions</span>
            </div>
            <div className="next-step-item">
              <Star size={20} />
              <span>Jot down your top achievements — Shalmali will help map them to EB-1A criteria</span>
            </div>
            <div className="next-step-item">
              <Clock size={20} />
              <span>Your 1-hour session will cover profile evaluation, evidence gaps, and next steps</span>
            </div>
          </div>

          <div className="thankyou-footer">
            <p>Questions before your session? Reach out at{' '}
              <a href="mailto:shalupatil15@gmail.com">shalupatil15@gmail.com</a>
            </p>
          </div>

          <Link to="/" className="back-home-btn">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
