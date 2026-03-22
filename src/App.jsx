import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, ShieldAlert, Sparkles, Zap, ShieldCheck, MessageSquare, Mail } from 'lucide-react';

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
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
      
      :root {
        --brand-blue: #2563eb;
        --brand-dark: #020617;
        --text-main: #1e293b;
      }

      body { 
        margin: 0; 
        font-family: 'Inter', sans-serif; 
        background-color: #ffffff; 
        color: var(--text-main);
        line-height: 1.5;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
      }

      h1, h2, h3 { 
        line-height: 0.95 !important; 
        margin: 0;
        letter-spacing: -0.05em;
        font-weight: 800;
        color: var(--brand-dark);
      }

      .hero-title {
        font-size: clamp(3rem, 10vw, 6rem);
        margin-bottom: 2rem;
      }

      section {
        padding: 6rem 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dot-bg {
        background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
        background-size: 40px 40px;
      }

      .noise {
        position: relative;
      }
      .noise::before {
        content: "";
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0.03;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      }

      input, textarea {
        font-family: inherit;
        font-size: 0.95rem;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        width: 100%;
        background: white;
        transition: border-color 0.2s;
      }
      
      input:focus, textarea:focus {
        outline: none;
        border-color: var(--brand-blue);
      }

      .btn-primary {
        background: var(--brand-dark);
        color: white;
        padding: 1.25rem 2.5rem;
        border-radius: 99px;
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: none;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
      }

      .btn-primary:hover {
        background: var(--brand-blue);
        transform: scale(1.02);
      }

      .testimonial-card {
        background: var(--brand-dark);
        color: white;
        padding: 4rem 3rem;
        border-radius: 40px;
      }
    `;
    document.head.appendChild(style);

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
          <h1 className="text-xl font-bold mb-2 tracking-tight">Configuration Missing</h1>
          <p className="text-slate-500 text-sm mb-6">Your site is live, but it needs your Firebase credentials.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold">Check Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-black text-2xl tracking-tighter">RICK<span className="text-blue-600">NG</span></div>
          <button 
            onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
          >
            Start Reset
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-24 text-center dot-bg">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          <Sparkles size={12} fill="currentColor" /> Practical Antifragility
        </div>
        <h1 className="hero-title">
          Lead when the <br />
          <span className="text-blue-600 italic">bumpy ride</span> is here.
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-xl text-slate-500 mb-12 font-medium tracking-tight">
          Mental architecture for high-variance leaders who need to stay steady when the roadmap fails.
        </p>
        <button 
          onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary"
        >
          Secure Your 15-Min Reset <ArrowRight size={18} />
        </button>
      </section>

      {/* Proof/Testimonial Section */}
      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-5xl tracking-tighter">The "Normalcy" Trap.</h2>
          <p className="text-xl text-slate-500 font-medium tracking-tight leading-relaxed">
            Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-slate-900 font-extrabold underline decoration-blue-500 decoration-4">calm</span> and the reality of <span className="text-slate-900 font-extrabold italic">chaos</span>.
          </p>
          <div className="space-y-6 pt-4">
            <div className="flex gap-5">
              <div className="bg-blue-600 p-3 rounded-2xl text-white h-fit shadow-lg shadow-blue-200"><ShieldCheck /></div>
              <div>
                <h4 className="font-extrabold text-lg tracking-tight">Pop the Bubble</h4>
                <p className="text-slate-500 font-medium">Stop wishing for "good days". Simulate the wrinkles before they happen.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="bg-slate-100 p-3 rounded-2xl text-slate-900 h-fit"><Anchor /></div>
              <div>
                <h4 className="font-extrabold text-lg tracking-tight">Lead with Weight</h4>
                <p className="text-slate-500 font-medium">Become the anchor when stakes are real and environments are unpredictable.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="testimonial-card noise shadow-[0_32px_64px_-16px_rgba(37,99,235,0.25)]">
          <MessageSquare className="text-blue-500 mb-8" size={44} fill="currentColor" />
          <p className="text-3xl font-extrabold italic mb-10 leading-[1.1] tracking-tight">
            "Rick didn't take away the stress; he made it useful. I feel more capable in a crisis than I ever did in calm waters."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-blue-400" />
            <div>
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90 mb-1">Confidential Engagement</div>
               <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-400">CTO, Series B Fintech</div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="booking" className="bg-slate-50 rounded-[4rem] my-20">
        <div className="max-w-xl mx-auto py-16 px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-3 tracking-tighter">15-Minute Reset</h2>
            <p className="text-slate-500 font-medium">A high-impact diagnostic call to stabilize your current situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-blue-600 shadow-xl">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl mb-2 tracking-tight">Request Sent</h3>
              <p className="text-slate-500">I'll reach out within 24 hours to coordinate.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Name" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                <input required type="email" placeholder="Work Email" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
              </div>
              <textarea required placeholder="What turbulence are you dealing with right now?" rows={4} onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} />
              <button disabled={bookingStatus === 'loading'} className="btn-primary w-full justify-center">
                {bookingStatus === 'loading' ? 'Sending...' : <>Secure Call Slot <Zap size={16} /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer / Newsletter */}
      <footer className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg">
            <Mail size={24} />
          </div>
          <h4 className="text-2xl tracking-tighter mb-2">The Weekly Reset</h4>
          <p className="text-slate-500 font-medium mb-8">One actionable mental model for high-variance leaders.</p>
          
          {newsletterStatus === 'success' ? (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm tracking-tight">You're on the list. Check your inbox soon.</div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input type="email" required placeholder="your@workemail.com" className="bg-slate-50 border-transparent text-center sm:text-left" onChange={e => setNewsletterEmail(e.target.value)} />
              <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors">Join</button>
            </form>
          )}

          <div className="mt-24 pt-12 border-t border-slate-50">
             <div className="font-black text-3xl tracking-tighter italic text-slate-200">RICKNG</div>
             <div className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400 mt-4">EST. 2024 // TRUTH IN TURBULENCE</div>
             <p className="text-[10px] text-slate-300 mt-8">© {new Date().getFullYear()} Rick Ng Coaching. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}