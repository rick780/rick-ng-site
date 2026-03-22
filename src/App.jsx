import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, ShieldAlert, Sparkles, Zap, ShieldCheck, MessageSquare } from 'lucide-react';

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
    // Injecting a robust CSS reset and base styles to prevent the "broken" look seen in screenshots
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
      
      :root {
        --brand-blue: #2563eb;
        --brand-dark: #0f172a;
      }

      body { 
        margin: 0; 
        font-family: 'Inter', -apple-system, sans-serif; 
        background-color: #ffffff; 
        color: #0f172a;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
      }

      .hero-gradient {
        background: radial-gradient(circle at top right, #f8fafc 0%, #ffffff 100%);
      }

      .dot-grid {
        background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
        background-size: 24px 24px;
      }

      h1, h2, h3 { 
        line-height: 1.1 !important; 
        letter-spacing: -0.02em;
      }

      input, textarea {
        transition: all 0.2s ease;
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(226, 232, 240, 0.8);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-entry {
        animation: fadeIn 0.6s ease-out forwards;
      }
    `;
    document.head.appendChild(style);

    // Ensure Tailwind is loaded
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
    <div className="min-h-screen selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-black text-xl tracking-tighter flex items-center gap-1">
            RICK<span className="text-blue-600">NG</span>
          </div>
          <button 
            onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
            className="text-[11px] font-bold uppercase tracking-widest bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all transform hover:-translate-y-0.5"
          >
            Request Reset
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden hero-gradient dot-grid">
        <div className="max-w-5xl mx-auto text-center relative z-10 animate-entry">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
            <Sparkles size={12} /> Practical Antifragility
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 leading-[0.95] tracking-tight">
            Lead when the <br />
            <span className="italic text-blue-600 underline decoration-blue-100 underline-offset-8">bumpy ride</span> is here.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Mental architecture for high-variance leaders who need to stay steady when the roadmap fails.
          </p>
          
          <button 
            onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto text-sm uppercase tracking-widest"
          >
            Start 15-Minute Reset <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* The Core Shift */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight uppercase">The "Normalcy" Trap</h2>
              <p className="text-xl text-slate-500 leading-relaxed font-medium mb-8">
                Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-slate-900 font-bold underline decoration-blue-500 decoration-2">calm</span> and the reality of <span className="text-slate-900 font-bold italic underline decoration-blue-500 decoration-2">chaos</span>.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><ShieldCheck size={24} /></div>
                  <div>
                    <h4 className="font-bold text-lg">Pop the Bubble</h4>
                    <p className="text-sm text-slate-500">Stop wishing for "good days". Simulate the wrinkles before they happen.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="bg-slate-100 p-3 rounded-xl text-slate-900"><Anchor size={24} /></div>
                  <div>
                    <h4 className="font-bold text-lg">Lead with Weight</h4>
                    <p className="text-sm text-slate-500">Become the anchor when stakes are real and environments are high-variance.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#2563eb33,transparent)]"></div>
                <MessageSquare className="text-blue-500 mb-8" size={48} />
                <p className="text-2xl md:text-3xl font-bold italic leading-tight mb-8 relative z-10">
                  "Rick didn't take away the stress; he made it useful. I feel more capable in a crisis than I ever did in calm waters."
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-blue-600"></div>
                  <div>
                    <div className="font-black uppercase tracking-widest text-[10px]">CTO, Series B Fintech</div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-widest">Leadership Coaching Client</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="booking" className="py-32 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">15-Minute Reset</h2>
            <p className="text-slate-500 font-medium">A high-impact diagnostic call to stabilize your current leadership situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-white border-2 border-blue-500 p-12 rounded-[2.5rem] text-center animate-entry">
              <CheckCircle2 size={64} className="text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-2 uppercase">Confirmed.</h3>
              <p className="text-slate-500 font-medium italic">I'll reach out via email within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Name" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:border-blue-600 font-medium text-sm" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                <input required type="email" placeholder="Work Email" className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:border-blue-600 font-medium text-sm" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
              </div>
              <textarea required placeholder="What turbulence are you dealing with?" rows={4} className="w-full bg-white border border-slate-200 rounded-xl px-6 py-4 outline-none focus:border-blue-600 font-medium text-sm resize-none" onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} />
              <button disabled={bookingStatus === 'loading'} className="w-full py-5 bg-slate-900 text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]">
                {bookingStatus === 'loading' ? 'Sending...' : <>Secure Call Slot <Zap size={14} /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <h4 className="font-black text-xl mb-2 uppercase italic">The Weekly Reset</h4>
          <p className="text-slate-500 text-sm mb-8 font-medium">One mental model for the bumpy week ahead.</p>
          
          {newsletterStatus === 'success' ? (
            <div className="p-4 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs uppercase tracking-widest italic animate-entry">
              Added to the roster.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2 mb-16">
              <input type="email" required placeholder="Your email" className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 outline-none text-sm font-medium focus:border-blue-600 transition-all" onChange={e => setNewsletterEmail(e.target.value)} />
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all">Join</button>
            </form>
          )}

          <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
             <div className="font-black text-lg tracking-tighter italic">RICKNG</div>
             <div className="text-[9px] font-black uppercase tracking-[0.4em]">EST. 2024 // TRUTH IN TURBULENCE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}