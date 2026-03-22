import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  ArrowRight, 
  Wind, 
  Circle, 
  Shield, 
  Eye, 
  Mail, 
  Menu, 
  X,
  Scroll,
  Zap,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rick-ng-coaching-v2';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [bookingData, setBookingData] = useState({ name: '', email: '', turbulence: '' });
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth failed", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const leadsRef = collection(db, 'artifacts', appId, 'public', 'data', 'newsletter_leads');
    const unsubLeads = onSnapshot(leadsRef, (s) => setLeads(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'bookings');
    const unsubBookings = onSnapshot(bookingsRef, (s) => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => console.error(e));
    return () => { unsubLeads(); unsubBookings(); };
  }, [user]);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!user) return;
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
    if (!user) return;
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

  const navLinks = [
    { name: 'The Philosophy', href: '#philosophy' },
    { name: 'The Practice', href: '#practice' },
    { name: 'Writing', href: '#writing' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-50 font-sans leading-relaxed scroll-smooth">
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-full group-hover:border-blue-500 transition-colors">
              <Circle size={10} className="text-blue-500 fill-current" />
            </div>
            <span className="font-black text-sm tracking-[0.2em] uppercase">Rick Ng</span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors">
                {link.name}
              </a>
            ))}
            <button 
              onClick={() => document.getElementById('reset').scrollIntoView({ behavior: 'smooth' })}
              className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all"
            >
              Inquire
            </button>
          </div>

          <button className="md:hidden text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 transform origin-top translate-x-24 -z-10"></div>
        
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Practical Antifragility</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-10 text-slate-900">
              Authority <br />
              Belongs to <br />
              the <span className="text-blue-600">Calm</span>.
            </h1>
            <p className="text-xl text-slate-500 max-w-lg mb-12 font-light leading-relaxed">
              Based on the <span className="text-slate-900 font-medium italic underline decoration-blue-200">Need for Calmness</span>, I partner with engineering leaders to build internal stillness that drives external results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => document.getElementById('reset').scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                Request a Reset
                <ArrowRight size={16} />
              </button>
              <button className="px-10 py-5 border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                The Philosophy
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1470252649358-96f3c8053248?q=80&w=1000&auto=format&fit=crop" 
                alt="Rick Ng" 
                className="w-full aspect-[3/4] object-cover grayscale brightness-110 hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-50 rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* The Core Thesis */}
      <section id="philosophy" className="py-40 border-y border-slate-100 bg-[#fcfcfc]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Wind className="mx-auto text-blue-200 mb-10" size={40} />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 leading-[1.1]">
            "Calmness is not the absence of storm, but the mastery of the center."
          </h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto mb-12"></div>
          <p className="text-xl text-slate-500 font-light leading-loose max-w-2xl mx-auto">
            Burnout isn't caused by the work. It's caused by the gap between your expectation of a smooth path and the reality of the jagged mountain you're actually climbing.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section id="practice" className="py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.5em] mb-4">The Methodology</h2>
              <h3 className="text-5xl font-black tracking-tight">Foundational Pillars</h3>
            </div>
            <p className="text-slate-400 max-w-xs text-sm font-light">Practical tools for high-stakes leadership developed in the R&D trenches.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Eye, title: "Clarity of Sight", desc: "Developing the ability to see things exactly as they are, without the distortion of ego or panic." },
              { icon: Shield, title: "Emotional Shielding", desc: "Frameworks for maintaining composure during hardware deadlines and market volatility." },
              { icon: Wind, title: "Strategic Breath", desc: "Implementing organizational rhythms that allow teams to perform at peak without burning out." }
            ].map((pillar, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100">
                  <pillar.icon size={24} className="group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-2xl font-bold mb-4 tracking-tight">{pillar.title}</h4>
                <p className="text-slate-500 font-light leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="py-40 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-20">
            <h2 className="text-5xl font-black tracking-tight">Writing</h2>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 hover:underline mt-4">Read All Observations</a>
          </div>

          <div className="bg-white rounded-[3rem] p-4 shadow-sm border border-slate-100 overflow-hidden">
            {[
              { title: "People's Need for Calmness", desc: "The foundational essay exploring our collective desire for stillness.", category: "Core Philosophy" },
              { title: "The Art of Doing Nothing", desc: "Why 'non-action' is often the most strategic move a CEO can make.", category: "Strategy" },
              { title: "Silence as a Weapon", desc: "How to use pause and silence in high-stakes negotiations.", category: "Tactics" }
            ].map((post, i) => (
              <div key={i} className={`group grid md:grid-cols-12 gap-6 py-12 px-8 hover:bg-slate-50 transition-colors cursor-pointer ${i !== 2 ? 'border-b border-slate-50' : ''}`}>
                <div className="md:col-span-2">
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{post.category}</span>
                </div>
                <div className="md:col-span-8">
                  <h4 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                  <p className="text-slate-400 font-light text-sm italic">{post.desc}</p>
                </div>
                <div className="md:col-span-2 flex justify-end items-center">
                  <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-white transition-all">
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reset Booking Form */}
      <section id="reset" className="py-40 px-6">
        <div className="max-w-xl mx-auto">
          {bookingStatus === 'success' ? (
            <div className="text-center p-16 bg-blue-50 rounded-[3rem] border border-blue-100 animate-in fade-in zoom-in">
              <Circle size={48} className="text-blue-600 fill-current mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Signal Received.</h3>
              <p className="text-slate-500 italic font-light">"I'll reach out to your work email within 24 hours." — Rick</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black tracking-tight mb-4">The 15-Minute Reset</h2>
                <p className="text-slate-400 font-light text-lg">A focused diagnostic of your current leadership bottlenecks.</p>
              </div>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" required placeholder="NAME"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 placeholder:text-slate-300 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-blue-500 transition-colors"
                    onChange={e => setBookingData({...bookingData, name: e.target.value})}
                  />
                  <input 
                    type="email" required placeholder="WORK EMAIL"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 placeholder:text-slate-300 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-blue-500 transition-colors"
                    onChange={e => setBookingData({...bookingData, email: e.target.value})}
                  />
                </div>
                <textarea 
                  required rows="4" 
                  placeholder="WHAT IS DISTURBING YOUR CALM?"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 placeholder:text-slate-300 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  onChange={e => setBookingData({...bookingData, turbulence: e.target.value})}
                ></textarea>
                <button 
                  disabled={bookingStatus === 'loading' || !user}
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 text-xs uppercase tracking-[0.3em]"
                >
                  {bookingStatus === 'loading' ? 'Transmitting...' : 'Request a Reset'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Admin Dashboard */}
      <div className="py-20 px-6 bg-white border-t border-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <button onClick={() => setShowAdmin(!showAdmin)} className="text-slate-200 hover:text-slate-400 text-[9px] font-mono uppercase tracking-[0.2em] transition-colors">
            {showAdmin ? "[ Exit Console ]" : "[ Owner Console ]"}
          </button>
          
          {showAdmin && (
            <div className="mt-12 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl">
                <div className="flex justify-between items-center mb-12">
                  <h4 className="text-xl font-black uppercase tracking-tighter">Activity Stream</h4>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Live</div>
                </div>

                <div className="grid md:grid-cols-2 gap-16">
                  <div>
                    <h5 className="font-bold text-[10px] uppercase tracking-widest text-slate-300 mb-8 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-400" /> Pulse List ({leads.length})
                    </h5>
                    <div className="space-y-3">
                      {leads.length === 0 ? <p className="text-xs italic text-slate-200">Silence...</p> : 
                        leads.map(l => (
                          <div key={l.id} className="text-[11px] p-4 bg-slate-50 rounded-xl flex justify-between items-center group font-medium text-slate-600">
                            {l.email}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-[10px] uppercase tracking-widest text-slate-300 mb-8 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-blue-400" /> Active Requests ({bookings.length})
                    </h5>
                    <div className="space-y-6">
                      {bookings.length === 0 ? <p className="text-xs italic text-slate-200">No active signals.</p> :
                        bookings.map(b => (
                          <div key={b.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-sm text-slate-900 uppercase tracking-wider">{b.name}</span>
                              <span className="text-[9px] text-slate-300 uppercase font-mono">{b.timestamp?.toDate ? b.timestamp.toDate().toLocaleDateString() : 'Pending'}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed italic">"{b.turbulence}"</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="py-24 px-6 text-center border-t border-slate-50 bg-[#fafafa]">
        <div className="mb-8 font-black text-slate-900 tracking-[0.4em] uppercase text-xs">Rick Ng Advisory</div>
        <div className="flex justify-center gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
          <a href="#" className="hover:text-blue-600">LinkedIn</a>
          <a href="#" className="hover:text-blue-600">Substack</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-slate-300">© 2026 // Built for the Bumpy Ride</p>
      </footer>
    </div>
  );
};

export default App;