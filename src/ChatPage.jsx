import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Send,
    ArrowLeft,
    Terminal,
    Heart,
    Bot,
    User,
    CheckCircle,
    Loader2
} from 'lucide-react';

const ChatPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const themeParam = searchParams.get('theme') || 'logic';
    const [mode] = useState(themeParam);

    const isLogic = mode === 'logic';

    // Chat state
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Data collection state
    const [collectedData, setCollectedData] = useState({
        nama: '',
        email: '',
        telepon: '',
        kebutuhan: ''
    });

    // Required fields
    const requiredFields = ['nama', 'email', 'telepon', 'kebutuhan'];
    const completedFields = requiredFields.filter(field => collectedData[field]);

    // Bot questions flow
    const botQuestions = [
        {
            field: null,
            message: isLogic
                ? "// Initializing data collection protocol...\n> Halo! Saya adalah asisten virtual BAROD.Y. Mari kita mulai proses pengumpulan data untuk solusi teknis Anda."
                : "Hai! 👋 Senang bertemu denganmu! Saya di sini untuk membantu memahami kebutuhanmu dengan lebih baik. Yuk ceritakan sedikit tentang dirimu!"
        },
        {
            field: 'nama',
            message: isLogic
                ? "> Masukkan nama lengkap Anda untuk registrasi sistem:"
                : "Boleh tahu nama lengkapmu? 😊"
        },
        {
            field: 'email',
            message: isLogic
                ? "> Input email address untuk komunikasi dan notifikasi:"
                : "Terima kasih! Sekarang, bisa share email-mu? Ini untuk memudahkan kami menghubungimu nanti 📧"
        },
        {
            field: 'telepon',
            message: isLogic
                ? "> Masukkan nomor telepon (format: +62xxx):"
                : "Perfect! Nomor telepon/WhatsApp yang bisa dihubungi? 📱"
        },
        {
            field: 'kebutuhan',
            message: isLogic
                ? "> Jelaskan kebutuhan proyek atau permasalahan teknis yang ingin diselesaikan:"
                : "Nah, sekarang bagian serunya! Ceritakan dong, apa yang bisa kami bantu? Mau bikin website, aplikasi, atau ada masalah yang ingin dipecahkan? 💡"
        },
        {
            field: null,
            message: isLogic
                ? "✓ Data collection complete. Processing...\n> Terima kasih! Data Anda telah tercatat dalam sistem. Tim kami akan segera menghubungi Anda untuk konsultasi lanjutan."
                : "Yeay! Semua sudah lengkap! 🎉 Terima kasih banyak ya! Tim kami akan segera menghubungimu untuk diskusi lebih lanjut. Sampai jumpa! 💕"
        }
    ];

    // Theme styles
    const theme = {
        bg: isLogic ? 'bg-slate-950' : 'bg-stone-50',
        text: isLogic ? 'text-slate-200' : 'text-stone-800',
        accent: isLogic ? 'text-cyan-400' : 'text-rose-500',
        accentBg: isLogic ? 'bg-cyan-500' : 'bg-rose-500',
        border: isLogic ? 'border-slate-800' : 'border-stone-200',
        card: isLogic ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-stone-200',
        cardHover: isLogic ? 'hover:border-cyan-500/50' : 'hover:border-rose-500/50',
        font: isLogic ? 'font-mono' : 'font-sans',
        inputBg: isLogic ? 'bg-slate-900' : 'bg-white',
        botBubble: isLogic
            ? 'bg-slate-800 border-slate-700 text-slate-200'
            : 'bg-stone-100 border-stone-200 text-stone-800',
        userBubble: isLogic
            ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100'
            : 'bg-rose-500/20 border-rose-500/30 text-rose-900',
        scrollbar: isLogic ? 'scrollbar-cyan' : 'scrollbar-rose'
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start conversation on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setMessages([{
                    type: 'bot',
                    text: botQuestions[0].message,
                    timestamp: new Date()
                }]);
                setIsTyping(false);
                setCurrentStep(1);

                // Ask first question after intro
                setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            type: 'bot',
                            text: botQuestions[1].message,
                            timestamp: new Date()
                        }]);
                        setIsTyping(false);
                    }, 1000);
                }, 500);
            }, 1500);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Handle user message
    const handleSend = () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        // Save data based on current step
        const currentQuestion = botQuestions[currentStep];
        if (currentQuestion?.field) {
            setCollectedData(prev => ({
                ...prev,
                [currentQuestion.field]: userMessage
            }));
        }

        // Move to next step
        const nextStep = currentStep + 1;
        if (nextStep < botQuestions.length) {
            setCurrentStep(nextStep);

            // Bot response
            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        text: botQuestions[nextStep].message,
                        timestamp: new Date()
                    }]);
                    setIsTyping(false);
                }, 1200);
            }, 500);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isComplete = currentStep >= botQuestions.length - 1 && completedFields.length === requiredFields.length;

    return (
        <div className={`min-h-screen flex flex-col chat-page-enter ${theme.bg} ${theme.text} ${theme.font}`} data-theme={mode}>
            {/* Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${theme.border} ${isLogic ? 'bg-slate-950/90' : 'bg-white/90'}`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/?theme=${mode}`)}
                                className={`p-2 rounded-lg transition-all hover:scale-105 ${isLogic ? 'hover:bg-slate-800 text-cyan-400' : 'hover:bg-stone-100 text-rose-500'}`}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLogic ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {isLogic ? <Terminal size={20} /> : <Heart size={20} />}
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg">BAROD.Y Assistant</h1>
                                    <p className={`text-xs ${theme.accent} flex items-center gap-1.5`}>
                                        {isLogic ? '// Online | Ready to process' : (
                                            <>
                                                <span className="online-dot"></span>
                                                Online | Siap membantu!
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="hidden sm:flex items-center gap-2">
                            <span className={`text-xs opacity-60`}>Progress:</span>
                            <div className="flex gap-1">
                                {requiredFields.map((field, idx) => (
                                    <div
                                        key={field}
                                        className={`w-3 h-3 rounded-full transition-all ${collectedData[field]
                                            ? (isLogic ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]')
                                            : 'bg-slate-600/30'
                                            }`}
                                    />
                                ))}
                            </div>
                            {isComplete && (
                                <CheckCircle size={18} className={theme.accent} />
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="container mx-auto max-w-3xl space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user'
                                    ? (isLogic ? 'bg-cyan-500/30 text-cyan-300' : 'bg-rose-500/30 text-rose-600')
                                    : (isLogic ? 'bg-slate-700 text-cyan-400' : 'bg-stone-200 text-rose-500')
                                    }`}>
                                    {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`px-4 py-3 rounded-2xl border whitespace-pre-wrap ${msg.type === 'user' ? theme.userBubble : theme.botBubble
                                    } ${msg.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                    <p className={`text-sm md:text-base leading-relaxed ${isLogic && msg.type === 'bot' ? 'font-mono' : ''}`}>
                                        {msg.text}
                                    </p>
                                    <span className={`text-[10px] opacity-40 mt-1 block ${msg.type === 'user' ? 'text-right' : ''}`}>
                                        {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isLogic ? 'bg-slate-700 text-cyan-400' : 'bg-stone-200 text-rose-500'
                                    }`}>
                                    <Bot size={16} />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm border ${theme.botBubble}`}>
                                    <div className="flex gap-1.5">
                                        <span className={`typing-dot w-2 h-2 rounded-full ${isLogic ? 'bg-cyan-400' : 'bg-rose-500'}`} style={{ animationDelay: '0ms' }}></span>
                                        <span className={`typing-dot w-2 h-2 rounded-full ${isLogic ? 'bg-cyan-400' : 'bg-rose-500'}`} style={{ animationDelay: '150ms' }}></span>
                                        <span className={`typing-dot w-2 h-2 rounded-full ${isLogic ? 'bg-cyan-400' : 'bg-rose-500'}`} style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className={`sticky bottom-0 border-t ${theme.border} ${isLogic ? 'bg-slate-950/95' : 'bg-white/95'} backdrop-blur-md`}>
                <div className="container mx-auto max-w-3xl px-4 py-4">
                    {!isComplete ? (
                        <div className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isLogic ? "> Enter your response..." : "Ketik pesanmu di sini..."}
                                disabled={isTyping}
                                className={`flex-1 px-4 py-3 rounded-xl border ${theme.border} ${theme.inputBg} ${theme.text}
                                    placeholder:opacity-40 focus:outline-none focus:ring-2 
                                    ${isLogic ? 'focus:ring-cyan-500/50' : 'focus:ring-rose-500/50'}
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className={`px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95
                                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                                    ${isLogic
                                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                                        : 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                    }`}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className={`text-center py-4 rounded-xl border ${theme.card} ${theme.border}`}>
                            <CheckCircle className={`mx-auto mb-2 ${theme.accent}`} size={32} />
                            <p className="font-bold">
                                {isLogic ? '// Session Complete' : 'Percakapan Selesai! 🎉'}
                            </p>
                            <p className="text-sm opacity-60 mt-1">
                                {isLogic ? 'Data telah tercatat dalam sistem.' : 'Terima kasih sudah berbagi!'}
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className={`mt-4 px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 ${theme.accentBg} text-white`}
                            >
                                {isLogic ? 'Return to Main' : 'Kembali ke Beranda'}
                            </button>
                        </div>
                    )}

                    {/* Mobile Progress */}
                    <div className="sm:hidden flex items-center justify-center gap-2 mt-3">
                        <span className={`text-xs opacity-60`}>Progress:</span>
                        <div className="flex gap-1">
                            {requiredFields.map((field) => (
                                <div
                                    key={field}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${collectedData[field]
                                        ? (isLogic ? 'bg-cyan-400' : 'bg-rose-500')
                                        : 'bg-slate-600/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ChatPage;
