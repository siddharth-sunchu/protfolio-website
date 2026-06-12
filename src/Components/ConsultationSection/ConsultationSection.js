import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Award,
  Users,
  BookOpen,
  Globe,
  Star,
  DollarSign,
  Heart,
  Loader2,
  AlertCircle,
  CreditCard,
  Video,
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

const fmtTime = (iso) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
const fmtFull = (iso) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
const localKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthLabel = (d) => new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(d);

const ConsultationSection = () => {
  // phase: picker → (Stripe) → confirming → confirmed | failed
  const [phase, setPhase] = useState('picker');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDayKey, setSelectedDayKey] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [viewMonth, setViewMonth] = useState(null); // first-of-month Date for the visible calendar month

  const tzLabel = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const loadAvailability = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch('/api/availability');
      const data = await res.json();
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setError('Could not load available times. Please refresh.');
    }
    setLoadingSlots(false);
  }, []);

  const pollBookingStatus = useCallback(async (sessionId, attempt = 0) => {
    try {
      const res = await fetch(`/api/booking-status?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (data.status === 'confirmed') {
        setConfirmation(data);
        setPhase('confirmed');
        return;
      }
      if (data.status === 'processing' && attempt < 10) {
        setTimeout(() => pollBookingStatus(sessionId, attempt + 1), 2000);
        return;
      }
      if (data.status === 'processing') {
        // Took long, but payment succeeded — show optimistic confirmation.
        setConfirmation({ slotStart: data.slotStart, meetLink: null });
        setPhase('confirmed');
        return;
      }
      setError(data.error || "We couldn't confirm your booking. If you were charged, email shalupatil15@gmail.com.");
      setPhase('failed');
    } catch {
      setError('Could not confirm your booking. If you were charged, please contact us.');
      setPhase('failed');
    }
  }, []);

  // On mount: handle Stripe return, otherwise load availability.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('booking') === 'confirmed' && params.get('session_id')) {
      setPhase('confirming');
      setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      pollBookingStatus(params.get('session_id'));
      return;
    }
    if (params.get('booking') === 'cancelled') {
      setError('Payment was cancelled and your slot was released. Pick a time to try again.');
    }
    loadAvailability();
  }, [loadAvailability, pollBookingStatus]);

  // Group slots by the visitor's LOCAL date.
  const { byDay, availableKeys, firstDay, lastDay } = useMemo(() => {
    const map = new Map();
    for (const iso of slots) {
      const dt = new Date(iso);
      const key = localKey(dt);
      if (!map.has(key)) map.set(key, { date: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()), times: [] });
      map.get(key).times.push(iso);
    }
    const sorted = [...map.values()].map((v) => v.date).sort((a, b) => a - b);
    return { byDay: map, availableKeys: new Set(map.keys()), firstDay: sorted[0] || null, lastDay: sorted[sorted.length - 1] || null };
  }, [slots]);

  // Auto-land on the first available day and open its month.
  useEffect(() => {
    if (firstDay && !selectedDayKey) {
      setSelectedDayKey(localKey(firstDay));
      setViewMonth(new Date(firstDay.getFullYear(), firstDay.getMonth(), 1));
    }
  }, [firstDay, selectedDayKey]);

  const selectedDay = selectedDayKey ? byDay.get(selectedDayKey) : null;

  const handleBook = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in every field.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotStart: selectedSlot, ...form }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || 'Could not start checkout. Please try again.');
      setSubmitting(false);
      if (res.status === 409) {
        setSelectedSlot(null);
        loadAvailability();
      }
    } catch {
      setError('Could not reach the booking service. Please try again.');
      setSubmitting(false);
    }
  };

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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

      {/* Booking */}
      <div className="booking-flow" id="booking">
        <h3 className="section-heading">
          Book Your <span className="highlight">Consultation</span>
        </h3>

        <div className="booking-meta">
          <span><Clock size={16} /> 30 minutes</span>
          <span><Video size={16} /> Google Meet</span>
          <span><CreditCard size={16} /> ${CONSULTATION_FEE} · paid to confirm</span>
        </div>

        {phase === 'picker' && (
          <div className="step-content">
            {loadingSlots ? (
              <div className="booking-loading"><Loader2 size={28} className="spin" /><p>Loading available times…</p></div>
            ) : availableKeys.size === 0 || !viewMonth ? (
              <div className="booking-empty"><p>No times are open right now — please check back soon.</p></div>
            ) : (
              <div className="booking-picker">
                <div className="picker-tz">Times shown in your timezone · {tzLabel}</div>

                {(() => {
                  const year = viewMonth.getFullYear();
                  const month = viewMonth.getMonth();
                  const firstWeekday = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const todayKey = localKey(new Date());
                  const firstMonth = firstDay && new Date(firstDay.getFullYear(), firstDay.getMonth(), 1);
                  const lastMonth = lastDay && new Date(lastDay.getFullYear(), lastDay.getMonth(), 1);
                  const canPrev = firstMonth && viewMonth > firstMonth;
                  const canNext = lastMonth && viewMonth < lastMonth;
                  const monthHasAvail = [...byDay.values()].some((v) => v.date.getFullYear() === year && v.date.getMonth() === month);
                  const nextAvail = [...byDay.values()].map((v) => v.date).sort((a, b) => a - b)
                    .find((d) => d.getFullYear() > year || (d.getFullYear() === year && d.getMonth() > month));
                  const cells = [];
                  for (let i = 0; i < firstWeekday; i++) cells.push(null);
                  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                  return (
                    <div className="cal-wrap">
                      <div className="cal">
                        <div className="cal-head">
                          <button className="cal-nav" disabled={!canPrev} aria-label="Previous month"
                            onClick={() => setViewMonth(new Date(year, month - 1, 1))}>‹</button>
                          <span className="cal-month">{monthLabel(viewMonth)}</span>
                          <button className="cal-nav" disabled={!canNext} aria-label="Next month"
                            onClick={() => setViewMonth(new Date(year, month + 1, 1))}>›</button>
                        </div>
                        <div className="cal-dow">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
                        <div className="cal-grid">
                          {cells.map((d, i) => {
                            if (d === null) return <span key={`b${i}`} className="cal-cell empty" />;
                            const key = localKey(new Date(year, month, d));
                            const avail = availableKeys.has(key);
                            const cls = `cal-cell ${avail ? 'avail' : 'off'} ${selectedDayKey === key ? 'sel' : ''} ${key === todayKey ? 'today' : ''}`;
                            return avail ? (
                              <button key={key} className={cls} aria-pressed={selectedDayKey === key}
                                onClick={() => { setSelectedDayKey(key); setSelectedSlot(null); setError(''); }}>{d}</button>
                            ) : (
                              <span key={key} className={cls} aria-disabled="true">{d}</span>
                            );
                          })}
                        </div>
                        {!monthHasAvail && (
                          <div className="cal-empty">
                            No openings in {new Intl.DateTimeFormat(undefined, { month: 'long' }).format(viewMonth)}.
                            {nextAvail && (
                              <button className="cal-next-link"
                                onClick={() => { setViewMonth(new Date(nextAvail.getFullYear(), nextAvail.getMonth(), 1)); setSelectedDayKey(localKey(nextAvail)); setSelectedSlot(null); }}>
                                Next available: {new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(nextAvail)} →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="cal-times">
                        {selectedDay ? (
                          <>
                            <div className="ct-day">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(selectedDay.date)}</div>
                            <div className="ct-list">
                              {selectedDay.times.map((iso) => (
                                <button key={iso} className={`time-pill ${selectedSlot === iso ? 'active' : ''}`}
                                  onClick={() => { setSelectedSlot(iso); setError(''); }}>{fmtTime(iso)}</button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="ct-hint">Select a date to see available times.</div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {selectedSlot && (
                  <div className="booking-form">
                    <div className="bf-selected"><CheckCircle size={16} /> {fmtFull(selectedSlot)}</div>
                    <div className="bf-grid">
                      <input className="bf-input" placeholder="First name" value={form.firstName} onChange={setField('firstName')} />
                      <input className="bf-input" placeholder="Last name" value={form.lastName} onChange={setField('lastName')} />
                      <input className="bf-input" type="email" placeholder="Email address" value={form.email} onChange={setField('email')} />
                      <input className="bf-input" type="tel" placeholder="Phone number" value={form.phone} onChange={setField('phone')} />
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

                    {error && (
                      <div className="payment-error"><AlertCircle size={16} /><span>{error}</span></div>
                    )}

                    <button className="stripe-button" onClick={handleBook} disabled={submitting}>
                      {submitting ? <Loader2 size={20} className="spin" /> : <CreditCard size={20} />}
                      <span>{submitting ? 'Starting secure checkout…' : `Pay $${CONSULTATION_FEE} & Book`}</span>
                    </button>
                    <p className="payment-note">
                      No refunds · reschedule via your calendar invite · have a promo code? Add it at checkout.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {phase === 'confirming' && (
          <div className="step-content">
            <div className="booking-loading"><Loader2 size={28} className="spin" /><p>Confirming your booking…</p></div>
          </div>
        )}

        {phase === 'confirmed' && confirmation && (
          <div className="step-content confirmation-step">
            <div className="confirmation-card">
              <CheckCircle size={56} className="confirmation-icon" />
              <h4>You're booked! 🎉</h4>
              <p className="confirmation-main-text">
                Your 30-minute EB-1A consultation is confirmed for{' '}
                <strong>{confirmation.slotStart ? fmtFull(confirmation.slotStart) : 'your selected time'}</strong>.
                A Google Calendar invite with your Meet link is on its way to your inbox.
              </p>
              {confirmation.meetLink && (
                <a className="meet-button" href={confirmation.meetLink} target="_blank" rel="noreferrer">
                  <Video size={18} /> Join Google Meet
                </a>
              )}
              <div className="confirmation-details">
                <div className="detail-item"><Calendar size={18} /><span>Need to reschedule? Use the link in your Google Calendar invite.</span></div>
                <div className="detail-item"><FileText size={18} /><span>Have your CV, publication list, and awards handy for the call.</span></div>
                <div className="detail-item"><Heart size={18} /><span>Shalmali looks forward to helping you craft a compelling EB-1A strategy.</span></div>
              </div>
              <div className="confirmation-footer">
                <p>Questions before your session? <a href="mailto:shalupatil15@gmail.com">shalupatil15@gmail.com</a></p>
              </div>
            </div>
          </div>
        )}

        {phase === 'failed' && (
          <div className="step-content">
            <div className="payment-card" style={{ textAlign: 'center' }}>
              <AlertCircle size={32} style={{ color: '#ff8d8d', marginBottom: '0.75rem' }} />
              <h4>Booking not confirmed</h4>
              <p className="payment-note">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationSection;
