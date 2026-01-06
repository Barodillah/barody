import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Code2,
    Heart,
    Terminal,
    Users,
    Cpu,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    Github,
    Calendar,
    Zap,
    Search,
    Layers,
    Repeat,
    Phone,
    X,
    Check,
    Clock,
    Sunrise,
    Sun,
    Sunset,
    Rocket,
    Sparkles
} from 'lucide-react';

const App = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialTheme = searchParams.get('theme') || 'logic';

    // Mode state: 'logic' (Tech) or 'satisfaction' (Human/CS)
    const [mode, setMode] = useState(initialTheme);
    const [scrolled, setScrolled] = useState(false);
    const [timelineProgress, setTimelineProgress] = useState(0);

    // Typewriter state for "ision."
    const [typewriterText, setTypewriterText] = useState("");
    const fullText = "ision.";

    // Balloon Physics & Animation State
    const [balloonPos, setBalloonPos] = useState({ x: 0, y: -80 });
    const [showBalloon, setShowBalloon] = useState(false);
    const dotRef = useRef(null);

    // Core Philosophy Hover State
    const [coreHovered, setCoreHovered] = useState(false);
    const [binaryText, setBinaryText] = useState('0101');

    // Balloon attachment state
    const [balloonAttached, setBalloonAttached] = useState(true);

    // Page transition state
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Strategy Call Modal state
    const [showCallModal, setShowCallModal] = useState(false);
    const [callStep, setCallStep] = useState(1);
    const [selectedTime, setSelectedTime] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const phoneInputRef = useRef(null);

    const timelineRef = useRef(null);
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: null, y: null, radius: 150 });

    // Navigate to chat with transition
    const navigateToChat = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate(`/chat?theme=${mode}`);
        }, 600);
    };

    // Strategy Call Modal Handlers
    const timeSlots = [
        { id: 'pagi', label: 'Pagi', time: '09:00 - 11:00', emoji: '🌅', IconComponent: Sunrise },
        { id: 'siang', label: 'Siang', time: '13:00 - 15:00', emoji: '☀️', IconComponent: Sun },
        { id: 'sore', label: 'Sore', time: '16:00 - 18:00', emoji: '🌆', IconComponent: Sunset },
    ];

    const openCallModal = () => {
        setShowCallModal(true);
        setCallStep(1);
        setSelectedTime('');
        setPhoneNumber('');
        setShowConfetti(false);
    };

    const closeCallModal = () => {
        setShowCallModal(false);
        setCallStep(1);
        setSelectedTime('');
        setPhoneNumber('');
        setShowConfetti(false);
    };

    const handleTimeSelect = (timeId) => {
        setSelectedTime(timeId);
        // Auto advance to step 2 after short delay
        setTimeout(() => {
            setCallStep(2);
            // Focus phone input after transition
            setTimeout(() => {
                phoneInputRef.current?.focus();
            }, 400);
        }, 300);
    };

    const formatPhoneNumber = (value) => {
        // Remove non-digits
        let digits = value.replace(/\D/g, '');
        // Remove leading 0 since we already have +62 prefix
        if (digits.startsWith('0')) {
            digits = digits.slice(1);
        }
        // Format as 812-3456-7890
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const isPhoneValid = phoneNumber.replace(/\D/g, '').length >= 9;

    const handleCallSubmit = () => {
        if (!isPhoneValid) return;

        setIsSubmitting(true);

        // Simulate submission
        setTimeout(() => {
            setIsSubmitting(false);
            setCallStep(3);
            setShowConfetti(true);

            // Auto close after success
            setTimeout(() => {
                closeCallModal();
            }, 3000);
        }, 1000);
    };

    // --- Background Particles (Anti-Gravity) Logic ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let animationFrameId;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 2 + 1;
                this.color = color;
                this.density = (Math.random() * 30) + 1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                let dx = mouseRef.current.x - this.x;
                let dy = mouseRef.current.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouseRef.current.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouseRef.current.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }

        const init = () => {
            particlesArray = [];
            const numberOfParticles = (canvas.width * canvas.height) / 9000;
            const color = mode === 'logic' ? 'rgba(34, 211, 238, 0.4)' : 'rgba(244, 63, 94, 0.4)';

            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particlesArray.push(new Particle(x, y, color));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].draw();
                particlesArray[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouseRef.current.x = e.x;
            mouseRef.current.y = e.y;

            // Balloon Physics Calculation
            if (mode === 'satisfaction' && dotRef.current) {
                const rect = dotRef.current.getBoundingClientRect();
                const dotCenterX = rect.left + rect.width / 2;
                const dotCenterY = rect.top + rect.height / 2;

                let targetX = e.clientX - dotCenterX;
                let targetY = e.clientY - dotCenterY;

                // Maximum String Length
                const maxLen = 150;
                const releaseLen = 200; // Distance to release balloon
                const dist = Math.sqrt(targetX * targetX + targetY * targetY);

                // If cursor is beyond release distance, detach balloon
                if (dist > releaseLen) {
                    setBalloonAttached(false);
                } else if (dist < maxLen * 0.5) {
                    // Re-attach if cursor comes close enough
                    setBalloonAttached(true);
                }

                // Only update balloon position if attached
                if (dist <= maxLen) {
                    // Add float up bias
                    targetY -= 30;
                    setBalloonPos({ x: targetX, y: targetY });
                } else if (dist <= releaseLen) {
                    // At max length, constrain position
                    targetX = (targetX / dist) * maxLen;
                    targetY = (targetY / dist) * maxLen - 30;
                    setBalloonPos({ x: targetX, y: targetY });
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        init();
        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mode]);

    // Handle Logic Typewriter and Satisfaction Balloon Delay
    useEffect(() => {
        if (mode === 'logic') {
            setTypewriterText("");
            setShowBalloon(false); // Reset balloon
            let currentIdx = 0;

            const type = () => {
                if (currentIdx < fullText.length) {
                    setTypewriterText(fullText.substring(0, currentIdx + 1));
                    currentIdx++;
                    setTimeout(type, 150);
                }
            };

            const timeoutId = setTimeout(type, 800);
            return () => clearTimeout(timeoutId);
        } else {
            // Satisfaction Mode: Show Balloon with delay
            setBalloonPos({ x: 0, y: -90 });
            const balloonTimeout = setTimeout(() => {
                setShowBalloon(true);
            }, 800); // 800ms delay before balloon starts inflating
            return () => clearTimeout(balloonTimeout);
        }
    }, [mode]);

    const [currentYear, setCurrentYear] = useState(2018);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            if (timelineRef.current) {
                const rect = timelineRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // Calculate progress: 0 when top of section hits bottom of viewport, 1 when bottom of section hits top of viewport
                // Adjusted to be more centered: 0 when top hits center, 1 when bottom hits center
                const totalHeight = rect.height + windowHeight;
                const scrollPos = windowHeight - rect.top;

                // Progress from 0 to 1
                const rawProgress = Math.max(0, Math.min(1, scrollPos / totalHeight));
                setTimelineProgress(rawProgress);

                // Calculate year: 2018 to Current Year + 1 (future proof)
                const startYear = 2018;
                const endYear = new Date().getFullYear();

                // Map progress (roughly 0.2 to 0.8 range for visibility) to years
                const yearProgress = Math.max(0, Math.min(1, (rawProgress - 0.2) / 0.6));
                const calcYear = Math.floor(yearProgress * (endYear - startYear) + startYear);

                setCurrentYear(Math.min(endYear, Math.max(startYear, calcYear)));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isLogic = mode === 'logic';

    // Theme constants
    const theme = {
        bg: isLogic ? 'bg-slate-950' : 'bg-stone-50',
        text: isLogic ? 'text-slate-200' : 'text-stone-800',
        accent: isLogic ? 'text-cyan-400' : 'text-rose-500',
        accentGradient: isLogic ? 'via-cyan-400' : 'via-rose-500',
        border: isLogic ? 'border-slate-800' : 'border-stone-200',
        card: isLogic ? 'bg-slate-900/50 backdrop-blur border-slate-800' : 'bg-white shadow-xl border-stone-100',
        font: isLogic ? 'font-mono' : 'font-sans'
    };

    return (
        <div
            className={`min-h-screen transition-colors duration-700 ${theme.bg} ${theme.text} ${theme.font} relative`}
            data-theme={mode}
        >

            {/* --- Background Canvas for Anti-Gravity Particles --- */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-0 pointer-events-none opacity-60"
            />

            {/* Page Transition Overlay */}
            {isTransitioning && (
                <div className="page-transition-overlay">
                    <div className={`page-transition-circle ${mode}`}>
                        <div className="flex items-center justify-center h-full gap-2">
                            <span className="transition-loading-dot"></span>
                            <span className="transition-loading-dot"></span>
                            <span className="transition-loading-dot"></span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Navigation & Toggle --- */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 backdrop-blur-md border-b ' + theme.border + (isLogic ? ' bg-slate-950/80' : ' bg-white/95') : 'py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLogic ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isLogic ? <Terminal size={24} /> : <Heart size={24} />}
                        </div>
                        <span className="font-bold text-xl tracking-tighter">BAROD.Y</span>
                    </div>

                    <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-slate-500/20 relative z-50">
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
            <header className="relative pt-32 pb-20 overflow-hidden z-10">
                <div className={`absolute top-0 right-0 w-1/2 h-full opacity-10 blur-3xl rounded-full transition-colors duration-1000 ${isLogic ? 'bg-cyan-500' : 'bg-rose-500 animate-pulse'}`}></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className={`inline-block px-3 py-1 rounded-full mb-6 text-xs font-bold uppercase tracking-[0.2em] border ${isLogic ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
                            {isLogic ? "// mode.active = 'logic_excellence'" : "👋 Mode: Human Empathy Active"}
                        </div>

                        <h1 className={`text-5xl md:text-8xl font-black mb-8 leading-[1.1] transition-all duration-500 ${isLogic ? 'tracking-tight' : 'tracking-normal'}`}>
                            {isLogic ? (
                                <div className="flex flex-col">
                                    <span>Building <span className="text-cyan-400">Logic</span>,</span>
                                    <div className="flex flex-col mt-4">
                                        <span>Ensuring</span>
                                        <div className="flex items-center h-[1.1em]">
                                            <span>Prec</span>
                                            <span className="text-slate-200">{typewriterText}</span>
                                            <span className="w-1.5 h-[0.9em] bg-cyan-400 animate-cursor-blink ml-1.5 inline-block shadow-[0_0_10px_#22d3ee]"></span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <span>Membangun Solusi,</span>
                                    <span className="text-rose-500 italic mt-2">Menciptakan</span>
                                    <div className="mt-2 flex items-center relative">
                                        <span className="text-rose-500 italic">Senyuman</span>

                                        {/* --- Interactive Dot & Magnet Balloon --- */}
                                        <div className="relative inline-flex items-center ml-0.5">
                                            <span ref={dotRef} className="text-rose-500 font-black">.</span>

                                            {/* Balloon follows cursor, string anchored at dot */}
                                            {showBalloon && (
                                                <>
                                                    {/* SVG String - only show when attached */}
                                                    {balloonAttached && (
                                                        <svg
                                                            className="absolute pointer-events-none overflow-visible transition-opacity duration-300"
                                                            style={{
                                                                left: '50%',
                                                                top: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                width: '300px',
                                                                height: '300px'
                                                            }}
                                                        >
                                                            <path
                                                                d={`M 150 150 Q ${150 + balloonPos.x / 3} ${150 + balloonPos.y / 2} ${150 + balloonPos.x} ${150 + balloonPos.y - 30}`}
                                                                fill="none"
                                                                stroke="rgba(244, 63, 94, 0.5)"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    )}

                                                    {/* Floating Balloon - follows cursor when attached, stays with idle animation when detached */}
                                                    <div
                                                        className={`absolute pointer-events-none transition-all ${balloonAttached ? 'duration-150 ease-out' : 'duration-500 ease-in-out'}`}
                                                        style={balloonAttached ? {
                                                            transform: `translate(calc(-50% + ${balloonPos.x}px), calc(-50% + ${balloonPos.y - 30}px))`,
                                                            left: '50%',
                                                            top: '50%'
                                                        } : {
                                                            // When detached, stay in default position with idle animation
                                                            transform: 'translate(-50%, -120px)',
                                                            left: '50%',
                                                            top: '50%'
                                                        }}
                                                    >
                                                        <div className={`text-6xl select-none drop-shadow-2xl ${balloonAttached ? 'animate-float-balloon' : 'animate-idle-balloon'}`}>
                                                            😊
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </h1>

                        <p className={`text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed opacity-80 ${isLogic ? 'font-light' : 'font-medium italic'}`}>
                            {isLogic
                                ? "Saya Barod Yoedhistira. Developer yang memahami algoritma secara mendalam untuk performa sistem yang tak tertandingi."
                                : "Halo, saya Barod Yoedhistira, CS Manager yang juga menulis kode untuk menyelesaikan masalah nyata manusia, bukan sekadar bug."
                            }
                        </p>

                        <div className="flex flex-wrap gap-4 relative z-20">
                            <button
                                onClick={() => isLogic ? window.open('https://github.com/Barodillah', '_blank') : navigateToChat()}
                                className={`px-8 py-4 rounded-xl flex items-center gap-3 font-bold transition-all transform hover:scale-105 active:scale-95 ${isLogic ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'}`}
                            >
                                {isLogic ? <Github size={20} /> : <MessageSquare size={20} />}
                                {isLogic ? "Review My Logic" : "Start a Conversation"}
                            </button>
                            <button
                                onClick={openCallModal}
                                className={`px-8 py-4 rounded-xl border font-bold transition-all flex items-center gap-2 hover:bg-white/10 active:scale-95 ${theme.border}`}
                            >
                                Request Strategy Call <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Dual Experience (Timeline) --- */}
            <section ref={timelineRef} className="py-24 border-y border-slate-500/10 relative overflow-hidden z-10">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-16 text-center">Jejak Karir & <span className={theme.accent}>Dualitas Keahlian</span></h2>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Center Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-500/20"></div>

                        {/* Dynamic Year Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none overflow-hidden flex items-center justify-center w-full h-full">
                            <span className={`text-[15rem] md:text-[25rem] font-bold opacity-5 leading-none transition-all duration-300 ${isLogic ? 'text-cyan-500' : 'text-rose-500'}`}>
                                {currentYear}
                            </span>
                        </div>

                        {/* Scroll Particle (Follows for both modes) */}
                        <div
                            className={`absolute left-1/2 -ml-[3px] w-[7px] h-20 bg-gradient-to-b from-transparent ${theme.accentGradient} to-transparent z-0 blur-[2px]`}
                            style={{ top: `${timelineProgress * 100}%`, transition: 'top 0.15s ease-out' }}
                        >
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-colors duration-500 ${isLogic ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-rose-500 shadow-[0_0_15px_#f43f5e]'}`}></div>
                        </div>

                        {/* Timeline Items */}
                        {[
                            {
                                year: '2020 - Present',
                                side: 'left',
                                title: 'Fullstack Web Developer',
                                desc: 'Membangun arsitektur Laravel yang scalable dengan optimasi database tingkat tinggi.',
                                icon: <Code2 />,
                                tag: 'Tech',
                                color: 'text-cyan-400',
                                action: !isLogic ? {
                                    label: 'Back to My Introvert Side',
                                    onClick: () => setMode('logic'),
                                    iconLeft: <ChevronLeft size={14} />,
                                    iconRight: <Terminal size={14} />
                                } : null
                            },
                            {
                                year: '2022 - Present',
                                side: 'right',
                                title: 'Customer Satisfaction Manager',
                                desc: 'Memimpin tim untuk menjaga NPS di angka 90+ dan menangani krisis komunikasi pelanggan.',
                                icon: <Users />,
                                tag: 'Management',
                                color: 'text-rose-500',
                                action: isLogic ? {
                                    label: 'See My Extrovert Side',
                                    onClick: () => setMode('satisfaction'),
                                    icon: <Heart size={14} />
                                } : null
                            },
                            {
                                year: 'The Intersection',
                                side: 'center',
                                title: 'Hybrid Solution Architect',
                                desc: 'Membangun sistem booking otomatis yang menurunkan komplain pelanggan sebesar 40% melalui UX yang intuitif.',
                                icon: <Zap />,
                                tag: 'The Sweet Spot',
                                color: 'text-amber-400'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className={`relative mb-16 flex flex-col items-center z-10 ${item.side === 'left' ? 'md:flex-row' : item.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                                <div className={`w-full md:w-1/2 p-4 ${item.side === 'left' ? 'md:text-right md:pr-12' : item.side === 'right' ? 'md:text-left md:pl-12' : 'hidden'}`}>
                                    <span className={`text-sm font-bold uppercase tracking-widest ${item.color}`}>{item.year}</span>
                                    <h3 className="text-2xl font-bold mt-2">{item.title}</h3>
                                    <p className="mt-4 opacity-70">{item.desc}</p>
                                    {item.action && (
                                        <button
                                            onClick={item.action.onClick}
                                            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all transform hover:scale-105 active:scale-95 ${item.color} border border-current ${item.color.includes('cyan') ? 'hover:bg-cyan-500/10' : 'hover:bg-rose-500/10'}`}
                                        >
                                            {item.action.iconLeft || item.action.icon}
                                            {item.action.label}
                                            {item.action.iconRight || <ChevronRight size={14} />}
                                        </button>
                                    )}
                                </div>

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
            <section className="py-24 overflow-hidden z-10">
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
                            <div
                                className={`aspect-square rounded-full border-2 border-dashed flex items-center justify-center p-12 transition-all duration-700 cursor-pointer
                                    ${isLogic ? 'border-cyan-500/20' : 'border-rose-500/20'}
                                    ${coreHovered ? (isLogic ? 'rotate-[360deg] scale-110' : 'scale-110') : (isLogic ? 'rotate-90' : 'rotate-0')}
                                `}
                                onMouseEnter={() => {
                                    setCoreHovered(true);
                                    if (isLogic) {
                                        // Start binary animation
                                        const binaryInterval = setInterval(() => {
                                            setBinaryText(Array.from({ length: 4 }, () => Math.round(Math.random())).join(''));
                                        }, 100);
                                        window.binaryInterval = binaryInterval;
                                    }
                                }}
                                onMouseLeave={() => {
                                    setCoreHovered(false);
                                    setBinaryText('0101');
                                    if (window.binaryInterval) {
                                        clearInterval(window.binaryInterval);
                                    }
                                }}
                            >
                                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-500
                                    ${isLogic
                                        ? `border-cyan-500 ${coreHovered ? 'shadow-[0_0_80px_rgba(34,211,238,0.6)] border-cyan-400' : 'shadow-[0_0_50px_rgba(34,211,238,0.2)]'}`
                                        : `border-rose-500 ${coreHovered ? 'shadow-[0_0_80px_rgba(244,63,94,0.6)] border-rose-400' : 'shadow-[0_0_50px_rgba(244,63,94,0.2)]'}`
                                    }`}
                                >
                                    <div className="text-center p-8">
                                        {isLogic ? (
                                            /* Logic Mode: Binary with rotation animation */
                                            <span className={`block text-6xl mb-4 font-mono transition-all duration-500
                                                ${coreHovered ? 'text-cyan-300 scale-125 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]' : ''}
                                            `}>
                                                {coreHovered ? binaryText : '0101'}
                                            </span>
                                        ) : (
                                            /* Satisfaction Mode: Emoji pulses like heartbeat on hover */
                                            <span className={`block text-6xl mb-4 transition-all duration-500
                                                ${coreHovered ? 'scale-110' : ''}
                                            `}
                                                style={coreHovered ? {
                                                    animation: 'heartbeat-emoji 1s ease-in-out infinite',
                                                    filter: 'drop-shadow(0 0 15px rgba(244, 63, 94, 0.6))'
                                                } : {}}
                                            >
                                                {coreHovered ? '❤️' : '😊'}
                                            </span>
                                        )}
                                        <p className="font-bold uppercase tracking-widest text-xs opacity-50">Core Philosophy</p>
                                        {isLogic ? (
                                            /* Logic Mode: Tech style - scale up with glow */
                                            <p className={`text-lg font-bold transition-all duration-300 ${coreHovered ? 'scale-110 text-cyan-300' : ''}`}>
                                                Performance is Reliability
                                            </p>
                                        ) : (
                                            /* Satisfaction Mode: Sweet heartbeat effect */
                                            <p
                                                className={`text-lg font-bold transition-all duration-500 ${coreHovered ? 'text-rose-400' : ''}`}
                                                style={coreHovered ? {
                                                    animation: 'heartbeat-text 1.5s ease-in-out infinite',
                                                    textShadow: '0 0 20px rgba(244, 63, 94, 0.4)'
                                                } : {}}
                                            >
                                                Ease of Use is Respect 💕
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Decorative particles on hover */}
                            {coreHovered && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`absolute w-2 h-2 rounded-full animate-ping
                                                ${isLogic ? 'bg-cyan-400' : 'bg-rose-400'}
                                            `}
                                            style={{
                                                left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                                                top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: '1.5s'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Selected Works --- */}
            <section className={`py-24 transition-colors duration-500 z-10 relative ${isLogic ? 'bg-slate-900/30' : 'bg-stone-100'}`}>
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
                                challenge: "System yang belum paperless membuat CS stres dan sering salah input.",
                                solution: "Redesain alur kerja berbasis CRM yang terintegrasi.",
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
            <footer className="py-24 z-10 relative">
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 relative z-30">
                            <button
                                onClick={() => navigateToChat()}
                                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:shadow-2xl hover:scale-105 cursor-pointer ${theme.card}`}
                            >
                                <MessageSquare className={theme.accent} />
                                <span className="font-bold">Start a Conversation</span>
                                <span className="text-xs opacity-50">Gaya Chat Interaktif</span>
                            </button>
                            <a href="https://github.com/Barodillah" target="_blank" className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:shadow-2xl ${theme.card}`}>
                                <Github className={theme.accent} />
                                <span className="font-bold">Review My Logic</span>
                                <span className="text-xs opacity-50">Eksplorasi Repo GitHub</span>
                            </a>
                            <button
                                onClick={openCallModal}
                                className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all hover:shadow-2xl hover:scale-105 cursor-pointer ${theme.card}`}
                            >
                                <Calendar className={theme.accent} />
                                <span className="font-bold">Request Strategy Call</span>
                                <span className="text-xs opacity-50">Jadwalkan Diskusi Strategi</span>
                            </button>
                        </div>

                        <div className="border-t border-slate-500/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 text-sm">
                            <p>© {new Date().getFullYear()} Barod Yoedhistira. Logic-Empathy Framework v2.5</p>
                            <div className="flex gap-8">
                                <a href="https://www.linkedin.com/in/barod-abdillah-284509169/" target="_blank" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
                                <a href="https://x.com/barodillah" target="_blank" className="hover:text-cyan-400 transition-colors">Twitter</a>
                                <a href="mailto:gmail@cuma.click" target="_blank" className="hover:text-cyan-400 transition-colors">Email</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- Strategy Call Modal --- */}
            {showCallModal && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeCallModal()}>
                    <div className={`modal-container relative w-full max-w-md rounded-3xl border overflow-hidden ${isLogic ? 'bg-slate-900 border-slate-700' : 'bg-white border-stone-200'}`}>

                        {/* Progress Bar */}
                        <div className={`h-1 ${isLogic ? 'bg-slate-800' : 'bg-stone-100'}`}>
                            <div
                                className={`progress-bar h-full ${isLogic ? 'bg-cyan-500' : 'bg-rose-500'}`}
                                style={{ width: `${(callStep / 3) * 100}%` }}
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={closeCallModal}
                            className={`modal-close absolute top-4 right-4 p-2 rounded-full transition-all ${isLogic ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-100 text-stone-400'}`}
                        >
                            <X size={20} />
                        </button>

                        {/* Modal Content */}
                        <div className="p-8 pt-12">

                            {/* Step 1: Time Selection */}
                            {callStep === 1 && (
                                <div className="step-enter">
                                    <div className="text-center mb-8">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${isLogic ? 'bg-cyan-500/10' : 'bg-rose-500/10'}`}>
                                            <Clock className={`${isLogic ? 'text-cyan-400' : 'text-rose-500'}`} size={32} />
                                        </div>
                                        <h3 className={`text-2xl font-bold mb-2 ${isLogic ? 'text-white' : 'text-stone-800'}`}>
                                            Kapan waktu santai Anda?
                                        </h3>
                                        <p className={`text-sm ${isLogic ? 'text-slate-400' : 'text-stone-500'}`}>
                                            Pilih waktu yang nyaman untuk diskusi strategi
                                        </p>
                                    </div>

                                    <div className="flex flex-row gap-2 sm:gap-3">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleTimeSelect(slot.id)}
                                                className={`flex-1 p-3 sm:p-4 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center gap-1 sm:gap-2
                                                    ${selectedTime === slot.id
                                                        ? (isLogic ? 'border-cyan-500 bg-cyan-500/10 pill-selected' : 'border-rose-500 bg-rose-500/10 pill-selected')
                                                        : (isLogic ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50' : 'border-stone-200 hover:border-stone-300 bg-stone-50')
                                                    }`}
                                            >
                                                {isLogic ? (
                                                    <slot.IconComponent size={24} className={`sm:w-7 sm:h-7 ${selectedTime === slot.id ? 'text-cyan-400' : 'text-slate-400'}`} />
                                                ) : (
                                                    <span className="text-xl sm:text-2xl">{slot.emoji}</span>
                                                )}
                                                <span className={`font-bold text-sm sm:text-base whitespace-nowrap ${isLogic ? 'text-white' : 'text-stone-800'}`}>{slot.label}</span>
                                                <span className={`text-[10px] sm:text-xs whitespace-nowrap ${isLogic ? 'text-slate-400' : 'text-stone-500'}`}>{slot.time}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Phone Input */}
                            {callStep === 2 && (
                                <div className="step-enter">
                                    <div className="text-center mb-8">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${isLogic ? 'bg-cyan-500/10' : 'bg-rose-500/10'}`}>
                                            <Phone className={`${isLogic ? 'text-cyan-400' : 'text-rose-500'}`} size={32} />
                                        </div>
                                        <h3 className={`text-2xl font-bold mb-2 ${isLogic ? 'text-white' : 'text-stone-800'}`}>
                                            Ke nomor mana kami menghubungi?
                                        </h3>
                                        <p className={`text-sm ${isLogic ? 'text-slate-400' : 'text-stone-500'}`}>
                                            Kami akan menghubungi via WhatsApp
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`flex items-center rounded-2xl border-2 overflow-hidden transition-all
                                            ${isLogic
                                                ? 'border-slate-700 focus-within:border-cyan-500 bg-slate-800'
                                                : 'border-stone-200 focus-within:border-rose-500 bg-white'}`}
                                        >
                                            <span className={`px-4 py-4 font-bold ${isLogic ? 'text-cyan-400 bg-slate-800/50' : 'text-rose-500 bg-stone-50'}`}>
                                                +62
                                            </span>
                                            <input
                                                ref={phoneInputRef}
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={handlePhoneChange}
                                                placeholder="812-3456-7890"
                                                maxLength={14}
                                                className={`flex-1 px-4 py-4 outline-none border-none focus:ring-0 focus:outline-none text-lg font-medium
                                                    ${isLogic
                                                        ? 'bg-slate-800 text-white placeholder:text-slate-500'
                                                        : 'bg-white text-stone-800 placeholder:text-stone-400'}`}
                                            />
                                        </div>

                                        {/* Selected Time Display */}
                                        <div className={`flex items-center justify-center gap-2 py-2 rounded-xl ${isLogic ? 'bg-slate-800/50' : 'bg-stone-50'}`}>
                                            {isLogic ? (
                                                React.createElement(timeSlots.find(t => t.id === selectedTime)?.IconComponent || 'span', {
                                                    size: 18,
                                                    className: 'text-cyan-400'
                                                })
                                            ) : (
                                                <span className="text-lg">{timeSlots.find(t => t.id === selectedTime)?.emoji}</span>
                                            )}
                                            <span className={`text-sm ${isLogic ? 'text-slate-400' : 'text-stone-500'}`}>
                                                {timeSlots.find(t => t.id === selectedTime)?.label} ({timeSlots.find(t => t.id === selectedTime)?.time})
                                            </span>
                                            <button
                                                onClick={() => setCallStep(1)}
                                                className={`text-xs underline ml-2 ${isLogic ? 'text-cyan-400' : 'text-rose-500'}`}
                                            >
                                                Ubah
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleCallSubmit}
                                            disabled={!isPhoneValid || isSubmitting}
                                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform flex items-center justify-center gap-3
                                                ${isPhoneValid && !isSubmitting
                                                    ? (isLogic
                                                        ? 'bg-cyan-500 text-slate-950 hover:scale-[1.02] active:scale-95 glow-pulse-cyan'
                                                        : 'bg-rose-500 text-white hover:scale-[1.02] active:scale-95 glow-pulse-rose')
                                                    : (isLogic
                                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                        : 'bg-stone-200 text-stone-400 cursor-not-allowed')
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Jadwalkan Sekarang!</span>
                                                    {isLogic ? (
                                                        <Rocket size={20} className="inline-block" />
                                                    ) : (
                                                        <span className="text-xl">🚀</span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {callStep === 3 && (
                                <div className="step-enter text-center py-8">
                                    {/* Confetti Particles */}
                                    {showConfetti && (
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            {[...Array(12)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="confetti-particle"
                                                    style={{
                                                        left: `${10 + (i * 7)}%`,
                                                        top: '40%',
                                                        backgroundColor: isLogic
                                                            ? ['#22d3ee', '#06b6d4', '#0891b2'][i % 3]
                                                            : ['#f43f5e', '#e11d48', '#fb7185'][i % 3],
                                                        animationDelay: `${i * 0.08}s`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className={`success-icon inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isLogic ? 'bg-cyan-500' : 'bg-rose-500'}`}>
                                        <Check size={40} className="text-white" />
                                    </div>

                                    <h3 className={`text-2xl font-bold mb-2 flex items-center justify-center gap-2 ${isLogic ? 'text-white' : 'text-stone-800'}`}>
                                        Permintaan Terkirim!
                                        {isLogic ? (
                                            <Sparkles size={24} className="text-cyan-400" />
                                        ) : (
                                            <span>🎉</span>
                                        )}
                                    </h3>
                                    <p className={`text-sm mb-6 ${isLogic ? 'text-slate-400' : 'text-stone-500'}`}>
                                        Tim kami akan menghubungi Anda di waktu {timeSlots.find(t => t.id === selectedTime)?.label.toLowerCase()}
                                    </p>

                                    <div className={`p-4 rounded-2xl ${isLogic ? 'bg-slate-800' : 'bg-stone-50'}`}>
                                        <div className="flex flex-row items-center justify-center gap-4">
                                            <div className="text-center sm:text-left">
                                                <p className={`text-xs uppercase tracking-wider whitespace-nowrap ${isLogic ? 'text-slate-500' : 'text-stone-400'}`}>Waktu</p>
                                                <p className={`font-bold text-sm sm:text-base whitespace-nowrap ${isLogic ? 'text-white' : 'text-stone-800'}`}>
                                                    {timeSlots.find(t => t.id === selectedTime)?.time}
                                                </p>
                                            </div>
                                            <div className={`w-px h-10 ${isLogic ? 'bg-slate-700' : 'bg-stone-200'}`} />
                                            <div className="text-center sm:text-left">
                                                <p className={`text-xs uppercase tracking-wider whitespace-nowrap ${isLogic ? 'text-slate-500' : 'text-stone-400'}`}>WhatsApp</p>
                                                <p className={`font-bold text-sm sm:text-base whitespace-nowrap ${isLogic ? 'text-white' : 'text-stone-800'}`}>
                                                    +62 {phoneNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
