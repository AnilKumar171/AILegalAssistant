import React, { useMemo, useRef, useState, useEffect } from 'react';
import { MessageCircle, Send, X, Scale, Gavel, BookOpen, GraduationCap, Shield, Zap, FileText, Briefcase } from 'lucide-react';
import Markdown from './Markdown';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: `m-${Date.now()}`,
      role: 'assistant',
      content: "Greetings! I am your AI Legal Counsel. How may I assist you with legal matters today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const historyPayload = useMemo(
    () =>
      messages.map(m => ({ role: m.role, content: m.content })).slice(-10),
    [messages]
  );

  // Pulse animation for the button
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for global openChat events (e.g., from Sidebar button)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    // @ts-ignore custom event name
    window.addEventListener('openChat', handler as EventListener);
    return () => {
      // @ts-ignore
      window.removeEventListener('openChat', handler as EventListener);
    };
  }, []);

  const isNearBottom = (): boolean => {
    const el = listRef.current;
    if (!el) return true;
    const threshold = 80;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = () => {
    if (!autoScroll) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      setAutoScroll(isNearBottom());
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: historyPayload }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (_) {
        // ignore JSON parse errors
      }
      if (!res.ok) {
        const serverMsg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(serverMsg);
      }
      const reply = (data?.reply || "I apologize, but I'm currently unable to provide a response. Please try again shortly.").toString();
      
      // Simulate typing effect
      await typewriterEffect(reply);
    } catch (e: any) {
      const errMsg = e?.message ? `I apologize for the inconvenience: ${e.message}` : 'I am currently experiencing technical difficulties. Please try again in a moment.';
      await typewriterEffect(errMsg);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const typewriterEffect = async (text: string) => {
    const messageId = `m-${Date.now()}-a`;
    const tempMessage: ChatMessage = { id: messageId, role: 'assistant', content: '' };
    setMessages(prev => [...prev, tempMessage]);
    
    let displayedText = '';
    for (let i = 0; i < text.length; i++) {
      displayedText += text[i];
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: displayedText } : msg
      ));
      scrollToBottom();
      if (isNearBottom()) {
        scrollToBottom();
      }
      await new Promise(resolve => setTimeout(resolve, 20)); // Typing speed
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    { text: "How to file a civil case?", icon: FileText },
    { text: "What are my tenant rights?", icon: Shield },
    { text: "Draft a legal notice format", icon: Briefcase },
    { text: "Explain contract breach", icon: Gavel }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className={`group relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white rounded-2xl p-5 shadow-2xl hover:shadow-blue-500/40 hover:scale-110 transition-all duration-500 border-2 border-white/20 ${
            isPulsing ? 'animate-pulse ring-4 ring-blue-400 ring-opacity-50' : ''
          }`}
          aria-label="Consult Legal Assistant"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          
          <MessageCircle className="w-7 h-7 animate-bounce" style={{ animationDuration: '2s' }} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-3 right-0 bg-gradient-to-r from-blue-700 to-purple-700 text-white text-sm px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg transform group-hover:-translate-y-1">
            <Zap className="w-4 h-4 inline mr-2 animate-pulse" />
            Free Legal Consultation
            <div className="absolute top-full right-4 border-8 border-transparent border-t-purple-700"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="animate-slide-up w-[440px] max-w-[90vw] h-[640px] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-2 border-white/10 backdrop-blur-xl relative">
          {/* Background Image - Same as Landing Page */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/90 z-10" />
            <img
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2940"
              alt="Legal office"
              className="w-full h-full object-cover"
            />
            
            {/* Floating Legal Symbols Overlay */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-4 text-blue-400/20 animate-float">
                <Scale className="w-12 h-12" />
              </div>
              <div className="absolute top-12 right-6 text-green-400/20 animate-float" style={{ animationDelay: '2s' }}>
                <Gavel className="w-10 h-10" />
              </div>
              <div className="absolute bottom-16 left-8 text-purple-400/20 animate-float" style={{ animationDelay: '4s' }}>
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="absolute bottom-8 right-12 text-yellow-400/20 animate-float" style={{ animationDelay: '1s' }}>
                <Shield className="w-9 h-9" />
              </div>
              <div className="absolute top-1/3 left-1/4 text-cyan-400/20 animate-float" style={{ animationDelay: '3s' }}>
                <FileText className="w-7 h-7" />
              </div>
              <div className="absolute bottom-1/4 right-1/4 text-orange-400/20 animate-float" style={{ animationDelay: '5s' }}>
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white px-6 py-4 border-b border-white/10 backdrop-blur-sm z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg flex items-center gap-2">
                    LegalAI Counsel
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 animate-pulse">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-blue-200 text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Certified AI Legal Assistant
                  </div>
                </div>
              </div>
              <button
                className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300 hover:rotate-90"
                aria-label="Close consultation"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={listRef} className="flex-1 overflow-auto px-5 py-4 space-y-4 bg-transparent relative z-20">
            {messages.map((m, index) => (
              <div 
                key={m.id} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap break-words shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-105 border ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none border-blue-400/30' 
                      : 'bg-white/10 text-white border-white/20 rounded-bl-none'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                      <div className="p-1 bg-white/20 rounded-lg">
                        <GraduationCap className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-blue-200">Legal Counsel</span>
                    </div>
                  )}
                  {m.role === 'assistant' ? (
                    <Markdown content={m.content} variant="dark" />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white/10 border border-white/20 rounded-bl-none shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Analyzing legally...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-5 pb-3 relative z-20">
              <div className="text-xs text-blue-300 font-medium mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3 animate-pulse" />
                QUICK LEGAL INQUIRIES
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map(({ text, icon: Icon }, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(text);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="text-left p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-sm flex items-center gap-2 group"
                  >
                    <Icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm relative z-20">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Describe your legal matter or ask a question..."
                  className="w-full border border-white/20 bg-white/5 text-white rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-white/40 backdrop-blur-sm transition-all duration-300"
                />
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-30 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none hover:scale-105 disabled:hover:scale-100 backdrop-blur-sm"
              >
                <Send className="w-4 h-4" />
                <span className="font-medium">Send</span>
              </button>
            </div>
            <div className="text-xs text-white/60 mt-2 text-center flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              All consultations are confidential and secure
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100px) scale(0.8); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes message-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-message-in {
          animation: message-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}