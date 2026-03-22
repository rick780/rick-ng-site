import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

// --- CONFIGURATION LOADER ---
const getSafeConfig = () => {
  try {
    // Check for Vite-prefixed environment variable (Crucial for Vercel/Vite)
    const envConfig = import.meta.env.VITE_FIREBASE_CONFIG;
    if (envConfig) {
      return JSON.parse(envConfig);
    }
    // Fallback for internal preview environment
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
    return null;
  } catch (err) {
    console.error("Config parse error:", err);
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
        <div className="max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200">
          <AlertTriangle size={64} className="text-amber-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-900 mb-4">Configuration Required</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Please ensure your Vercel Environment Variable is named exactly:<br/>
            <code className="bg-slate-100 px-2 py-1 rounded font-bold text-blue-600">VITE_FIREBASE_CONFIG</code>
          </p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
            Check Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Hero Section */}
      <header className="pt-32 pb-24 px-6 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-10">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 italic">Rick Ng Coaching</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
            Lead when the <span className="text-blue-600 italic underline decoration-blue-100 underline-offset-8">bumpy ride</span> is no longer optional.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
            I help high-variance leaders build the mental architecture to stay steady when the roadmap fails.
          </p>
          <button 
            onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            Start Your 15-Minute Reset <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* Philosophy */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 italic">The "Normalcy" Trap</h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-slate-900 font-semibold">calm</span> and the reality of <span className="text-blue-600 font-semibold">chaos</span>.
            </p>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                  <ShieldAlert className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Pop the Bubble</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Stop wishing for "good days" and start simulating the "wrinkles" so they never catch you off guard.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
                  <Anchor className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Lead with Weight</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Become the anchor for your team when the environment is high-variance and the stakes are real.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-2xl group-hover:bg-blue-600/10 transition-all"></div>
            <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 rotate-1 group-hover:rotate-0 transition-transform">
              <div className="p-6 bg-slate-900 rounded-3xl text-white">
                <blockquote className="text-xl font-medium leading-relaxed italic mb-6">
                  "Rick's coaching didn't take away the stress; it made the stress useful. I feel more capable in a crisis than I ever did in calm waters."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600" />
                  <div className="text-sm font-bold">CTO, FinTech Series B</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="reset" className="py-32 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 tracking-tight uppercase italic">The 15-Minute Reset</h2>
            <p className="text-slate-500 font-medium">A high-impact diagnostic call to stabilize your current situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-blue-50 border border-blue-100 p-12 rounded-[2.5rem] text-center">
              <CheckCircle2 size={64} className="text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Encrypted.</h3>
              <p className="text-slate-500">Check your inbox. I'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Name" className="bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                <input required type="email" placeholder="Work Email" className="bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
              </div>
              <textarea required rows={4} placeholder="Briefly describe the 'turbulence' you're facing..." className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all resize-none" onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} />
              <button disabled={bookingStatus === 'loading'} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                {bookingStatus === 'loading' ? 'Transmitting...' : 'Request Reset Call'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6 bg-blue-600 text-white overflow-hidden relative">
        <div className="max-w-xl mx-auto text-center relative z-10">
          <h3 className="text-3xl font-bold mb-2 italic">The Weekly Reset</h3>
          <p className="text-blue-100 mb-10 text-lg">One mental model for the bumpy week ahead.</p>
          {newsletterStatus === 'success' ? (
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl font-bold text-xl">You're in.</div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20">
              <input 
                type="email" 
                required 
                placeholder="Email address" 
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="flex-grow bg-transparent px-6 py-4 outline-none placeholder:text-blue-200 text-lg"
              />
              <button type="submit" disabled={newsletterStatus === 'loading'} className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black hover:bg-slate-100 transition-colors uppercase tracking-widest text-sm">Join</button>
            </form>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      </section>

      <footer className="py-16 text-center border-t border-slate-100">
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
          Rick Ng Coaching // rickngcoaching.com
        </div>
        <div className="text-slate-300 text-[9px] uppercase tracking-widest">
          Practical Antifragility for High-Variance Leadership
        </div>
      </footer>
    </div>
  );
}