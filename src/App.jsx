import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Shield, Anchor, Zap, Menu, Twitter, Linkedin, Mail, ExternalLink, BookOpen, User, Send } from 'lucide-react';

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
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
      
      html { scroll-behavior: smooth; }
      body { 
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #09090b;
        background: #ffffff;
        -webkit-font-smoothing: antialiased;
      }

      .text-display { letter-spacing: -0.05em; line-height: 0.95; }
      .bento-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 32px;
        padding: 3rem;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .bento-card:hover {
        border-color: #2563eb;
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.05);
      }

      .input-standard {
        width: 100%;
        background: #f8fafc;
        border: 2px solid transparent;
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        transition: all 0.3s ease;
      }
      .input-standard:focus {
        background: white;
        border-color: #2563eb;
        outline: none;
      }

      .article-card {
        border-bottom: 1px solid #e2e8f0;
        padding: 2.5rem 0;
        transition: all 0.3s ease;
      }
      .article-card:hover { border-bottom-color: #09090b; }
      
      .profile-image-container {
        position: relative;
        border-radius: 40px;
        overflow: hidden;
        background: #f1f5f9;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
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
        ...formData, timestamp: serverTimestamp(), userId: user.uid
      });
      setBookingStatus('success');
    } catch (err) { setBookingStatus('idle'); }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!user || !db) return;
    setNewsletterStatus('loading');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'newsletter'), {
        email: newsletterEmail, timestamp: serverTimestamp(), userId: user.uid
      });
      setNewsletterStatus('success');
    } catch (err) { setNewsletterStatus('idle'); }
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl py-4 border-b border-slate-100' : 'bg-transparent py-10'}`}>
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">Rick Ng</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Bio', 'Writing', 'Foundations', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black text-slate-400 hover:text-black transition-colors tracking-[0.2em] uppercase">{item}</a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-64 pb-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-12 border border-blue-100/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Now Coaching Q3 Leaders
          </div>
          <h1 className="text-display text-6xl md:text-[120px] font-[900] mb-12">
            The Executive <br /><span className="text-blue-600">Architect.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed mb-12">
            Strategic advisory for founders and CEOs who have outscaled their current systems. We rebuild the mental and structural foundations of your leadership.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })} className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all flex items-center gap-4 group">
              Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => document.getElementById('bio').scrollIntoView({ behavior: 'smooth' })} className="bg-white border-2 border-slate-100 px-10 py-5 rounded-2xl font-black text-lg hover:border-black transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section id="bio" className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative group">
              <div className="profile-image-container">
                <img 
                  src="image_9701c6.jpg" 
                  alt="Rick Ng" 
                  className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                />
              </div>
              <div className="absolute -bottom-10 -right-6 lg:-right-10 bg-white p-8 lg:p-10 rounded-[32px] lg:rounded-[40px] shadow-2xl hidden md:block">
                <p className="text-4xl lg:text-5xl font-black tracking-tighter text-blue-600">15+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Years Strategic Experience</p>
              </div>
            </div>
            <div>
              <p className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-6">The Perspective</p>
              <h2 className="text-5xl font-black tracking-tighter mb-8 leading-tight">Rick Ng. <br />Quiet intensity <br />meets tactical scale.</h2>
              <div className="space-y-6 text-lg text-slate-500 font-medium leading-relaxed">
                <p>
                  I've spent the last decade in the trenches of high-growth scaling, observing one consistent truth: as companies grow linearly, leadership complexity grows exponentially.
                </p>
                <p>
                  My approach isn't just about accountability; it’s about **cognitive architecture**. I help leaders map out their mental models, identify blind spots, and install the systems needed to lead 500 people with the same clarity they had leading 5.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  {['Advisory', 'High-Stakes Coaching', 'Scale Systems'].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Writing/Articles Section */}
      <section id="writing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <p className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4">The Library</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Insights on <br />Modern Scale.</h2>
            </div>
            <p className="text-slate-400 font-medium max-w-sm">Philosophical rigor applied to the challenges of modern executive leadership.</p>
          </div>

          <div className="space-y-0">
            {[
              { title: "The Sovereign CEO: Reclaiming Your Calendar", category: "Strategy", date: "Oct 2023", read: "6 min" },
              { title: "Cognitive Load and the Series B Trap", category: "Psychology", date: "Aug 2023", read: "12 min" },
              { title: "Designing High-Trust Systems for Remote Orgs", category: "Systems", date: "May 2023", read: "8 min" }
            ].map((article, i) => (
              <div key={i} className="article-card group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <span className="text-slate-300 font-black text-2xl">0{i+1}</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">{article.category}</p>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-blue-600 transition-colors">{article.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-12 text-slate-400 font-bold text-sm uppercase tracking-widest">
                  <span>{article.date}</span>
                  <span className="flex items-center gap-2"><BookOpen size={14}/> {article.read}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter (The Dispatch) */}
      <section className="py-32 px-4 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center bg-black rounded-[40px] py-20 px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full"></div>
          <div className="relative z-10">
            <p className="text-blue-400 font-black text-xs uppercase tracking-[0.4em] mb-6">The Dispatch</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-tight">Weekly insights on <br />leadership and scale.</h2>
            
            {newsletterStatus === 'success' ? (
              <div className="animate-in fade-in duration-500">
                <p className="text-blue-400 font-black text-xl">Welcome to the dispatch. Check your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input 
                  required 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  onChange={e => setNewsletterEmail(e.target.value)}
                />
                <button className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                  Join <Send size={16} />
                </button>
              </form>
            )}
            <p className="text-slate-500 mt-8 text-xs font-bold uppercase tracking-widest">No spam. Just rigorous thought. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">START THE <br />CONVERSATION.</h2>
             <p className="text-slate-500 font-medium text-lg">Inquiries for Q3 Advisory are currently open.</p>
          </div>
          
          {bookingStatus === 'success' ? (
            <div className="bg-blue-50 p-12 rounded-[40px] text-center border border-blue-100 animate-in zoom-in duration-500">
              <CheckCircle2 size={48} className="text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-2">Message Sent.</h3>
              <p className="text-slate-600 font-medium text-lg">I'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-10 rounded-[40px] border border-slate-100">
              <div className="grid md:grid-cols-2 gap-6">
                <input required className="input-standard" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" className="input-standard" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <textarea required rows={5} className="input-standard" placeholder="Context (Company, Size, Challenge)" onChange={e => setFormData({...formData, message: e.target.value})} />
              <button className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all shadow-xl shadow-black/10">
                Request Strategy Session
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Zap size={18} className="text-white fill-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">Rick Ng</span>
              </div>
              <p className="text-slate-400 max-w-xs font-medium">Strategic advisory for the world's most ambitious leaders.</p>
            </div>
            <div className="grid grid-cols-2 gap-20">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Social</p>
                <div className="flex gap-6 text-slate-400">
                  <Linkedin size={20} className="hover:text-black cursor-pointer transition-colors" />
                  <Twitter size={20} className="hover:text-black cursor-pointer transition-colors" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Legal</p>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:text-black transition-colors">Privacy Policy</p>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">© {new Date().getFullYear()} Rick Ng. Built for the Infinite Game.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}