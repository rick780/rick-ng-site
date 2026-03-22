import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, ShieldAlert, Sparkles, AlertTriangle, Menu, X } from 'lucide-react';

// --- ROBUST CONFIGURATION LOADER ---
const getSafeConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
    // Vercel Environment Variable Fallback
    const processEnvConfig = typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_CONFIG : null;
    if (processEnvConfig) {
      return JSON.parse(processEnvConfig);
    }
    return null;
  } catch (err) {
    return null;
  }
};

const firebaseConfig = getSafeConfig();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rick-ng-coaching';

// Initialization
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
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

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

  useEffect(() => {
    if (!user || !db) return;
    const leadsRef = collection(db, 'artifacts', appId, 'public', 'data', 'newsletter_leads');
    const unsubLeads = onSnapshot(leadsRef, (s) => setLeads(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    
    const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
    const unsubBookings = onSnapshot(bookingsRef, (s) => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    
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
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Configuration Required</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">Your site is live, but it needs your Firebase credentials to handle leads and bookings.</p>
          <div className="bg-slate-900 text-blue-400 p-4 rounded-xl text-left text-xs font-mono mb-8 overflow-x-auto">
            VITE_FIREBASE_CONFIG=...
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter uppercase italic">
            RICK<span className="text-blue-600">NG</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <a href="#philosophy" className="hover:text-blue-600 transition-colors">Philosophy</a>
            <a href="#reset" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-blue-600 transition-all flex items-center gap-2">
              The Reset <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-40 pb-24 px-6 bg-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-10">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Practical Antifragility</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
            Lead when the <span className="text-blue-600 italic underline decoration-blue-100 underline-offset-8">bumpy ride</span> is no longer optional.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-2xl mb-12">
            I help high-variance leaders build the mental architecture to stay steady when the roadmap fails.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById('reset')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Start Your 15-Minute Reset <ArrowRight size={18} />
            </button>
          </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
      </header>

      {/* Philosophy */}
      <section id="philosophy" className="py-32 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">The "Normalcy" Trap</h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-slate-900 font-semibold">calm</span> and the reality of <span className="text-blue-600 font-semibold">chaos</span>.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <ShieldAlert className="text-blue-600" />, title: "Pop the Bubble", text: "We stop wishing for 'good days' and start simulating the 'wrinkles' so they never catch you off guard." },
                  { icon: <Anchor className="text-blue-600" />, title: "Lead with Weight", text: "Become the anchor for your team when the environment is high-variance and the stakes are real." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 rotate-1">
              <div className="p-6 bg-blue-600 rounded-3xl text-white mb-6">
                <blockquote className="text-xl font-medium leading-relaxed italic">
                  "Rick's coaching didn't take away the stress; it made the stress useful. I feel more capable in a crisis than I ever did in calm waters."
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-400" />
                  <div>
                    <div className="font-bold text-sm">CTO, FinTech Series B</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="reset" className="py-32 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">The 15-Minute Reset</h2>
            <p className="text-slate-500">A high-impact diagnostic call to stabilize your current situation.</p>
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
                <input required placeholder="Name" className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 transition-colors" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                <input required type="email" placeholder="Work Email" className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 transition-colors" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
              </div>
              <textarea required rows={4} placeholder="What randomness are you dealing with?" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 transition-colors resize-none" onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} />
              <button disabled={bookingStatus === 'loading'} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                {bookingStatus === 'loading' ? 'Transmitting...' : 'Request Reset Call'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">Get the Weekly Reset</h3>
          <p className="text-blue-100 mb-8 italic text-sm">One mental model for the bumpy week ahead.</p>
          {newsletterStatus === 'success' ? (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl font-bold">Successfully Subscribed.</div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <input 
                type="email" 
                required 
                placeholder="Email address" 
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="flex-grow bg-transparent px-4 py-3 outline-none placeholder:text-blue-200"
              />
              <button type="submit" disabled={newsletterStatus === 'loading'} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors">Join</button>
            </form>
          )}
        </div>
      </section>

      {/* Admin Dashboard Preview (Hidden by default) */}
      <div className="py-12 px-6 border-t border-slate-100 flex flex-col items-center gap-8">
        <button 
          onClick={() => setShowAdmin(!showAdmin)}
          className="text-[10px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-[0.3em] transition-colors"
        >
          [ Access Dashboard ]
        </button>
        
        {showAdmin && (
          <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center justify-between">
                Newsletter Leads <span>{leads.length}</span>
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {leads.map(l => <div key={l.id} className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">{l.email}</div>)}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center justify-between">
                Reset Calls <span>{bookings.length}</span>
              </h4>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold">{b.name}</span>
                      <span className="text-[10px] text-slate-400">{b.email}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">{b.turbulence}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="py-20 text-center">
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
          Rick Ng Coaching // rickngcoaching.com
        </div>
        <div className="text-slate-300 text-[9px] uppercase tracking-widest">
          Resilience is built, not found.
        </div>
      </footer>
    </div>
  );
}