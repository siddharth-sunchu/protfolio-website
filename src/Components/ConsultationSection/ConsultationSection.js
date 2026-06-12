import { useState, useEffect } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import {
  Calendar,
  CreditCard,
  CheckCircle,
  FileText,
  Award,
  Users,
  BookOpen,
  Globe,
  Star,
  DollarSign,
  Clock,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import './ConsultationSection.css';

const CONSULTATION_FEE = 50;

const eb1aCriteria = [
  { icon: <Award size={20} />, title: 'Awards & Prizes', desc: 'Nationally or internationally recognized awards for excellence' },
  { icon: <Users size={20} />, title: 'Membership', desc: 'Membership in associations requiring outstanding achievements' },
  { icon: <FileText size={20} />, title: 'Published Material', desc: 'Published material about you in professional or major media' },
  { icon: <Star size={20} />, title: 'Judging', desc: 'Participation as a judge of the work of others in your field' },
  { icon: <BookOpen size={20} />, title: 'Original Contributions', desc: 'Original scientific, scholarly, or business contributions of major significance' },
  { icon: <FileText size={20} />, title: 'Scholarly Articles', desc: 'Authorship of scholarly articles in professional journals or major media' },
  { icon: <Globe size={20} />, title: 'Exhibitions', desc: 'Display of work at artistic exhibitions or showcases' },
  { icon: <Users size={20} />, title: 'Leading Role', desc: 'Leading or critical role in distinguished organizations' },
  { icon: <DollarSign size={20} />, title: 'High Salary', desc: 'High salary or remuneration relative to others in the field' },
  { icon: <Star size={20} />, title: 'Commercial Success', desc: 'Commercial successes in the performing arts' },
];

const ConsultationSection = () => {
  // Flow order: 1 = Pay (Stripe), 2 = Schedule (Calendly), 3 = Confirmed.
  // Payment is verified server-side before the Calendly scheduler is revealed.
  const [step, setStep] = useState(1);
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [processing, setProcessing] = useState(false); // creating the checkout session
  const [verifying, setVerifying] = useState(false); // confirming payment on return
  const [error, setError] = useState('');

  // On return from Stripe, confirm the payment with our API BEFORE showing the
  // scheduler. The Calendly URL is only returned by the API once payment is
  // verified — it is never present in the page bundle.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    setVerifying(true);
    setError('');
    fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paid && data.calendlyUrl) {
          setCalendlyUrl(data.calendlyUrl);
          setStep(2);
          window.setTimeout(() => {
            document
              .getElementById('booking')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          setError(
            data.error ||
              "We couldn't confirm your payment. If you were charged, please email shalupatil15@gmail.com and we'll sort it out right away.",
          );
        }
      })
      .catch(() => {
        setError('Something went wrong while confirming your payment. Please refresh, or contact us if you were charged.');
      })
      .finally(() => setVerifying(false));
  }, []);

  // Calendly fires this once the visitor has confirmed a time slot.
  useCalendlyEventListener({
    onEventScheduled: () => setStep(3),
  });

  const handleStripePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Could not start checkout. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      setError('Could not reach the payment service. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="consultation-container">
      {/* EB-1A Criteria */}
      <div className="criteria-section">
        <h3 className="section-heading">
          The 10 EB-1A Criteria <span className="highlight">You Need to Know</span>
        </h3>
        <p className="criteria-intro">
          To qualify for EB-1A, you must meet at least 3 of these 10 criteria established by USCIS.
          I can evaluate your profile and help you identify which criteria you meet.
        </p>
        <div className="criteria-grid">
          {eb1aCriteria.map((criterion, index) => (
            <div key={index} className="criteria-card">
              <div className="criteria-icon">{criterion.icon}</div>
              <div className="criteria-content">
                <h4>{criterion.title}</h4>
                <p>{criterion.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Flow */}
      <div className="booking-flow" id="booking">
        <h3 className="section-heading">
          Book Your <span className="highlight">Consultation</span>
        </h3>

        <div className="step-indicators">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">{step > 1 ? <CheckCircle size={18} /> : '1'}</div>
            <span>Pay</span>
          </div>
          <div className="step-line" />
          <div className={`step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">{step > 2 ? <CheckCircle size={18} /> : '2'}</div>
            <span>Schedule</span>
          </div>
          <div className="step-line" />
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">{step >= 3 ? <CheckCircle size={18} /> : '3'}</div>
            <span>Confirmed</span>
          </div>
        </div>

        {verifying && (
          <div className="step-content payment-step">
            <div className="payment-card" style={{ textAlign: 'center' }}>
              <Loader2 size={32} className="success-icon spin" />
              <h4>Confirming your payment…</h4>
              <p className="payment-note">This only takes a moment.</p>
            </div>
          </div>
        )}

        {!verifying && step === 1 && (
          <div className="step-content payment-step">
            <div className="payment-card">
              <div className="payment-header">
                <CreditCard size={32} className="success-icon" />
                <h4>Reserve Your Consultation</h4>
                <p>Pay the consultation fee to unlock scheduling — you'll pick your time right after checkout.</p>
              </div>
              <div className="payment-summary">
                <div className="summary-row">
                  <span>EB-1A Consultation (30 Min)</span>
                  <span className="price">${CONSULTATION_FEE}.00</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="price">${CONSULTATION_FEE}.00</span>
                </div>
              </div>
              <p className="payment-note">Have a promo code? Add it on the secure checkout page to apply your discount.</p>
              {error && (
                <div className="payment-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <button className="stripe-button" onClick={handleStripePayment} disabled={processing}>
                {processing ? <Loader2 size={20} className="spin" /> : <CreditCard size={20} />}
                <span>{processing ? 'Starting secure checkout…' : 'Pay $50 & Reserve — Secure Checkout'}</span>
              </button>
              <p className="payment-note">Powered by Stripe · Cards, Apple Pay, Google Pay &amp; more</p>
            </div>
          </div>
        )}

        {!verifying && step === 2 && calendlyUrl && (
          <div className="step-content calendly-step-wrapper">
            <div className="payment-header">
              <CheckCircle size={32} className="success-icon" />
              <h4>Payment Received</h4>
              <p>Pick your 30-minute slot below to lock in your consultation.</p>
            </div>
            <div className="calendly-step">
              <InlineWidget
                url={calendlyUrl}
                styles={{ height: '700px', width: '100%' }}
                pageSettings={{
                  backgroundColor: '000000',
                  hideEventTypeDetails: false,
                  hideLandingPageDetails: false,
                  primaryColor: 'CDFF00',
                  textColor: 'ffffff',
                }}
              />
            </div>
          </div>
        )}

        {!verifying && step === 3 && (
          <div className="step-content confirmation-step">
            <div className="confirmation-card">
              <div className="confirmation-icon-wrapper">
                <CheckCircle size={64} className="confirmation-icon" />
              </div>
              <h4>You're All Set!</h4>
              <p className="confirmation-main-text">
                Your 30-minute EB-1A consultation is booked and paid. A calendar
                invite with the meeting link is on its way to your inbox.
              </p>
              <div className="confirmation-message">
                <Heart size={20} className="heart-icon" />
                <p>
                  Shalmali looks forward to reviewing your profile and helping you
                  craft a compelling EB-1A strategy. Every great journey starts
                  with a single step — and you've just taken yours.
                </p>
              </div>
              <div className="confirmation-details">
                <h5>What to Expect Next</h5>
                <div className="detail-item">
                  <Calendar size={18} />
                  <span>A calendar invite with the meeting link will arrive shortly</span>
                </div>
                <div className="detail-item">
                  <FileText size={18} />
                  <span>Prepare your resume, publications list, and any awards or recognitions</span>
                </div>
                <div className="detail-item">
                  <Clock size={18} />
                  <span>Your 30-minute session covers profile evaluation, evidence gaps, and next steps</span>
                </div>
              </div>
              <div className="confirmation-footer">
                <p>Questions before your session? Reach out at{' '}
                  <a href="mailto:shalupatil15@gmail.com">shalupatil15@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationSection;
