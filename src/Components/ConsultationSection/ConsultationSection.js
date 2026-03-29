import { useState, useCallback } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
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
  ArrowRight,
  DollarSign
} from 'lucide-react';
import './ConsultationSection.css';

const CALENDLY_URL = 'https://calendly.com/shalupatil15/30min';
const PAYPAL_CLIENT_ID = 'AcAOMwO2JL6E2Ka-Ddl7WZLt34i9BbY7kjE3oki25qrJ8yJj0iQI-ciH8QU8wdt0s3JXgmUqPfc6XddZ';
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
  const [step, setStep] = useState(1);

  useCalendlyEventListener({
    onEventScheduled: () => setStep(3),
  });

  const handlePayPalApprove = useCallback((_, actions) => {
    return actions.order.capture().then(() => {
      window.location.href = '/thank-you';
    });
  }, []);

  const handlePayPalCreateOrder = useCallback((_, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: { value: CONSULTATION_FEE.toString(), currency_code: 'USD' },
        description: 'EB-1A Consultation with Shalmali Patil (1 Hour)',
      }],
    });
  }, []);

  // Live Stripe Payment Link
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/7sYcMXfK11IgcBT0Pc4Ja00';

  const handleStripePayment = () => {
    window.location.href = STRIPE_PAYMENT_LINK;
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
            <span>Choose Time</span>
          </div>
          <div className="step-line" />
          <div className={`step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">{step > 2 ? <CheckCircle size={18} /> : '2'}</div>
            <span>Schedule</span>
          </div>
          <div className="step-line" />
          <div className={`step-indicator ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-number">{step > 3 ? <CheckCircle size={18} /> : '3'}</div>
            <span>Payment</span>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content step-cta">
            <div className="cta-card">
              <Calendar size={48} className="cta-icon" />
              <h4>Ready to Start Your EB-1A Journey?</h4>
              <p>Select a convenient time slot for your 1-hour consultation.</p>
              <button className="cta-button" onClick={() => setStep(2)}>
                <span>Book Your Consultation</span>
                <ArrowRight size={20} />
              </button>
              <p className="cta-note">$50 consultation fee · Payable after booking</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content calendly-step">
            <InlineWidget
              url={CALENDLY_URL}
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
        )}

        {step === 3 && (
          <div className="step-content payment-step">
            <div className="payment-card">
              <div className="payment-header">
                <CheckCircle size={32} className="success-icon" />
                <h4>Meeting Booked Successfully!</h4>
                <p>Complete your payment to confirm the consultation.</p>
              </div>
              <div className="payment-summary">
                <div className="summary-row">
                  <span>EB-1A Consultation (1 Hour)</span>
                  <span className="price">${CONSULTATION_FEE}.00</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="price">${CONSULTATION_FEE}.00</span>
                </div>
              </div>
              <div className="payment-methods">
                <h5>Choose Payment Method</h5>
                <div className="paypal-container">
                  <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 45 }}
                      createOrder={handlePayPalCreateOrder}
                      onApprove={handlePayPalApprove}
                    />
                  </PayPalScriptProvider>
                </div>
                <div className="payment-divider"><span>or</span></div>
                <button className="stripe-button" onClick={handleStripePayment}>
                  <CreditCard size={20} />
                  <span>Pay with Card (Stripe)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationSection;
