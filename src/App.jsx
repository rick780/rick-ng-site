import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Zap, Anchor, ShieldAlert, MessageSquare, Sparkles, AlertTriangle } from 'lucide-react';

// --- FAIL-SAFE CONFIGURATION ---
const getSafeConfig = () => {
  try {
    let configStr = null;
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      configStr = __firebase_config;
    } else {
      // Use bracket notation for environment safety across different build targets
      configStr = import.meta.env['VITE_FIREBASE_CONFIG'];
    }
    return configStr ? JSON.parse(configStr) : null;
  } catch (e) {
    return null;
  }
};

const firebaseConfig = getSafeConfig();

const getAppId = () => {
  if (typeof __app_id !== 'undefined' && __app_id) return __app_id;
  try {
    const envId = import.meta.env['VITE_APP_ID'];
    return envId || 'rick-ng-coaching-v2';
  } catch (e) {
    return 'rick-ng-coaching-v2';
  }
};

const appId = getAppId();

// Initialization logic
let auth, db;
if (firebaseConfig) {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [bookingData, setBookingData] = useState({ name: '', email: '', turbulence: '' });
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  // Fallback for missing config (Prevents white screen on first deploy)
  if (!firebaseConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100">
          <div className="flex justify-center mb-4 text-red-500">
            <AlertTriangle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Missing</h1>
          <p className="text-slate-600 mb-6">Your site is live, but it doesn't know which database to talk to yet.</p>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10px] mb-6 overflow-hidden text-ellipsis whitespace-nowrap">
            Check Vercel Project Settings {'->'} Environment Variables
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Auth Effect (Rule 3)
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Authentication Error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Data Sync Effect (Rule 1)
  useEffect(() => {
    if (!user || !db || !appId) return;
    
    // Path: /artifacts/{appId}/public/data/{collectionName} (5 segments total - Odd number)
    const leadsRef = collection(db, 'artifacts', appId, 'public', 'data', 'newsletter_leads');
    const unsubLeads = onSnapshot(leadsRef, 
      (s) => setLeads(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      (e) => console.error("Leads Listener Error:", e)
    );
    
    const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
    const unsubBookings = onSnapshot(bookingsRef, 
      (s) => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      (e) => console.error("Bookings Listener Error:", e)
    );
    
    return () => { unsubLeads(); unsubBookings(); };
  }, [user]);

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
    } catch (err) { 
      setNewsletterStatus('idle'); 
    }
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
    } catch (err) { 
      setBookingStatus('idle'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100 scroll-smooth">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="text-lg font-black tracking-tight text-slate-900">
            RICK<span className="text-blue-600">NG</span><span className="text-[10px] ml-1 opacity-30 font-medium tracking-normal uppercase">Coaching</span>
          </div>
          <div className="hidden md:flex gap-8 items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#philosophy" className="hover:text-slate-900 transition underline-offset-4 hover:underline">Philosophy</a>
            <button 
              onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })} 
              className="text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
            >
              Request Reset <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </nav>

      <header className="px-6 pt-24 pb-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
            <Sparkles size={12} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Practical Antifragility</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8 leading-[1.05] text-slate-900">
            For when the <span className="text-blue-600 italic">bumpy ride</span> is no longer optional.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-10">
            You are paid to lead through chaos, yet you were never taught how to expect it. I help you build the mental architecture to stay steady when the roadmap fails.
          </p>
          <button 
            onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })} 
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg flex items-center gap-3"
          >
            Start your 15-Minute Reset <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <section id="philosophy" className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">The "Normalcy" Trap</h2>
          <div className="space-y-12 text-lg text-slate-600 leading-relaxed">
            <p>Burnout isn't caused by hard work. It's caused by the friction between your expectation of <strong>calm</strong> and the reality of <strong>chaos</strong>.</p>
            <div className="grid md:grid-cols-2 gap-8 py-4">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <ShieldAlert size={32} className="text-blue-600 mb-4" />
                <h4 className="font-bold text-slate-900 mb-2">Pop the Bubble</h4>
                <p className="text-sm">We stop wishing for "good days" and start simulating the "wrinkles" so they never catch you off guard.</p>
              </div>
              <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl">
                <Anchor size={32} className="text-blue-400 mb-4" />
                <h4 className="font-bold mb-2">Lead with Weight</h4>
                <p className="text-sm text-slate-400">Become the anchor for your team when the environment is high-variance and the stakes are real.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reset" className="py-24 px-6 bg-blue-600">
        <div className="max-w-xl mx-auto text-white text-center">
          {bookingStatus === 'success' ? (
            <div className="p-12 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20">
              <div className="flex justify-center mb-6">
                <CheckCircle2 size={64} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Signal Received.</h3>
              <p className="text-blue-100 italic">"I'll reach out to your work email shortly." — Rick</p>
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-extrabold mb-4">The 15-Minute Reset</h2>
              <form onSubmit={handleBooking} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Name" className="w-full bg-blue-700/50 border border-blue-400/30 rounded-2xl px-6 py-4 text-white placeholder:text-blue-300 focus:outline-none" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                  <input type="email" required placeholder="Work Email" className="w-full bg-blue-700/50 border border-blue-400/30 rounded-2xl px-6 py-4 text-white placeholder:text-blue-300 focus:outline-none" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
                </div>
                <textarea required rows={4} placeholder="What randomness are you dealing with?" className="w-full bg-blue-700/50 border border-blue-400/30 rounded-2xl px-6 py-4 text-white placeholder:text-blue-300 focus:outline-none resize-none" onChange={e => setBookingData({...bookingData, turbulence: e.target.value})}></textarea>
                <button disabled={bookingStatus === 'loading' || !user} className="w-full py-5 bg-white text-blue-700 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-xl disabled:opacity-50">
                  {bookingStatus === 'loading' ? 'Sending Signal...' : 'Request a Reset Call'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-2 text-slate-900">Get the Weekly Reset</h3>
          <p className="text-slate-500 mb-8">One mental model for the bumpy week ahead.</p>
          {newsletterStatus === 'success' ? (
            <p className="text-blue-600 font-bold p-4 bg-blue-50 rounded-xl inline-block">You're on the list!</p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                required 
                placeholder="Email address" 
                value={newsletterEmail} 
                onChange={e => setNewsletterEmail(e.target.value)} 
                className="flex-grow border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 bg-slate-50" 
              />
              <button type="submit" disabled={newsletterStatus === 'loading'} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">Join</button>
            </form>
          )}
        </div>
      </section>

      <div className="py-12 px-6 bg-[#fafafa] border-t border-slate-100 text-center">
        <button onClick={() => setShowAdmin(!showAdmin)} className="text-slate-300 hover:text-slate-900 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors">
          {showAdmin ? "[ Exit Logs ]" : "[ Owner Dashboard ]"}
        </button>
        {showAdmin && (
          <div className="mt-8 text-left max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-xs uppercase mb-4 flex items-center gap-2 text-slate-400">
                <Zap size={12} className="text-blue-600" /> Newsletter Leads ({leads.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {leads.length > 0 ? leads.map(l => (
                  <div key={l.id} className="text-[11px] p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono">{String(l.email)}</div>
                )) : <div className="text-[11px] text-slate-400 italic">No leads yet.</div>}
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-xs uppercase mb-4 flex items-center gap-2 text-slate-400">
                <MessageSquare size={12} className="text-blue-600" /> Reset Bookings ({bookings.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {bookings.length > 0 ? bookings.map(b => (
                  <div key={b.id} className="text-[11px] p-3 border-l-4 border-blue-500 bg-slate-50 rounded-r-lg">
                    <div className="font-bold text-slate-900">{String(b.name)} <span className="font-normal text-slate-400 ml-1">({String(b.email)})</span></div>
                    <div className="mt-1 text-slate-600 italic leading-relaxed">"{String(b.turbulence)}"</div>
                  </div>
                )) : <div className="text-[11px] text-slate-400 italic">No bookings yet.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="py-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        Rick Ng Coaching // rickngcoaching.com
      </footer>
    </div>
  );
}