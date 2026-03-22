import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, ShieldAlert, Sparkles, Zap, ShieldCheck, MessageSquare, Menu } from 'lucide-react';

// --- CONFIGURATION ---
const getSafeConfig = () => {
  try {
    const envConfig = import.meta.env?.VITE_FIREBASE_CONFIG;
    if (envConfig) return JSON.parse(envConfig);
    if (typeof __firebase_config !== 'undefined' && __firebase_config) return JSON.parse(__firebase_config);
    return null;
  } catch (err) { return null; }
};

const firebaseConfig = getSafeConfig();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rick-ng-coaching';

let auth, db;
if (firebaseConfig) {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [bookingData, setBookingData] = useState({ name: '', email: '', turbulence: '' });
  const [bookingStatus, setBookingStatus] = useState('idle');

  useEffect(() => {
    // CRITICAL: Hard-coding styles to prevent the "broken" look seen in Vercel screenshots
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      
      :root {
        --brand-blue: #2563eb;
        --brand-dark: #0f172a;
        --text-main: #1e293b;
      }

      body { 
        margin: 0; 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
        background-color: #ffffff; 
        color: var(--text-main);
        line-height: 1.6;
        overflow-x: hidden;
      }

      /* Fix overlapping text seen in screenshots */
      h1, h2, h3 { 
        line-height: 1.1 !important; 
        margin: 0;
        letter-spacing: -0.04em;
        font-weight: 900;
        color: var(--brand-dark);
      }

      .hero-title {
        font-size: clamp(2.5rem, 8vw, 5.5rem);
        margin-bottom: 2rem;
      }

      section {
        padding: 5rem 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dot-bg {
        background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
        background-size: 30px 30px;
      }

      input, textarea {
        font-family: inherit;
        font-size: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        padding: 1rem;
        width: 100%;
        box-sizing: border-box;
      }

      .btn-primary {
        background: var(--brand-dark);
        color: white;
        padding: 1.25rem 2.5rem;
        border-radius: 1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
      }

      .btn-primary:hover {
        background: var(--brand-blue);
        transform: translateY(-2px);
      }

      .testimonial-card {
        background: var(--brand-dark);
        color: white;
        padding: 3rem;
        border-radius: 2rem;
        position: relative;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    // Ensure Tailwind is loaded as an enhancement
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setNewsletterStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'newsletter_leads'), {
        email: newsletterEmail,
        timestamp: serverTimestamp(),
        userId: user.uid
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch (err) { setNewsletterStatus('idle'); }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'bookings'), {
        ...bookingData,
        timestamp: serverTimestamp(),
        userId: user.uid
      });
      setBookingStatus('success');
    } catch (err) { setBookingStatus('idle'); }
  };

  if (!firebaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Configuration Missing</h1>
          <p className="text-slate-500 text-sm mb-6">Your site is live, but it needs your Firebase credentials to handle leads and bookings.</p>
          <div className="bg-slate-100 p-3 rounded-lg font-mono text-[10px] break-all mb-4">VITE_FIREBASE_CONFIG=...</div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold">Check Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-black text-xl tracking-tighter">RICK<span className="text-blue-600">NG</span></div>
          <button 
            onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-5 py-2.5 rounded-full"
          >
            Request Reset
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 text-center dot-bg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-8">
          <Sparkles size={12} /> Practical Antifragility
        </div>
        <h1 className="hero-title">
          Lead when the <br />
          <span className="text-blue-600 italic">bumpy ride</span> is here.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 font-medium">
          Mental architecture for high-variance leaders who need to stay steady when the roadmap fails.
        </p>
        <button 
          onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary"
        >
          Start 15-Minute Reset <ArrowRight size={18} />
        </button>
      </section>

      {/* The Core Shift */}
      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl mb-6">The "Normalcy" Trap</h2>
          <p className="text-lg text-slate-500 mb-8">
            Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-slate-900 font-bold underline decoration-blue-500">calm</span> and the reality of <span className="text-slate-900 font-bold italic">chaos</span>.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600 h-fit"><ShieldCheck /></div>
              <div>
                <h4 className="font-bold">Pop the Bubble</h4>
                <p className="text-sm text-slate-500">Stop wishing for "good days". Simulate the wrinkles before they happen.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-100 p-3 rounded-xl text-slate-900 h-fit"><Anchor /></div>
              <div>
                <h4 className="font-bold">Lead with Weight</h4>
                <p className="text-sm text-slate-500">Become the anchor when stakes are real and environments are unpredictable.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="testimonial-card shadow-2xl shadow-blue-200">
          <MessageSquare className="text-blue-500 mb-6" size={40} />
          <p className="text-2xl font-bold italic mb-8 leading-snug">
            "Rick didn't take away the stress; he made it useful. I feel more capable in a crisis than I ever did in calm waters."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600" />
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              CTO, Series B Fintech
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="booking" className="bg-slate-50 rounded-[3rem] my-20">
        <div className="max-w-xl mx-auto py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl mb-2">15-Minute Reset</h2>
            <p className="text-slate-500 text-sm">A high-impact diagnostic call to stabilize your current situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-white p-10 rounded-3xl text-center border-2 border-blue-600">
              <CheckCircle2 size={48} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl mb-2">Slot Requested</h3>
              <p className="text-slate-500 text-sm">I'll reach out within 24 hours to coordinate.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                <input required type="email" placeholder="Work Email" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
              </div>
              <textarea required placeholder="What turbulence are you dealing with right now?" rows={4} onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} />
              <button disabled={bookingStatus === 'loading'} className="btn-primary w-full justify-center">
                {bookingStatus === 'loading' ? 'Requesting...' : <>Secure Call Slot <Zap size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 text-center border-t border-slate-100">
        <div className="max-w-sm mx-auto">
          <h4 className="font-black uppercase italic mb-2">The Weekly Reset</h4>
          <p className="text-xs text-slate-500 mb-6 font-medium">One mental model for high-variance leaders.</p>
          
          {newsletterStatus === 'success' ? (
            <div className="text-blue-600 font-bold text-xs uppercase tracking-widest">You're on the list.</div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input type="email" required placeholder="Email address" className="bg-slate-50" onChange={e => setNewsletterEmail(e.target.value)} />
              <button className="bg-blue-600 text-white px-6 rounded-xl font-bold text-xs uppercase tracking-widest">Join</button>
            </form>
          )}

          <div className="mt-20 opacity-30">
             <div className="font-black tracking-tighter italic">RICKNG</div>
             <div className="text-[8px] font-black uppercase tracking-[0.4em] mt-2">EST. 2024 // TRUTH IN TURBULENCE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}