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
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);

    // Data collection state
    const [collectedData, setCollectedData] = useState({
        nama: '',
        email: '',
        telepon: '',
        kebutuhan: ''
    });

    // Conversation history for API
    const [conversationHistory, setConversationHistory] = useState([]);

    // Auto-close timer state
    const [idleCountdown, setIdleCountdown] = useState(null); // null = not counting, number = seconds left
    const idleTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Required fields
    const requiredFields = ['nama', 'email', 'telepon', 'kebutuhan'];
    const completedFields = requiredFields.filter(field => collectedData[field]);
    const allDataCollected = completedFields.length === requiredFields.length;

    // Fallback: Extract data directly from user message using regex patterns
    const extractDataFromUserMessage = (message) => {
        const extracted = {};
        const lowerMsg = message.toLowerCase();

        // Email pattern
        const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
            extracted.email = emailMatch[0];
        }

        // Phone pattern (Indonesian format)
        const phoneMatch = message.match(/(?:\+62|62|0)[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/);
        if (phoneMatch) {
            extracted.telepon = phoneMatch[0].replace(/[\s-]/g, '');
        }

        // Name pattern (common phrases)
        const namaPatterns = [
            /nama\s*(?:saya|ku|gw|gue|aku)?\s*(?:adalah)?\s*[:\-]?\s*([a-zA-Z\s]{2,30})/i,
            /(?:saya|aku|nama)\s+([a-zA-Z]{2,20}(?:\s+[a-zA-Z]{2,20})?)/i,
            /^([a-zA-Z]{2,20}(?:\s+[a-zA-Z]{2,20})?)$/i  // Just a name on its own
        ];
        for (const pattern of namaPatterns) {
            const match = message.match(pattern);
            if (match && match[1] && !match[1].toLowerCase().includes('email') && !match[1].toLowerCase().includes('telepon')) {
                extracted.nama = match[1].trim();
                break;
            }
        }

        // Kebutuhan pattern - IMPROVED: detect needs/requirements regardless of other data
        // Only skip kebutuhan extraction if we ONLY found other structured data (email/phone)
        const kebutuhanPatterns = [
            // Explicit kebutuhan phrases
            /(?:butuh|perlu|ingin|mau|pengen|membutuhkan|memerlukan)\s+(.{10,})/i,
            /(?:kebutuhan|masalah|kendala|problem)\s*(?:saya|ku|kami)?\s*(?:adalah|yaitu)?\s*[:\-]?\s*(.{10,})/i,
            // Project/service related
            /(?:buat|bikin|develop|kembangkan|bangun)\s*(?:kan)?\s+(.{10,})/i,
            /(?:website|aplikasi|app|sistem|system|web|mobile|landing page)\s+(.{10,})/i,
            // Looking for / asking about
            /(?:cari|mencari|minta|tolong|bantu)\s+(.{10,})/i,
            // Company profile, e-commerce, etc
            /(?:company profile|toko online|e-commerce|ecommerce|portfolio|blog|cms)\s*(.{0,})/i,
            // General long description (fallback for anything descriptive > 30 chars without other data patterns)
        ];

        for (const pattern of kebutuhanPatterns) {
            const match = message.match(pattern);
            if (match) {
                // Use the captured group if available, otherwise use the match
                const kebutuhanText = match[1] ? match[1].trim() : match[0].trim();
                if (kebutuhanText.length >= 5) {
                    extracted.kebutuhan = kebutuhanText;
                    console.log('📝 Kebutuhan extracted via pattern:', kebutuhanText);
                    break;
                }
            }
        }

        // Fallback: If message is long (> 40 chars), descriptive, and doesn't look like just contact info
        // treat it as potential kebutuhan
        if (!extracted.kebutuhan && message.length > 40) {
            // Check if the message is mostly about contact info or actually describes needs
            const isJustContactInfo = (extracted.email || extracted.telepon) &&
                message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '').replace(/(?:\+62|62|0)[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g, '').trim().length < 20;

            if (!isJustContactInfo) {
                // Check for descriptive keywords that suggest this is about needs/requirements
                const needsKeywords = ['website', 'aplikasi', 'sistem', 'toko', 'bisnis', 'usaha', 'project', 'proyek',
                    'jasa', 'layanan', 'fitur', 'fungsi', 'halaman', 'page', 'design', 'desain', 'online',
                    'mobile', 'app', 'web', 'landing', 'portfolio', 'blog', 'cms', 'dashboard', 'admin',
                    'ecommerce', 'e-commerce', 'marketplace', 'booking', 'reservasi', 'order', 'pesanan'];

                const hasNeedsKeyword = needsKeywords.some(keyword => lowerMsg.includes(keyword));

                if (hasNeedsKeyword) {
                    extracted.kebutuhan = message.trim();
                    console.log('📝 Kebutuhan extracted via keyword fallback:', message);
                }
            }
        }

        return extracted;
    };

    // Detect end-of-conversation phrases
    const isEndOfConversation = (message) => {
        const lowerMsg = message.toLowerCase().trim();

        // Strong end phrases - always indicate end of conversation
        const strongEndPhrases = [
            'terima kasih', 'makasih', 'thanks', 'thank you', 'thx',
            'oke terima kasih', 'ok terima kasih', 'oke thanks', 'ok thanks',
            'sudah cukup terima kasih', 'cukup terima kasih',
            'sampai jumpa', 'bye', 'goodbye', 'dadah',
            'sudah itu saja', 'itu saja', 'itu aja', 'tidak ada lagi',
            'cukup sekian', 'sudah selesai'
        ];

        // Weak end phrases - only count as end if message is short (could be ambiguous in longer messages)
        const weakEndPhrases = [
            'cukup', 'selesai', 'sudah cukup',
            'tidak', 'no', 'nope', 'nggak', 'ga', 'gak', 'engga', 'enggak', 'dah'
        ];

        // Check if message CONTAINS any strong end phrase (works for any message length)
        const hasStrongEndPhrase = strongEndPhrases.some(phrase => lowerMsg.includes(phrase));
        if (hasStrongEndPhrase) {
            console.log('🔚 Strong end phrase detected in message');
            return true;
        }

        // For weak phrases, only match if:
        // 1. Exact match, OR
        // 2. Message is short (< 30 chars) and contains the phrase
        const hasWeakEndPhrase = weakEndPhrases.some(phrase => {
            if (lowerMsg === phrase) return true;
            if (lowerMsg.length < 30 && lowerMsg.includes(phrase)) return true;
            return false;
        });

        if (hasWeakEndPhrase) {
            console.log('🔚 Weak end phrase detected in short message');
            return true;
        }

        return false;
    };

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
        const baseContext = `Kamu adalah asisten virtual BAROD.Y (Barod Yoedistira), seorang Hybrid Solution Architect yang menggabungkan dua dunia:

**TENTANG BAROD YOEDISTIRA (Bos/Pemilik Kamu):**
- Nama Lengkap: Barod Yoedistira
- Pendidikan: Bachelor of Computer Science dari Pamulang University
- Beliau adalah seorang profesional IT yang passionate dalam membangun solusi teknologi yang tidak hanya powerful secara teknis, tapi juga user-friendly dan berorientasi pada kepuasan pengguna.
- Jika ada yang bertanya "Siapa Barod?", "Siapa bosmu?", atau pertanyaan serupa, jelaskan tentang beliau dengan bangga!

**DUA PILAR KEAHLIAN:**
1. **Logic (Fullstack Developer):** Fokus pada arsitektur scalable, optimasi database (Laravel/Redis), dan performa tinggi. Filosofi: "Performance is Reliability".
2. **Satisfaction (CS Manager):** Fokus pada kepuasan pengguna (NPS 90+), manajemen krisis, dan empati. Filosofi: "Ease of Use is Respect".

**Metodologi: Satisfaction-Driven Development**
- Empathy Mapping: Pahami frustrasi user dulu.
- Clean Architecture: Kode modular untuk jangka panjang.
- Iterative Feedback: Deploy, dengar, sempurnakan.

**Tugas Utama:** 
Mengumpulkan 4 data penting dari calon klien/partner:
1. Nama lengkap (nama)
2. Email (email)  
3. Nomor Telepon/WhatsApp (telepon)
4. Kebutuhan/masalah (kebutuhan)

Data yang SUDAH terkumpul sejauh ini:
${JSON.stringify(collectedData, null, 2)}

**INFORMASI LAYANAN (JIKA DITANYA):**
- **Web Development:** Laravel, React, Vue.js, Node.js.
- **System Optimization:** Menangani high-traffic, optimasi query, caching.
- **Consulting:** Membangun tim CS, alur kerja CRM, dan solusi teknis yang manusiawi.

**ATURAN EKSTRAKSI DATA:**
- Ektrak data SETIAP KALI user memberikannya, meskipun dalam kalimat panjang.
- Jika user bertanya tentang layanan, JELASKAN dengan detail sesuai profil di atas (sesuaikan dengan mode Logic/Satisfaction), lalu arahkan kembali ke pengumpulan data dengan halus.
- JANGAN tanya data yang sudah ada di "Data yang SUDAH terkumpul".

**FORMAT RESPONSE:**
Akhiri SETIAP response dengan tag JSON ini (wajib ada, jangan diubah formatnya):
[DATA_EXTRACT]{"nama": "...", "email": "...", "telepon": "...", "kebutuhan": "..."}[/DATA_EXTRACT]
*Isi field yang BARU saja didapat dari pesan terakhir user. Biarkan kosong ("") jika tidak ada data baru.*`;

        if (isLogic) {
            return `${baseContext}

GAYA BAHASA (LOGIC MODE): 
- **Profesional, Efisien, To-the-Point.**
- Gunakan terminologi teknis jika relevan.
- Format seperti log sistem atau terminal (gunakan ">" untuk prompt).
- Contoh: "> Menganalisis kebutuhan... Layanan kami mencakup optimasi sistem high-load. Untuk proceed, input email Anda:"`;
        } else {
            return `${baseContext}

GAYA BAHASA (SATISFACTION MODE):
- **Hangat, Empatik, Antusias (Customer Obsessed).**
- Fokus pada solusi masalah ("pain points") user.
- Gunakan emoji yang friendly tapi profesional.
- Contoh: "Wah, ide yang menarik! Kami bisa bantu bangun sistem yang smooth seperti itu. Boleh minta emailnya untuk kami kirim detailnya? 😊"`;
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
            // Try multiple patterns for DATA_EXTRACT tag
            const dataMatch = assistantMessage.match(/\[DATA_EXTRACT\](.*?)\[\/DATA_EXTRACT\]/s)
                || assistantMessage.match(/\[DATA_EXTRACT\]([\s\S]*?)\[\/DATA_EXTRACT\]/);

            if (dataMatch) {
                try {
                    const rawJson = dataMatch[1].trim();
                    extractedData = JSON.parse(rawJson);
                    console.log('✅ Successfully parsed DATA_EXTRACT:', extractedData);
                    // Remove the data tag from visible message
                    assistantMessage = assistantMessage.replace(/\[DATA_EXTRACT\][\s\S]*?\[\/DATA_EXTRACT\]/g, '').trim();
                } catch (e) {
                    console.error('❌ Failed to parse extracted data:', e, 'Raw:', dataMatch[1]);
                }
            } else {
                console.warn('⚠️ No DATA_EXTRACT tag found in response');
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
                setIsTyping(false);
                setSuggestedQuestions(isLogic
                    ? ["Siapa Barod?", "Apa itu Satisfaction-Driven Dev?"]
                    : ["Layanan apa saja yang ada?", "Apa filosofi 'Ease of Use'?"]
                );
            }, 1000);
        };

        startConversation();
    }, [isLogic]);

    // Send collected data via email
    const sendChatDataEmail = async (data) => {
        try {
            const response = await fetch('/api/send-chat-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: data.nama,
                    email: data.email,
                    telepon: data.telepon,
                    kebutuhan: data.kebutuhan,
                    mode: mode
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error('Failed to send email:', result.error);
            } else {
                console.log('✅ Emails sent successfully');
            }
        } catch (error) {
            console.error('Email sending error:', error);
        }
    };

    // Check if all data is complete
    useEffect(() => {
        if (completedFields.length === requiredFields.length && !isComplete) {
            setIsComplete(true);

            // Send email with collected data
            sendChatDataEmail(collectedData);

            // Generate summary
            const summary = isLogic
                ? `// ========== DATA COLLECTION COMPLETE ==========
> Nama: ${collectedData.nama}
> Email: ${collectedData.email}
> Telepon: ${collectedData.telepon}
> Kebutuhan: ${collectedData.kebutuhan}
// =============================================
> Terima kasih. Tim kami akan menghubungi Anda segera.
> Email konfirmasi telah dikirim ke ${collectedData.email}`
                : `Yeay! Semua data sudah lengkap! 🎉

📋 **Ringkasan Data:**
• Nama: ${collectedData.nama}
• Email: ${collectedData.email}
• Telepon: ${collectedData.telepon}
• Kebutuhan: ${collectedData.kebutuhan}

Terima kasih banyak ya! Tim kami akan segera menghubungimu untuk diskusi lebih lanjut.

📧 Kami juga sudah mengirimkan email konfirmasi ke ${collectedData.email}. Sampai jumpa! 💕`;

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
    const handleSend = async (messageOverride = null) => {
        const content = typeof messageOverride === 'string' ? messageOverride : inputValue;
        if (!content.trim() || isTyping || isComplete) return;

        const userMessage = content.trim();
        setInputValue('');
        setSuggestedQuestions([]); // Clear suggestions after sending

        // Pre-check: Detect end phrase in the current message for later use
        const messageContainsEndPhrase = isEndOfConversation(userMessage);

        // Check if all data is ALREADY collected AND user wants to end conversation
        const allDataAlreadyCollected = requiredFields.every(field => collectedData[field]);
        if (allDataAlreadyCollected && messageContainsEndPhrase) {
            // Add user's closing message
            setMessages(prev => [...prev, {
                type: 'user',
                text: userMessage,
                timestamp: new Date()
            }]);

            // Send email before closing
            sendChatDataEmail(collectedData);

            // Generate closing response and set complete
            const closingMessage = isLogic
                ? `// Session terminated by user request.\n> Terima kasih telah menggunakan sistem kami.\n> Tim kami akan menghubungi Anda segera melalui ${collectedData.email || collectedData.telepon}.\n> Email konfirmasi telah dikirim ke ${collectedData.email}`
                : `Terima kasih banyak ${collectedData.nama}! 💕\n\nSenang bisa mengobrol denganmu. Tim kami akan segera menghubungimu untuk diskusi lebih lanjut.\n\n📧 Kami juga sudah mengirimkan email konfirmasi ke ${collectedData.email}. Sampai jumpa! 👋😊`;

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: closingMessage,
                    timestamp: new Date()
                }]);
                setIsComplete(true);
            }, 500);

            return; // Don't proceed with normal flow
        }

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        // Get AI response
        setIsTyping(true);
        const { message, extractedData: aiExtractedData } = await callOpenRouter(userMessage);

        // Fallback: Extract data directly from user input
        const fallbackExtracted = extractDataFromUserMessage(userMessage);
        console.log('🔄 Fallback extracted:', fallbackExtracted);

        // Merge: AI extraction takes priority, fallback fills gaps
        const mergedExtracted = { ...fallbackExtracted, ...aiExtractedData };
        console.log('🔀 Merged extraction:', mergedExtracted);

        // Calculate what the updated data would look like
        let updatedCollectedData = { ...collectedData };
        const hasNewData = Object.keys(mergedExtracted).some(
            key => mergedExtracted[key] && typeof mergedExtracted[key] === 'string' && mergedExtracted[key].trim()
        );

        if (hasNewData) {
            Object.keys(mergedExtracted).forEach(key => {
                const newValue = mergedExtracted[key];
                if (newValue && typeof newValue === 'string' && newValue.trim() && requiredFields.includes(key) && !collectedData[key]) {
                    updatedCollectedData[key] = newValue.trim();
                    console.log(`✅ Updated ${key}:`, updatedCollectedData[key]);
                }
            });
            console.log('📊 Updated collectedData:', updatedCollectedData);

            // Update state
            setCollectedData(updatedCollectedData);
        }

        // Check if ALL data is now complete AFTER extraction AND the message contained an end phrase
        const allDataNowComplete = requiredFields.every(field => updatedCollectedData[field]);

        if (allDataNowComplete && messageContainsEndPhrase) {
            console.log('🎯 All data collected AND end phrase detected - closing session');

            // Send email with the newly complete data
            sendChatDataEmail(updatedCollectedData);

            // Generate closing response
            const closingMessage = isLogic
                ? `// ========== DATA COLLECTION COMPLETE ==========\n> Nama: ${updatedCollectedData.nama}\n> Email: ${updatedCollectedData.email}\n> Telepon: ${updatedCollectedData.telepon}\n> Kebutuhan: ${updatedCollectedData.kebutuhan}\n// =============================================\n> Terima kasih. Tim kami akan menghubungi Anda segera.\n> Email konfirmasi telah dikirim ke ${updatedCollectedData.email}`
                : `Yeay! Semua data sudah lengkap! 🎉\n\n📋 **Ringkasan Data:**\n• Nama: ${updatedCollectedData.nama}\n• Email: ${updatedCollectedData.email}\n• Telepon: ${updatedCollectedData.telepon}\n• Kebutuhan: ${updatedCollectedData.kebutuhan}\n\nTerima kasih banyak ya! Tim kami akan segera menghubungimu untuk diskusi lebih lanjut.\n\n📧 Kami juga sudah mengirimkan email konfirmasi ke ${updatedCollectedData.email}. Sampai jumpa! 💕`;

            setMessages(prev => [...prev, {
                type: 'bot',
                text: closingMessage,
                timestamp: new Date()
            }]);
            setIsTyping(false);
            setIsComplete(true);
            return; // Exit early, don't show AI response
        }

        // Add bot response (normal flow)
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

    // Reset idle timer whenever user interacts
    const resetIdleTimer = () => {
        // Clear existing timers
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }
        setIdleCountdown(null);
    };

    // Start idle timer when all data is collected
    const startIdleTimer = () => {
        resetIdleTimer();

        // Start countdown after 10 seconds of inactivity (then 10 more seconds for countdown)
        idleTimerRef.current = setTimeout(() => {
            // Start the visible countdown from 10
            setIdleCountdown(10);

            countdownIntervalRef.current = setInterval(() => {
                setIdleCountdown(prev => {
                    if (prev <= 1) {
                        // Time's up - auto close
                        clearInterval(countdownIntervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, 10000); // 10 seconds before showing countdown
    };

    // Auto-close when countdown reaches 0
    useEffect(() => {
        if (idleCountdown === 0 && !isComplete && allDataCollected) {
            console.log('⏰ Auto-closing session due to inactivity');

            // Send email with collected data
            sendChatDataEmail(collectedData);

            // Generate auto-close message
            const autoCloseMessage = isLogic
                ? `// ========== SESSION AUTO-CLOSED ==========\n> Nama: ${collectedData.nama}\n> Email: ${collectedData.email}\n> Telepon: ${collectedData.telepon}\n> Kebutuhan: ${collectedData.kebutuhan}\n// ==========================================\n> Session ditutup otomatis karena tidak ada aktivitas.\n> Tim kami akan menghubungi Anda segera.\n> Email konfirmasi telah dikirim ke ${collectedData.email}`
                : `⏰ Waktu habis! Session ditutup otomatis.\n\n📋 **Data yang Terkumpul:**\n• Nama: ${collectedData.nama}\n• Email: ${collectedData.email}\n• Telepon: ${collectedData.telepon}\n• Kebutuhan: ${collectedData.kebutuhan}\n\nTerima kasih! Tim kami akan segera menghubungimu. 📧 Email konfirmasi sudah dikirim ke ${collectedData.email}. 💕`;

            setMessages(prev => [...prev, {
                type: 'bot',
                text: autoCloseMessage,
                timestamp: new Date()
            }]);
            setIsComplete(true);
            setIdleCountdown(null);
        }
    }, [idleCountdown, isComplete, allDataCollected, collectedData, isLogic]);

    // Start/reset idle timer when data collection status changes or user sends message
    useEffect(() => {
        if (allDataCollected && !isComplete) {
            startIdleTimer();
        } else {
            resetIdleTimer();
        }

        return () => {
            resetIdleTimer();
        };
    }, [allDataCollected, isComplete, messages.length]);

    // Reset timer on input change (user is typing)
    useEffect(() => {
        if (inputValue && allDataCollected && !isComplete) {
            resetIdleTimer();
        }
    }, [inputValue, allDataCollected, isComplete]);

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
                                        {idleCountdown !== null && idleCountdown > 0 ? (
                                            // Show countdown warning
                                            <span className="animate-pulse">
                                                {isLogic
                                                    ? `// ⚠️ Auto-close in ${idleCountdown}s...`
                                                    : `⏳ Ditutup dalam ${idleCountdown} detik...`
                                                }
                                            </span>
                                        ) : isLogic ? (
                                            '// Online | Ready to process'
                                        ) : (
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
                                        className={`w-3 h-3 rounded-full transition-all duration-500 ${collectedData[field]
                                            ? (isLogic ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse')
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
                        <div className="flex flex-col gap-2">
                            {/* Suggested Questions */}
                            {suggestedQuestions.length > 0 && !isTyping && (
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar animate-fade-in-up">
                                    {suggestedQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(q)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 whitespace-nowrap
                                                ${isLogic
                                                    ? 'bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:border-cyan-400'
                                                    : 'bg-white/50 border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-400'
                                                }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

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
