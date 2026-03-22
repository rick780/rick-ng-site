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

  // BULLETPROOF STYLE INJECTION
  // This ensures Tailwind works even if your Vercel build environment isn't configured for it.
  useEffect(() => {
    const id = 'tailwind-cdn-script';
    if (!document.getElementById(id)) {
      const script = document.createElement('script');
      script.id = id;
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Required</h1>
          <p className="text-slate-500 mb-6">
            Ensure the environment variable <code className="bg-slate-100 px-1 rounded text-blue-600">VITE_FIREBASE_CONFIG</code> is set in Vercel.
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter italic text-slate-900">
            RICK<span className="text-blue-600">NG</span>
          </div>
          <button 
            onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            Request Reset <ArrowRight size={12} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <Sparkles size={12} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Practical Antifragility</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight mb-8">
            Lead when the <span className="text-blue-600 italic">bumpy ride</span> is no longer optional.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
            I help high-variance leaders build the mental architecture to stay steady when the roadmap fails.
          </p>
          <button 
            onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            Start Your 15-Minute Reset <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Philosophy */}
      <section className="py-24 px-6 bg-slate-900 text-white rounded-[2.5rem] md:rounded-[4rem] mx-4 my-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black mb-6 italic tracking-tight">The "Normalcy" Trap</h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-white font-semibold">calm</span> and the reality of <span className="text-blue-400 font-semibold">chaos</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Pop the Bubble</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                We stop wishing for "good days" and start simulating the "wrinkles" so they never catch you off guard.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-lg">
                <Anchor size={24} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lead with Weight</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Become the anchor for your team when the environment is high-variance and the stakes are real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-3xl font-medium leading-snug text-slate-800 italic mb-8">
            "Rick's coaching didn't take away the stress; it made the stress useful. I feel more capable in a crisis than I ever did in calm waters."
          </blockquote>
          <div className="font-bold text-slate-900">CTO, FinTech Series B</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Leadership Coaching Client</div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="reset" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3 tracking-tight text-blue-600 italic">The 15-Minute Reset</h2>
            <p className="text-slate-500 font-medium">A high-impact diagnostic call to stabilize your situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-blue-50 border border-blue-100 p-10 rounded-3xl text-center">
              <CheckCircle2 size={48} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">Message Sent.</h3>
              <p className="text-slate-500 text-sm">I'll reach out within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  required 
                  placeholder="Name" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:bg-white focus:border-blue-600 transition-all" 
                  onChange={e => setBookingData({...bookingData, name: e.target.value})} 
                />
                <input 
                  required 
                  type="email" 
                  placeholder="Work Email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:bg-white focus:border-blue-600 transition-all" 
                  onChange={e => setBookingData({...bookingData, email: e.target.value})} 
                />
              </div>
              <textarea 
                required 
                placeholder="Briefly describe the 'turbulence' you're facing..." 
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:bg-white focus:border-blue-600 transition-all resize-none" 
                onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} 
              />
              <button 
                disabled={bookingStatus === 'loading'} 
                className="w-full py-5 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {bookingStatus === 'loading' ? 'Sending...' : <>Request Reset Call <Zap size={14} /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer / Newsletter */}
      <footer className="py-16 px-6 bg-[#f8f9fa] text-center border-t border-slate-200">
        <div className="max-w-md mx-auto">
          <h4 className="font-bold text-slate-900 mb-2">Get the Weekly Reset</h4>
          <p className="text-sm text-slate-500 mb-6">One mental model for high-stakes leadership.</p>
          <form onSubmit={handleNewsletter} className="flex gap-2 mb-10">
            <input 
              type="email" 
              required 
              placeholder="Email" 
              className="flex-grow bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none"
              onChange={e => setNewsletterEmail(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm">Join</button>
          </form>
          <div className="text-slate-400 text-[9px] uppercase tracking-[0.3em] font-bold">
            Rick Ng Coaching // rickngcoaching.com
          </div>
        </div>
      </footer>
    </div>
  );
}