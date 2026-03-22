import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, ShieldAlert, Sparkles, AlertTriangle, Zap } from 'lucide-react';

// --- CONFIGURATION LOADER ---
const getSafeConfig = () => {
  try {
    const envConfig = import.meta.env?.VITE_FIREBASE_CONFIG;
    if (envConfig) return JSON.parse(envConfig);
    if (typeof __firebase_config !== 'undefined' && __firebase_config) return JSON.parse(__firebase_config);
    return null;
  } catch (err) {
    return null;
  }
};

const firebaseConfig = getSafeConfig();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rick-ng-coaching';

// Initialize Firebase
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
    // 1. Set Tailwind Config for CDN
    window.tailwind = {
      theme: {
        extend: {
          colors: {
            brand: {
              blue: '#2563eb',
              dark: '#0f172a'
            }
          }
        }
      }
    };

    // 2. Inject Tailwind CDN if missing
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    // 3. Global CSS Fixes
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      body { 
        margin: 0; 
        font-family: 'Inter', sans-serif; 
        background-color: #fafafa; 
        -webkit-font-smoothing: antialiased;
        scroll-behavior: smooth;
      }
      .hero-title {
        line-height: 1.05 !important;
        letter-spacing: -0.04em !important;
      }
      .bg-grid {
        background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
        background-size: 32px 32px;
      }
      @media (max-width: 640px) {
        .hero-title { font-size: 2.75rem !important; }
      }
    `;
    document.head.appendChild(style);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Required</h1>
          <p className="text-slate-500 mb-6 italic text-sm">VITE_FIREBASE_CONFIG missing in Vercel settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 overflow-x-hidden w-full">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="font-black text-2xl tracking-tighter italic text-slate-900 flex items-center gap-1 uppercase">
            RICK<span className="text-blue-600">NG</span>
          </div>
          <button 
            onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden sm:flex text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-600 hover:scale-105 transition-all items-center gap-2"
          >
            Request Reset <ArrowRight size={12} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-36 pb-24 sm:pt-56 sm:pb-40 px-6 bg-white overflow-hidden bg-grid">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 shadow-sm">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-blue-700">Practical Antifragility</span>
          </div>
          
          <h1 className="hero-title text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-slate-900 mb-10">
            Lead when the <br className="hidden sm:block" />
            <span className="text-blue-600 italic">bumpy ride</span> is here.
          </h1>
          
          <p className="text-lg sm:text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-14 px-4 font-medium">
            Mental architecture for high-variance leaders who need to stay steady when the roadmap fails.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
            >
              Start 15-Minute Reset <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* The Core Shift */}
      <section className="py-24 px-4 sm:px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3.5rem] p-8 sm:p-24 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black mb-10 italic tracking-tight">The "Normalcy" Trap</h2>
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <p className="text-xl sm:text-2xl text-slate-400 leading-relaxed font-medium">
                Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-white">calm</span> and the reality of <span className="text-blue-400">chaos</span>.
              </p>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                  <ShieldAlert className="text-blue-500 mb-6" size={32} />
                  <h3 className="font-black text-xl mb-3 tracking-tight">Pop the Bubble</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Stop wishing for good days. Start simulating the wrinkles before they happen.</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                  <Anchor className="text-white mb-6" size={32} />
                  <h3 className="font-black text-xl mb-3 tracking-tight">Lead with Weight</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Become the anchor when stakes are real and environments are high-variance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-6 border-y border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1.5 mb-8">
            {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-blue-600" />)}
          </div>
          <blockquote className="text-2xl sm:text-4xl font-bold text-slate-900 italic mb-12 leading-tight tracking-tight">
            "Rick didn't take away the stress; he made it useful. I feel more capable in a crisis than I ever did in calm waters."
          </blockquote>
          <div className="inline-flex items-center gap-4">
            <div className="h-[1px] w-8 bg-slate-200"></div>
            <div className="font-black text-slate-500 uppercase tracking-widest text-[11px]">CTO, Series B Fintech</div>
            <div className="h-[1px] w-8 bg-slate-200"></div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="reset" className="py-32 px-6 bg-[#fafafa]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight italic uppercase">15-Minute Reset</h2>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">A diagnostic call to stabilize your current leadership situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-white border border-blue-100 p-12 rounded-[3rem] text-center shadow-xl animate-fade-in">
              <CheckCircle2 size={64} className="text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-900 mb-2">Confirmed.</h3>
              <p className="text-slate-500 font-medium">I'll email you personally within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  required 
                  placeholder="Name" 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" 
                  onChange={e => setBookingData({...bookingData, name: e.target.value})} 
                />
                <input 
                  required 
                  type="email" 
                  placeholder="Work Email" 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium" 
                  onChange={e => setBookingData({...bookingData, email: e.target.value})} 
                />
              </div>
              <textarea 
                required 
                placeholder="Where is the turbulence right now?" 
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium resize-none" 
                onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} 
              />
              <button 
                disabled={bookingStatus === 'loading'} 
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]"
              >
                {bookingStatus === 'loading' ? 'Processing...' : <>Secure Call Slot <Zap size={14} /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer / Newsletter */}
      <footer className="py-24 px-6 bg-white border-t border-slate-100 text-center">
        <div className="max-w-xl mx-auto">
          <div className="mb-12">
            <h4 className="font-black text-2xl text-slate-900 mb-3 tracking-tight italic uppercase">The Weekly Reset</h4>
            <p className="text-slate-500 font-medium mb-8">One mental model for the high-variance leader.</p>
            
            {newsletterStatus === 'success' ? (
              <div className="p-4 bg-blue-50 text-blue-700 font-bold rounded-xl text-sm italic">
                You're in. Watch your inbox.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  required 
                  placeholder="Your email" 
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none text-sm font-medium focus:border-blue-600 transition-all"
                  onChange={e => setNewsletterEmail(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all">Join</button>
              </form>
            )}
          </div>
          
          <div className="pt-12 border-t border-slate-50 flex flex-col items-center gap-6">
            <div className="font-black text-xl tracking-tighter italic text-slate-300 uppercase">
              RICK<span className="text-slate-200">NG</span>
            </div>
            <div className="text-slate-400 text-[10px] uppercase tracking-[0.5em] font-black">
              EST. 2024 // TRUTH IN TURBULENCE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}