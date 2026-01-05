import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Heart, 
  Terminal, 
  Users, 
  Cpu, 
  MessageSquare, 
  ChevronRight, 
  Github, 
  Calendar,
  Zap,
  ShieldCheck,
  Search,
  Layers,
  Repeat,
  ArrowRight
} from 'lucide-react';

const App = () => {
  // Mode state: 'logic' (Tech) or 'satisfaction' (Human/CS)
  const [mode, setMode] = useState('logic');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLogic = mode === 'logic';

  // Theme constants
  const theme = {
    bg: isLogic ? 'bg-slate-950' : 'bg-stone-50',
    text: isLogic ? 'text-slate-200' : 'text-stone-800',
    accent: isLogic ? 'text-cyan-400' : 'text-rose-500',
    border: isLogic ? 'border-slate-800' : 'border-stone-200',
    card: isLogic ? 'bg-slate-900/50 backdrop-blur border-slate-800' : 'bg-white shadow-xl border-stone-100',
    font: isLogic ? 'font-mono' : 'font-sans'
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${theme.bg} ${theme.text} ${theme.font}`}>
      
      {/* --- Navigation & Toggle --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 backdrop-blur-md border-b ' + theme.border : 'py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLogic ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/10 text-rose-500'}`}>
              {isLogic ? <Terminal size={24} /> : <Heart size={24} />}
            </div>
            <span className="font-bold text-xl tracking-tighter">BAROD.Y</span>
          </div>

          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-slate-500/20">
            <button 
              onClick={() => setMode('logic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLogic ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 opacity-60'}`}
            >
              <Code2 size={16} /> <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Logic</span>
            </button>
            <button 
              onClick={() => setMode('satisfaction')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${!isLogic ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 opacity-60'}`}
            >
              <Users size={16} /> <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Satisfaction</span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className={`absolute top-0 right-0 w-1/2 h-full opacity-10 blur-3xl rounded-full transition-colors duration-1000 ${isLogic ? 'bg-cyan-500' : 'bg-rose-500 animate-pulse'}`}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className={`inline-block px-3 py-1 rounded-full mb-6 text-xs font-bold uppercase tracking-[0.2em] border ${isLogic ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
              {isLogic ? "// mode.active = 'logic_excellence'" : "👋 Mode: Human Empathy Active"}
            </div>
            
            <h1 className={`text-5xl md:text-8xl font-black mb-8 leading-[1.1] transition-all duration-500 ${isLogic ? 'tracking-tight' : 'tracking-normal'}`}>
              {isLogic ? (
                <>Building <span className="text-cyan-400">Logic</span>,<br />Ensuring Precision.</>
              ) : (
                <>Membangun Solusi, <br /><span className="text-rose-500 italic">Menciptakan Senyuman.</span></>
              )}
            </h1>

            <p className={`text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed opacity-80 ${isLogic ? 'font-light' : 'font-medium italic'}`}>
              {isLogic 
                ? "Saya Barod Yoedhistira. Developer yang memahami algoritma secara mendalam untuk performa sistem yang tak tertandingi."
                : "Halo, saya Barod. Mantan CS Manager yang kini menulis kode untuk menyelesaikan masalah nyata manusia, bukan sekadar bug."
              }
            </p>

            <div className="flex flex-wrap gap-4">
              <button className={`px-8 py-4 rounded-xl flex items-center gap-3 font-bold transition-all transform hover:scale-105 ${isLogic ? 'bg-cyan-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                {isLogic ? <Github size={20} /> : <MessageSquare size={20} />}
                {isLogic ? "Review My Logic" : "Start a Conversation"}
              </button>
              <button className={`px-8 py-4 rounded-xl border font-bold transition-all flex items-center gap-2 hover:bg-slate-500/10 ${theme.border}`}>
                Request Strategy Call <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Dual Experience (Timeline) --- */}
      <section className="py-24 border-y border-slate-500/10 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center">Jejak Karir & <span className={theme.accent}>Dualitas Keahlian</span></h2>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-500/20 hidden md:block"></div>

            {/* Timeline Items */}
            {[
              {
                year: '2021 - Present',
                side: 'left',
                title: 'Fullstack Web Developer',
                desc: 'Membangun arsitektur Laravel yang scalable dengan optimasi database tingkat tinggi.',
                icon: <Code2 />,
                tag: 'Tech',
                color: 'text-cyan-400'
              },
              {
                year: '2018 - 2021',
                side: 'right',
                title: 'Customer Satisfaction Manager',
                desc: 'Memimpin tim untuk menjaga NPS di angka 90+ dan menangani krisis komunikasi pelanggan.',
                icon: <Users />,
                tag: 'Management',
                color: 'text-rose-500'
              },
              {
                year: 'The Intersection',
                side: 'center',
                title: 'Hybrid Solution Architect',
                desc: 'Membangun sistem tiket otomatis yang menurunkan komplain pelanggan sebesar 40% melalui UX yang intuitif.',
                icon: <Zap />,
                tag: 'The Sweet Spot',
                color: 'text-amber-400'
              }
            ].map((item, idx) => (
              <div key={idx} className={`relative mb-16 flex flex-col items-center ${item.side === 'left' ? 'md:flex-row' : item.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                <div className={`w-full md:w-1/2 p-4 ${item.side === 'left' ? 'md:text-right md:pr-12' : item.side === 'right' ? 'md:text-left md:pl-12' : 'hidden'}`}>
                  <span className={`text-sm font-bold uppercase tracking-widest ${item.color}`}>{item.year}</span>
                  <h3 className="text-2xl font-bold mt-2">{item.title}</h3>
                  <p className="mt-4 opacity-70">{item.desc}</p>
                </div>

                {/* Center Node */}
                <div className={`z-10 w-12 h-12 rounded-full border-4 ${theme.bg} flex items-center justify-center shadow-xl ${item.color} ${item.side === 'center' ? 'md:mx-auto scale-150 mb-8 bg-amber-400/10 border-amber-400' : 'bg-slate-800 border-slate-700'}`}>
                  {item.icon}
                </div>

                <div className={`w-full md:w-1/2 p-4 ${item.side === 'center' ? 'text-center block md:px-20' : 'hidden md:block opacity-0'}`}>
                   {item.side === 'center' && (
                     <>
                        <span className={`text-sm font-bold uppercase tracking-widest ${item.color}`}>{item.year}</span>
                        <h3 className="text-3xl font-black mt-2">{item.title}</h3>
                        <p className="mt-4 text-lg opacity-80">{item.desc}</p>
                     </>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Satisfaction-Driven Development --- */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-8 leading-tight">Metodologi:<br />"Satisfaction-Driven Development"</h2>
              <p className="text-lg opacity-70 mb-10 italic">
                {isLogic 
                  ? "Arsitektur yang bersih adalah kunci kepuasan developer dan stabilitas jangka panjang."
                  : "Mendengarkan adalah langkah pertama dari penulisan kode. Baris pertama bukan 'print' tapi 'pahami'."
                }
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Search />, title: "Empathy Mapping", desc: "Menganalisis titik frustrasi user sebelum mulai mendesain solusi teknis." },
                  { icon: <Layers />, title: "Clean Architecture", desc: "Fondasi Laravel yang modular agar produk siap berkembang seiring bisnis." },
                  { icon: <Repeat />, title: "Iterative Feedback", desc: "Deploy cepat, dengarkan feedback, lalu sempurnakan secara konstan." }
                ].map((step, i) => (
                  <div key={i} className={`p-6 rounded-2xl border transition-all hover:translate-x-2 ${theme.card}`}>
                    <div className="flex gap-4">
                      <div className={theme.accent}>{step.icon}</div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                        <p className="text-sm opacity-60">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-1/2 relative">
               <div className={`aspect-square rounded-full border-2 border-dashed flex items-center justify-center p-12 transition-all duration-1000 ${isLogic ? 'rotate-90 border-cyan-500/20' : 'rotate-0 border-rose-500/20'}`}>
                  <div className={`w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-700 ${isLogic ? 'border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.2)]' : 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.2)]'}`}>
                     <div className="text-center p-8">
                        <span className="block text-6xl mb-4">
                          {isLogic ? "0101" : "😊"}
                        </span>
                        <p className="font-bold uppercase tracking-widest text-xs opacity-50">Core Philosophy</p>
                        <p className="text-lg font-bold">
                          {isLogic ? "Performance is Reliability" : "Ease of Use is Respect"}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Selected Works --- */}
      <section className={`py-24 transition-colors duration-500 ${isLogic ? 'bg-slate-900/30' : 'bg-stone-100'}`}>
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-black mb-4">Selected Works</h2>
              <p className="opacity-60">Proyek pilihan dengan keseimbangan fungsi dan perasaan.</p>
            </div>
            <div className={`hidden md:flex gap-2 text-sm ${theme.accent}`}>
               <span className="font-bold">Total Satisfaction Index: 9.8/10</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "EduLink Pro Dashboard",
                challenge: "Menangani 10rb request/menit dengan latency di bawah 100ms.",
                solution: "Optimasi Query Laravel & Implementasi Redis Caching.",
                impact: "Guru melaporkan navigasi terasa 3x lebih cepat (User Happy!).",
                tags: ["Laravel", "Redis", "Vue.js"]
              },
              {
                title: "Compassion Care CRM",
                challenge: "UI yang terlalu kompleks membuat agen CS stres dan sering salah input.",
                solution: "Redesain alur kerja berbasis psikologi warna dan shortcut keyboard.",
                impact: "Human error turun 60%, produktivitas agen naik drastis.",
                tags: ["React", "Tailwind", "Node.js"]
              }
            ].map((proj, i) => (
              <div key={i} className={`group rounded-3xl overflow-hidden border p-1 transition-all hover:scale-[1.02] ${theme.card}`}>
                <div className="p-8">
                  <div className="flex gap-2 mb-6">
                    {proj.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded bg-slate-500/10 font-bold uppercase">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{proj.title}</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-3">
                      <div className="text-slate-500 flex-shrink-0 mt-1 font-bold text-xs">CHL:</div>
                      <p className="text-sm opacity-80">{proj.challenge}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className={`${isLogic ? 'text-cyan-400' : 'text-rose-500'} flex-shrink-0 mt-1 font-bold text-xs uppercase`}>
                        {isLogic ? 'Code:' : 'Sol:'}
                      </div>
                      <p className="text-sm font-bold italic">{proj.solution}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-l-4 ${isLogic ? 'bg-cyan-500/5 border-cyan-500' : 'bg-rose-500/5 border-rose-500'}`}>
                    <div className="flex items-center gap-3">
                      <Zap size={18} className={theme.accent} />
                      <div>
                        <p className="text-xs font-bold uppercase opacity-50">Impact Metrics</p>
                        <p className="text-sm font-bold">{proj.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer / CTA --- */}
      <footer className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              {isLogic 
                ? "Let's Optimize Your Digital Logic."
                : "Ayo Bangun Pengalaman yang Bermakna."
              }
            </h2>
            <p className="text-xl opacity-70 mb-12">
              "Bug adalah masalah teknis, tapi ketidakpuasan adalah kegagalan sistem. Saya menangani keduanya."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
              <a href="#" className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:shadow-2xl ${theme.card}`}>
                <MessageSquare className={theme.accent} />
                <span className="font-bold">Start a Conversation</span>
                <span className="text-xs opacity-50">Gaya Chat Interaktif</span>
              </a>
              <a href="#" className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:shadow-2xl ${theme.card}`}>
                <Github className={theme.accent} />
                <span className="font-bold">Review My Logic</span>
                <span className="text-xs opacity-50">Eksplorasi Repo GitHub</span>
              </a>
              <a href="#" className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:shadow-2xl ${theme.card}`}>
                <Calendar className={theme.accent} />
                <span className="font-bold">Request Strategy Call</span>
                <span className="text-xs opacity-50">Koneksi Via Calendly</span>
              </a>
            </div>

            <div className="border-t border-slate-500/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 text-sm">
              <p>© 2024 Barod Yoedhistira. Logic-Empathy Framework v2.5</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-cyan-400">LinkedIn</a>
                <a href="#" className="hover:text-cyan-400">Twitter</a>
                <a href="#" className="hover:text-cyan-400">Email</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Global Styles for transitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,700;0,800;1,400&display=swap');
        
        body {
          margin: 0;
          transition: background-color 0.7s ease;
        }

        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: ${isLogic ? '#22d3ee44' : '#f43f5e44'}; 
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default App;
