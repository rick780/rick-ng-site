import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Mail, 
  Linkedin, 
  Twitter,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';

// --- CONFIGURATION ---
const BIO_PHOTO = "src/assets/bio_photo.png";

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Expertise', href: '#expertise' },
    { name: 'Writing', href: '#writing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Rick Ng</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-blue-500 transition-colors">
                {link.name}
              </a>
            ))}
            <button 
              onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-neutral-950 flex flex-col items-center justify-center space-y-8 md:hidden">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black uppercase tracking-tighter">{link.name}</a>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Limited Slots for Q2 2024
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              Building <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">
                Resilient 
              </span> <br />
              Founders.
            </h1>
            <p className="text-xl text-neutral-400 max-w-lg mb-10 leading-relaxed">
              I partner with high-growth CEOs to master the psychology of scale, sharpen decision-making, and navigate the chaos of hyper-growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group">
                Apply for Coaching
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center">
                Read Philosophy
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-[40px] overflow-hidden border border-neutral-800 bg-neutral-900 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl shadow-blue-500/10">
              <img 
                src={BIO_PHOTO} 
                alt="Rick Ng" 
                className="w-full aspect-[4/5] object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop";
                }}
              />
            </div>
            {/* Decorative background blur */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px]"></div>
          </div>
        </div>
      </section>

      {/* Philosophy / About */}
      <section id="philosophy" className="py-32 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-sm font-bold text-blue-500 uppercase tracking-[0.3em] mb-6">Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-tight">
              Scaling a company is a psychological game. If you don't grow, the business won't either.
            </h3>
            <div className="space-y-6 text-neutral-400 text-lg leading-relaxed">
              <p>
                Most founders fail not because of their product, but because their internal operating system wasn't built for the complexity of a 100+ person organization.
              </p>
              <p>
                My approach combines deep behavioral psychology with hard-won operational frameworks. We don't just talk about "feelings"—we talk about high-leverage decision making and sustainable high performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Bento */}
      <section id="expertise" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-10 bg-neutral-900 border border-neutral-800 rounded-[32px] hover:border-blue-500/50 transition-colors">
              <Target size={40} className="text-blue-500 mb-6" />
              <h4 className="text-3xl font-black mb-4">Strategic Clarity</h4>
              <p className="text-neutral-400 text-lg">Cutting through the noise to identify the 20% of actions that drive 80% of your results. We align your daily energy with long-term vision.</p>
            </div>
            <div className="p-10 bg-neutral-900 border border-neutral-800 rounded-[32px] hover:border-blue-500/50 transition-colors">
              <ShieldCheck size={40} className="text-blue-500 mb-6" />
              <h4 className="text-2xl font-black mb-4">Conflict Resolution</h4>
              <p className="text-neutral-400">Navigating difficult board relations and co-founder dynamics with professional poise.</p>
            </div>
            <div className="p-10 bg-neutral-900 border border-neutral-800 rounded-[32px] hover:border-blue-500/50 transition-colors">
              <TrendingUp size={40} className="text-blue-500 mb-6" />
              <h4 className="text-2xl font-black mb-4">Operational Scale</h4>
              <p className="text-neutral-400">Designing the systems and communication loops required for Series B+ growth.</p>
            </div>
            <div className="md:col-span-2 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white">
              <MessageSquare size={40} className="mb-6" />
              <h4 className="text-3xl font-black mb-4">1:1 High-Stakes Coaching</h4>
              <p className="text-blue-50 text-lg">A private, confidential sounding board for the world's most ambitious leaders. No fluff, just radical candor and growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Writing Snippet */}
      <section id="writing" className="py-32 bg-neutral-900/30 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-5xl font-black tracking-tighter">The Founder's Journal.</h2>
              <p className="text-neutral-500 mt-2">Bi-weekly insights on leadership and psychology.</p>
            </div>
            <button className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2 group">
              View all posts <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "The Hidden Cost of 'Always On' Culture", date: "MAR 12, 2024", tag: "PSYCHOLOGY" },
              { title: "When to Fire Your First VP of Sales", date: "FEB 28, 2024", tag: "OPERATIONS" }
            ].map((post, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer">
                <span className="text-[10px] font-black text-blue-500 tracking-widest mb-4 block">{post.tag}</span>
                <h4 className="text-2xl font-bold mb-6 group-hover:text-blue-400 transition-colors">{post.title}</h4>
                <div className="flex justify-between items-center text-neutral-500 text-xs font-bold uppercase tracking-widest">
                  <span>{post.date}</span>
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-neutral-900 rounded-[48px] p-8 md:p-20 border border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
          
          <div className="grid lg:grid-cols-2 gap-20 relative z-10">
            <div>
              <h2 className="text-5xl font-black tracking-tighter mb-8 leading-tight">Start your <br />transformation.</h2>
              <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
                Currently accepting inquiries for strategic advisory and executive coaching. Please describe your current context and the challenges you're looking to solve.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-neutral-300">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center"><Mail size={18} /></div>
                  <span className="font-medium">rick@ngadvisory.com</span>
                </div>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-blue-600 outline-none transition-all" />
                <input type="text" placeholder="Company" className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-blue-600 outline-none transition-all" />
              </div>
              <input type="email" placeholder="Work Email" className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-blue-600 outline-none transition-all" />
              <textarea placeholder="Tell me about your current stage and goals..." rows={5} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
              <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-neutral-500">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-neutral-300 fill-current" />
            <span className="font-black text-neutral-300 uppercase tracking-widest text-sm">Rick Ng</span>
          </div>
          
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-blue-500 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-500 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Substack</a>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2024 Rick Ng Strategic Advisory
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;