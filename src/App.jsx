import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Shield, Anchor, Zap, Menu, Twitter, Linkedin, Mail } from 'lucide-react';

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
  const [scrolled, setScrolled] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Inject custom CSS for precise control
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      
      :root {
        --primary: #2563eb;
        --dark: #09090b;
        --light-bg: #f8fafc;
      }

      body { 
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--dark);
        background: #fff;
        line-height: 1.5;
      }

      .text-display {
        letter-spacing: -0.04em;
        line-height: 1.05;
      }

      .btn-primary {
        background: var(--dark);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 700;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-primary:hover {
        background: #27272a;
        transform: translateY(-1px);
      }

      .bento-card {
        background: white;
        border: 1px solid #e4e4e7;
        border-radius: 24px;
        padding: 2.5rem;
        transition: border-color 0.3s ease;
      }

      .bento-card:hover {
        border-color: var(--primary);
      }

      .input-standard {
        width: 100%;
        background: #f4f4f5;
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        transition: all 0.2s;
      }

      .input-standard:focus {
        background: white;
        border-color: var(--primary);
        outline: none;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), {
        ...formData,
        timestamp: serverTimestamp(),
        userId: user.uid
      });
      setBookingStatus('success');
    } catch (err) { setBookingStatus('idle'); }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4 border-b border-slate-100' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase">Rick Ng</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Philosophy', 'Process', 'Coaching'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-black transition-colors">{item}</a>
            ))}
            <button 
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all"
            >
              Get Started
            </button>
          </div>
          <button className="md:hidden"><Menu size={24} /></button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Available for Q3 Coaching
          </div>
          <h1 className="text-display text-5xl md:text-8xl font-extrabold mb-8">
            Turning <span className="text-blue-600">Complexity</span> into <br /> Competitive Edge.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
            Strategic coaching for high-stakes leaders who need to maintain peak performance while navigating organizational chaos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })} className="btn-primary">
              Book a Strategy Session <ArrowRight size={20} />
            </button>
            <p className="text-sm font-bold text-slate-400">Trusted by founders at Series B+</p>
          </div>
        </div>
      </section>

      {/* Features / Philosophy */}
      <section id="philosophy" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Framework for <br/> <span className="text-slate-400 italic font-medium">Clear Action.</span></h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bento-card">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Bubble</h3>
              <p className="text-slate-500 font-medium">Identifying the insulating factors that prevent you from seeing internal organizational truth.</p>
            </div>

            <div className="bento-card">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                <Anchor size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Weight</h3>
              <p className="text-slate-500 font-medium">Developing the psychological ballast to withstand external market pressures without buckling.</p>
            </div>

            <div className="bento-card">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Pulse</h3>
              <p className="text-slate-500 font-medium">Maintaining a steady operational rhythm when everything around you is accelerating.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative">
            <div className="absolute -top-10 -left-10 text-[200px] font-black text-slate-50 leading-none select-none">“</div>
            <div className="relative z-10">
              <p className="text-3xl md:text-5xl font-bold tracking-tight mb-12 max-w-4xl leading-tight">
                "Rick provides the rare perspective that isn't just theory. He understands the lonely, high-pressure environment of the CEO and provides the tools to survive it."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200" />
                <div>
                  <p className="font-bold text-lg">Managing Director</p>
                  <p className="text-slate-500 font-medium text-sm">Fintech Growth Equity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">LET'S START <br /> <span className="text-blue-600">THE RESET.</span></h2>
          <p className="text-lg text-slate-500 font-medium mb-12">Limited availability for private coaching. Inquire below for a brief introductory call.</p>

          {bookingStatus === 'success' ? (
            <div className="p-12 bg-white rounded-3xl border border-blue-100 text-center shadow-xl shadow-blue-50">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Message Sent</h3>
              <p className="text-slate-500 font-medium">I'll get back to you personally within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input required className="input-standard" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" className="input-standard" placeholder="Work Email" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <textarea required rows={4} className="input-standard" placeholder="Briefly describe your current challenge..." onChange={e => setFormData({...formData, message: e.target.value})} />
              <button disabled={bookingStatus === 'loading'} className="w-full btn-primary py-4 justify-center text-lg">
                {bookingStatus === 'loading' ? 'Sending...' : 'Request Introduction'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <Zap size={14} className="text-white fill-white" />
                </div>
                <span className="font-bold text-lg tracking-tighter uppercase">Rick Ng</span>
              </div>
              <p className="text-slate-400 font-medium text-sm">Strategic Coaching for High-Stakes Leadership.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between text-xs font-bold text-slate-300 uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Rick Ng Coaching. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}