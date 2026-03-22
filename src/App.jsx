import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { ArrowRight, CheckCircle2, Zap, Menu, Twitter, Linkedin, Mail, ExternalLink, BookOpen, User, Send } from 'lucide-react';

// --- ASSETS ---
// Assuming the build environment handles the path mapping for the local assets folder
const BIO_PHOTO = "src/assets/bio_photo.png";

// --- FIREBASE CONFIGURATION ---
const getSafeConfig = () => {
  try {
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

// Inline Styles to prevent FOUC (Flash of Unstyled Content)
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    :root {
      --primary: #2563eb;
      --black: #09090b;
    }

    html { 
      scroll-behavior: smooth; 
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    body { 
      color: var(--black);
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
      margin: 0;
    }

    .text-display { 
      letter-spacing: -0.05em; 
      line-height: 0.9; 
    }

    .bento-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 32px;
      padding: 3rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
      border-color: var(--primary);
      outline: none;
    }

    .article-card {
      border-bottom: 1px solid #e2e8f0;
      padding: 2.5rem 0;
      transition: all 0.3s ease;
    }

    .profile-image-container {
      position: relative;
      border-radius: 40px;
      overflow: hidden;
      background: #f1f5f9;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    }

    .nav-glass {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
    }
    
    /* Ensure the image looks great even if slow loading */
    .profile-image-container img {
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    }
    .profile-image-container img.loaded {
      opacity: 1;
    }
  `}</style>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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

  return (
    <div className="min-h-screen selection:bg-blue-100">
      <GlobalStyles />
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-glass py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Rick Ng</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Bio', 'Writing', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold text-slate-500 hover:text-black transition-colors tracking-widest uppercase">{item}</a>
            ))}
            <button onClick={() => document.getElementById('contact').scrollIntoView()} className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">
              Book Call
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-blue-100">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
              Strategic Advisory 2024
            </div>
            <h1 className="text-display text-7xl md:text-[110px] font-black mb-10">
              Scalable <br /><span className="text-blue-600">Leadership.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed mb-10">
              I help high-growth founders navigate the "Complexity Gap"—where leadership capability must outpace business growth.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => document.getElementById('contact').scrollIntoView()} className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all flex items-center gap-3 group">
                Work with Rick <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bio / Profile Section */}
      <section id="bio" className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="profile-image-container aspect-[4/5]">
                <img 
                  src={BIO_PHOTO} 
                  alt="Rick Ng" 
                  className={`w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0 ${imgLoaded ? 'loaded' : ''}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"; // Fallback if local path fails
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
                <div className="text-4xl font-black text-blue-600">15+</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Years Ops Experience</div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">About Rick</p>
                <h2 className="text-5xl font-black tracking-tighter leading-tight">The strategist behind the scale.</h2>
              </div>
              
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
                <p>
                  As an executive coach and strategic advisor, I specialize in the psychological and operational shifts required to lead at the highest levels.
                </p>
                <p>
                  I've worked with founders from Seed to Series D, focusing on cognitive load management, high-leverage decision making, and building resilient organizational cultures.
                </p>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4">
                {['Cognitive Architecture', 'Scaling Systems', 'Founder Psychology', 'Crisis Management'].map(tag => (
                  <div key={tag} className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section id="writing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-5xl font-black tracking-tighter">Writing.</h2>
            <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">View All Insights</button>
          </div>

          <div className="space-y-0">
            {[
              { title: "The Art of Doing Nothing as a CEO", tag: "Strategy" },
              { title: "Managing Fear during Downturns", tag: "Leadership" },
              { title: "Why Your Best People Leave", tag: "Systems" }
            ].map((post, i) => (
              <div key={i} className="article-card group cursor-pointer flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">{post.tag}</p>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:translate-x-2 transition-transform">{post.title}</h3>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 bg-black text-white rounded-t-[60px]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">Ready to <br />level up?</h2>
            <p className="text-slate-400 text-lg">Inquiries for 1:1 advisory and coaching.</p>
          </div>

          {bookingStatus === 'success' ? (
            <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] text-center">
              <CheckCircle2 size={48} className="text-blue-500 mx-auto mb-6" />
              <h3 className="text-2xl font-black mb-2">Inquiry Received.</h3>
              <p className="text-slate-400">I'll review your application and respond shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input required className="input-standard bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:bg-white/10" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" className="input-standard bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:bg-white/10" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <textarea required rows={4} className="input-standard bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:bg-white/10" placeholder="Tell me about your current challenge..." onChange={e => setFormData({...formData, message: e.target.value})} />
              <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all">
                Submit Application
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-slate-500 py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-white fill-white" />
            <span className="font-black text-white uppercase tracking-tighter">Rick Ng Advisory</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">© 2024 — All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}