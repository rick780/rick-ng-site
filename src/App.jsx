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

  // Inject Tailwind CDN to ensure styles work even if the Vercel build is missing tailwind config
  useEffect(() => {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200">
          <AlertTriangle size={64} className="text-amber-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Configuration Missing</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your Vercel environment variable <code className="bg-slate-100 px-2 py-1 rounded font-bold text-blue-600">VITE_FIREBASE_CONFIG</code> was not detected.
          </p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter italic text-slate-900">
            RICK<span className="text-blue-600">NG</span>
          </div>
          <button 
            onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-bold uppercase tracking-widest bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            Request Reset <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-10">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Practical Antifragility</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-10">
            Lead when the <br/>
            <span className="text-blue-600 italic underline decoration-blue-100 underline-offset-8">bumpy ride</span> <br/>
            is no longer optional.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
            I help high-variance leaders build the mental architecture to stay steady when the roadmap fails.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-6 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Start Your 15-Minute Reset <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Philosophy */}
      <section className="py-32 px-6 bg-slate-900 text-white rounded-[3rem] sm:rounded-[5rem] mx-4 my-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tight">The "Normalcy" Trap</h2>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
              Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-white font-semibold">calm</span> and the reality of <span className="text-blue-400 font-semibold">chaos</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pop the Bubble</h3>
              <p className="text-slate-400 leading-relaxed">
                We stop wishing for "good days" and start simulating the "wrinkles" so they never catch you off guard.
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-lg">
                <Anchor size={28} className="text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Lead with Weight</h3>
              <p className="text-slate-400 leading-relaxed">
                Become the anchor for your team when the environment is high-variance and the stakes are real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute top-0 left-0 text-[15rem] leading-none font-black text-slate-100 -z-10 select-none">“</div>
          <blockquote className="text-2xl md:text-4xl font-medium leading-tight text-slate-800 italic mb-10 pt-10">
            "Rick's coaching didn't take away the stress; it made the stress useful. I feel more capable in a crisis than I ever did in calm waters."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700" />
            <div>
              <div className="font-bold text-slate-900">CTO, FinTech Series B</div>
              <div className="text-sm text-slate-500 font-medium">Leadership Coaching Client</div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="reset" className="py-32 px-6 bg-white border-y border-slate-100">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic text-blue-600">The 15-Minute Reset</h2>
            <p className="text-slate-500 font-medium text-lg">A high-impact diagnostic call to stabilize your current situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-blue-50 border border-blue-100 p-12 rounded-[2.5rem] text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 italic">MESSAGE ENCRYPTED.</h3>
              <p className="text-slate-500 font-medium">Check your inbox. I'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  required 
                  placeholder="Name" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all" 
                  onChange={e => setBookingData({...bookingData, name: e.target.value})} 
                />
                <input 
                  required 
                  type="email" 
                  placeholder="Work Email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all" 
                  onChange={e => setBookingData({...bookingData, email: e.target.value})} 
                />
              </div>
              <textarea 
                required 
                rows={4} 
                placeholder="What turbulence are you dealing with?" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all resize-none" 
                onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} 
              />
              <button 
                disabled={bookingStatus === 'loading'} 
                className="group w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {bookingStatus === 'loading' ? 'Transmitting...' : (
                  <>Request Reset Call <Zap size={18} className="group-hover:fill-current" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 px-6 bg-blue-600 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-4xl font-black mb-2 italic tracking-tight">The Weekly Reset</h3>
          <p className="text-blue-100 mb-10 text-xl font-medium">One mental model for the bumpy week ahead.</p>
          {newsletterStatus === 'success' ? (
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-[2.5rem] font-black text-2xl italic tracking-tight">
              YOU'RE ON THE LIST.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col gap-4 p-2 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20">
              <input 
                type="email" 
                required 
                placeholder="Email address" 
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="flex-grow bg-transparent px-8 py-6 outline-none placeholder:text-blue-200 text-lg font-bold"
              />
              <button 
                type="submit" 
                disabled={newsletterStatus === 'loading'} 
                className="bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black hover:bg-slate-100 transition-colors uppercase tracking-widest text-sm"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-20 text-center bg-white">
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
          Rick Ng Coaching // rickngcoaching.com
        </div>
        <div className="text-slate-300 text-[9px] uppercase tracking-widest font-bold">
          Practical Antifragility for High-Variance Leadership
        </div>
      </footer>
    </div>
  );
}