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
    const [isComplete, setIsComplete] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Data collection state
    const [collectedData, setCollectedData] = useState({
        nama: '',
        email: '',
        telepon: '',
        kebutuhan: ''
    });

    // Conversation history for API
    const [conversationHistory, setConversationHistory] = useState([]);

    // Required fields
    const requiredFields = ['nama', 'email', 'telepon', 'kebutuhan'];
    const completedFields = requiredFields.filter(field => collectedData[field]);

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

    // System prompt based on mode
    const getSystemPrompt = () => {
        const baseContext = `Kamu adalah asisten virtual BAROD.Y yang bertugas mengumpulkan 4 data penting dari user:
1. Nama lengkap (nama)
2. Email (email)  
3. Nomor Telepon/WhatsApp (telepon)
4. Kebutuhan/masalah yang ingin diselesaikan (kebutuhan)

Data yang sudah terkumpul:
${JSON.stringify(collectedData, null, 2)}

ATURAN PENTING:
- Jika user menjawab sesuatu yang tidak relevan dengan data yang diminta, arahkan kembali dengan sopan untuk memberikan data yang belum lengkap.
- Jika user memberikan informasi yang bisa diekstrak (misalnya "nama saya Budi"), ekstrak dan akui bahwa kamu sudah menerima datanya.
- Hanya tanyakan satu data per respons.
- Jika semua 4 data sudah lengkap, berikan ringkasan data yang terkumpul dan ucapkan terima kasih.

PENTING: Selalu sertakan tag JSON di akhir responsmu untuk mengekstrak data (tidak ditampilkan ke user):
[DATA_EXTRACT]{"nama": "", "email": "", "telepon": "", "kebutuhan": ""}[/DATA_EXTRACT]
Isi field yang berhasil diektrak dari pesan user saat ini. Kosongkan jika tidak ada.`;

        if (isLogic) {
            return `${baseContext}

GAYA BAHASA: 
- Formal, prosedural, dan langsung ke inti masalah
- Gunakan format teknis seperti ">" untuk prompt dan "//" untuk komentar
- Tidak perlu basa-basi, langsung minta data yang diperlukan
- Contoh: "> Input nama lengkap:" atau "// Data tersimpan. > Input email:"`;
        } else {
            return `${baseContext}

GAYA BAHASA:
- Ramah, hangat, dan penuh empati
- Gunakan emoji dengan wajar untuk menambah keakraban
- Tunjukkan apresiasi dan antusiasme terhadap respons user
- Buat percakapan terasa seperti berbicara dengan teman
- Contoh: "Terima kasih sudah berbagi! 😊 Boleh tahu emailmu?" atau "Wah, kebutuhan yang menarik! 💡"`;
        }
    };

    // Call OpenRouter API
    const callOpenRouter = async (userMessage) => {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        const model = import.meta.env.VITE_OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

        // 🔍 DEBUG: Log configuration
        console.group('🔍 OpenRouter API Debug');
        console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 5)}` : 'NOT SET');
        console.log('Model:', model);
        console.log('Referer:', window.location.origin);

        if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
            console.error('❌ OpenRouter API key not configured');
            console.groupEnd();
            return {
                message: isLogic
                    ? '// ERROR: API key tidak dikonfigurasi. Hubungi administrator.'
                    : 'Maaf, ada masalah teknis. Silakan hubungi tim kami langsung ya! 🙏',
                extractedData: {}
            };
        }

        const newHistory = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        const requestBody = {
            model: model,
            messages: [
                { role: 'system', content: getSystemPrompt() },
                ...newHistory
            ],
            temperature: 0.7,
            max_tokens: 500
        };

        console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'BAROD.Y Assistant'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Response Status:', response.status);
            console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                // 🔍 DEBUG: Read error response body
                const errorBody = await response.text();
                console.error('❌ API Error Response Body:', errorBody);
                console.groupEnd();
                throw new Error(`API error: ${response.status} - ${errorBody}`);
            }

            const data = await response.json();
            console.log('✅ API Response Data:', data);
            let assistantMessage = data.choices[0]?.message?.content || '';

            // Extract data from response
            let extractedData = {};
            const dataMatch = assistantMessage.match(/\[DATA_EXTRACT\](.*?)\[\/DATA_EXTRACT\]/s);
            if (dataMatch) {
                try {
                    extractedData = JSON.parse(dataMatch[1]);
                    // Remove the data tag from visible message
                    assistantMessage = assistantMessage.replace(/\[DATA_EXTRACT\].*?\[\/DATA_EXTRACT\]/s, '').trim();
                } catch (e) {
                    console.error('Failed to parse extracted data:', e);
                }
            }

            console.log('📝 Extracted Data:', extractedData);
            console.log('💬 Assistant Message:', assistantMessage);
            console.groupEnd();

            // Update conversation history
            setConversationHistory([
                ...newHistory,
                { role: 'assistant', content: assistantMessage }
            ]);

            return {
                message: assistantMessage,
                extractedData
            };
        } catch (error) {
            console.error('❌ OpenRouter API error:', error);
            console.groupEnd();
            return {
                message: isLogic
                    ? `// ERROR: ${error.message}. Coba lagi.`
                    : `Maaf, ada gangguan sementara. Bisa coba lagi? 🙏`,
                extractedData: {}
            };
        }
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start conversation on mount
    useEffect(() => {
        const startConversation = async () => {
            setIsTyping(true);

            const introMessage = isLogic
                ? "// Initializing data collection protocol...\n> Halo! Saya adalah asisten virtual BAROD.Y. Mari mulai proses pengumpulan data.\n> Input nama lengkap Anda:"
                : "Hai! 👋 Senang bertemu denganmu! Saya di sini untuk membantu memahami kebutuhanmu dengan lebih baik.\n\nBoleh tahu nama lengkapmu? 😊";

            setTimeout(() => {
                setMessages([{
                    type: 'bot',
                    text: introMessage,
                    timestamp: new Date()
                }]);
                setConversationHistory([
                    { role: 'assistant', content: introMessage }
                ]);
                setIsTyping(false);
            }, 1000);
        };

        startConversation();
    }, [isLogic]);

    // Check if all data is complete
    useEffect(() => {
        if (completedFields.length === requiredFields.length && !isComplete) {
            setIsComplete(true);

            // Generate summary
            const summary = isLogic
                ? `// ========== DATA COLLECTION COMPLETE ==========
> Nama: ${collectedData.nama}
> Email: ${collectedData.email}
> Telepon: ${collectedData.telepon}
> Kebutuhan: ${collectedData.kebutuhan}
// =============================================
> Terima kasih. Tim kami akan menghubungi Anda segera.`
                : `Yeay! Semua data sudah lengkap! 🎉

📋 **Ringkasan Data:**
• Nama: ${collectedData.nama}
• Email: ${collectedData.email}
• Telepon: ${collectedData.telepon}
• Kebutuhan: ${collectedData.kebutuhan}

Terima kasih banyak ya! Tim kami akan segera menghubungimu untuk diskusi lebih lanjut. Sampai jumpa! 💕`;

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: summary,
                    timestamp: new Date()
                }]);
            }, 500);
        }
    }, [collectedData, completedFields.length, isComplete, isLogic, requiredFields.length]);

    // Handle user message
    const handleSend = async () => {
        if (!inputValue.trim() || isTyping || isComplete) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        // Get AI response
        setIsTyping(true);
        const { message, extractedData } = await callOpenRouter(userMessage);

        // Update collected data with any extracted info
        if (extractedData && Object.keys(extractedData).length > 0) {
            setCollectedData(prev => {
                const updated = { ...prev };
                Object.keys(extractedData).forEach(key => {
                    if (extractedData[key] && extractedData[key].trim()) {
                        updated[key] = extractedData[key].trim();
                    }
                });
                return updated;
            });
        }

        // Add bot response
        setMessages(prev => [...prev, {
            type: 'bot',
            text: message,
            timestamp: new Date()
        }]);
        setIsTyping(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
