import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Anchor, Sparkles, Zap, ShieldCheck, MessageSquare, Mail, Menu, X } from 'lucide-react';

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      
      :root {
        --brand-blue: #2563eb;
        --brand-dark: #000000;
        --bg-white: #ffffff;
        --text-muted: #64748b;
      }

      body { 
        margin: 0; 
        font-family: 'Inter', sans-serif; 
        background-color: var(--bg-white); 
        color: var(--brand-dark);
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      h1, h2, h3 { 
        letter-spacing: -0.06em;
        font-weight: 900;
        line-height: 0.9;
        margin: 0;
      }

      .btn-main {
        background: var(--brand-dark);
        color: white;
        padding: 1.1rem 2.2rem;
        border-radius: 16px;
        font-weight: 700;
        font-size: 0.95rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-main:hover {
        transform: translateY(-2px);
        background: #1a1a1a;
        box-shadow: 0 10px 20px -10px rgba(0,0,0,0.3);
      }

      .card-dark {
        background: #000000;
        color: white;
        border-radius: 48px;
        padding: 4rem 3.5rem;
        position: relative;
        overflow: hidden;
      }

      .card-dark::after {
        content: "";
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0.05;
        pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }

      .dot-grid {
        background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
        background-size: 32px 32px;
      }

      .input-field {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.2rem 1.5rem;
        font-weight: 500;
        transition: all 0.2s;
        width: 100%;
      }

      .input-field:focus {
        background: white;
        border-color: var(--brand-blue);
        outline: none;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f1f5f9;
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #475569;
      }
    `;
    document.head.appendChild(style);

    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    return () => window.removeEventListener('scroll', handleScroll);
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
        email: newsletterEmail, timestamp: serverTimestamp(), userId: user.uid
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
        ...bookingData, timestamp: serverTimestamp(), userId: user.uid
      });
      setBookingStatus('success');
    } catch (err) { setBookingStatus('idle'); }
  };

  return (
    <div className="min-h-screen">
      {/* Dynamic Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-600 rounded-sm rotate-45" />
            </div>
            <span className="font-black text-2xl tracking-tighter">RICK NG</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="text-[11px] font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">Philosophy</button>
            <button className="text-[11px] font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">Framework</button>
            <button 
              onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
              className="bg-black text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Contact
            </button>
          </div>
          <button className="md:hidden"><Menu size={24} /></button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-56 pb-32 px-6 dot-grid">
        <div className="max-w-6xl mx-auto text-center">
          <div className="pill mb-8 animate-fade-in">
            <Sparkles size={14} className="text-blue-600" fill="currentColor" /> Practical Antifragility
          </div>
          <h1 className="text-[15vw] md:text-[8.5rem] leading-[0.85] mb-12">
            LEAD WHEN <br /> 
            <span className="text-blue-600 italic">CHAOS CALLS.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-500 font-medium tracking-tight mb-16 leading-relaxed">
            Mental architecture for high-variance leaders who need to stay steady when the roadmap fails.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })} className="btn-main text-lg py-5 px-10">
              Start Your Reset <ArrowRight />
            </button>
          </div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h2 className="text-6xl md:text-7xl">THE NORMALCY <br/><span className="text-slate-300 italic">TRAP.</span></h2>
            <p className="text-2xl text-slate-500 font-medium tracking-tight leading-snug">
              Burnout isn't caused by hard work. It's caused by the friction between your expectation of <span className="text-black font-black underline decoration-blue-600 decoration-8 underline-offset-4">calm</span> and the reality of chaos.
            </p>
            <div className="grid gap-8">
              <div className="flex gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="w-16 h-16 shrink-0 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="text-2xl mb-2">Pop the Bubble</h4>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">Stop wishing for "good days". We simulate the wrinkles before they disrupt your mission.</p>
                </div>
              </div>
              <div className="flex gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-200">
                <div className="w-16 h-16 shrink-0 bg-black rounded-3xl flex items-center justify-center text-white">
                  <Anchor size={32} />
                </div>
                <div>
                  <h4 className="text-2xl mb-2">Lead with Weight</h4>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">Become the anchor when stakes are real and environments are completely unpredictable.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-dark shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
            <MessageSquare className="text-blue-600 mb-10" size={64} fill="currentColor" />
            <h3 className="text-4xl italic mb-12 leading-tight">
              "Rick didn't take away the stress; he made it useful. I feel more capable in a crisis than I ever did in calm waters."
            </h3>
            <div className="flex items-center gap-6 pt-10 border-t border-white/10">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-700 to-blue-400" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Confidential Engagement</p>
                <p className="text-xl font-bold">CTO, Series B Fintech</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" className="py-32 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="pill bg-white/10 text-white mb-6">Immediate Response</div>
            <h2 className="text-6xl md:text-8xl mb-6">15-MINUTE <br/><span className="text-blue-600">RESET.</span></h2>
            <p className="text-slate-400 text-xl font-medium tracking-tight">A high-impact diagnostic call to stabilize your current situation.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-white/5 border border-white/10 p-16 rounded-[3rem] text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-3xl mb-4">Transmission Received.</h3>
              <p className="text-slate-400">Stand by. I'll reach out within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-500">Your Identity</label>
                  <input required className="input-field !bg-white/5 !border-white/10 !text-white !p-5 focus:!border-blue-600" placeholder="Name" onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-500">Secure Email</label>
                  <input required type="email" className="input-field !bg-white/5 !border-white/10 !text-white !p-5 focus:!border-blue-600" placeholder="your@email.com" onChange={e => setBookingData({...bookingData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-500">Situation Report</label>
                <textarea required className="input-field !bg-white/5 !border-white/10 !text-white !p-5 focus:!border-blue-600" rows={5} placeholder="What turbulence are you dealing with right now?" onChange={e => setBookingData({...bookingData, turbulence: e.target.value})} />
              </div>
              <button disabled={bookingStatus === 'loading'} className="w-full btn-main !bg-blue-600 !py-6 !text-xl justify-center !rounded-[1.5rem]">
                {bookingStatus === 'loading' ? 'Encrypting...' : <>SEND RESET REQUEST <Zap size={20} fill="currentColor" /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-end mb-24">
            <div>
              <h4 className="text-4xl mb-4 tracking-tighter">THE WEEKLY <br/><span className="text-blue-600 italic">RESET.</span></h4>
              <p className="text-slate-500 text-lg font-medium mb-8">One actionable mental model for high-variance leaders.</p>
              
              {newsletterStatus === 'success' ? (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold">Welcome aboard.</div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input required type="email" placeholder="email@address.com" className="input-field" onChange={e => setNewsletterEmail(e.target.value)} />
                  <button className="bg-black text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Join</button>
                </form>
              )}
            </div>
            <div className="text-right">
              <div className="font-black text-6xl tracking-tighter mb-4">RICK NG</div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Truth in Turbulence // Est. 2024</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between pt-12 border-t border-slate-50 text-[10px] font-bold text-slate-300 tracking-widest uppercase">
            <div>© {new Date().getFullYear()} Rick Ng Coaching</div>
            <div className="flex gap-8 mt-4 md:mt-0">
              <button className="hover:text-black">Privacy</button>
              <button className="hover:text-black">Terms</button>
              <button className="hover:text-black">LinkedIn</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}