import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquareCode, X, Send, Sparkles, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '### Welcome to Nexora AI!\nI am your personalized campus assistant. Ask me questions about your class timetables, upcoming events, academic grades, assignment deadlines, bus routes, or teachers. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { label: '📅 Tomorrow\'s Classes', query: 'What classes do I have tomorrow?' },
    { label: '📝 Deadlines', query: 'What deadlines do I have?' },
    { label: '🏫 AI Lab Location', query: 'Where is the AI Lab?' },
    { label: '🚌 Bus Routes', query: 'What bus should I take?' },
    { label: '👨‍🏫 Database Faculty', query: 'Who teaches Database Management?' }
  ];

  // Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = text;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { prompt: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: '### System Alert\nI encountered an error connecting to the campus core AI server. Please verify your connection or try again shortly.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Simple regex parser for titles, bold, and list bullets to render in Tailwind
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      // H3 Title
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-sm text-warm-white mt-3 mb-1.5">{trimmed.substring(4)}</h4>;
      }
      // Bullet items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-[11px] leading-relaxed text-warm-secondary my-0.5">{trimmed.substring(2)}</li>;
      }
      // Ordered items
      if (/^\d+\.\s/.test(trimmed)) {
        return <li key={idx} className="ml-4 list-decimal text-[11px] leading-relaxed text-warm-secondary my-0.5">{trimmed.substring(trimmed.indexOf(' ') + 1)}</li>;
      }
      // Skip empty lines
      if (!trimmed) return <div key={idx} className="h-2"></div>;

      // Bold text tags replacement
      let parts = trimmed.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-[11px] leading-relaxed text-warm-secondary my-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="text-warm-white font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* 1. CHAT WINDOW PANEL */}
      {isOpen && (
        <div className="w-[380px] h-[520px] bg-midnight-light border border-surface-accent/20 rounded-xl shadow-ai-glow backdrop-blur-xl flex flex-col mb-4 overflow-hidden animate-float-in">
          {/* Panel Header */}
          <div className="p-4 border-b border-surface-accent/15 bg-surface-primary/30 flex justify-between items-center relative">
            <div className="absolute inset-0 bg-radial-gradient ai-glow-glow opacity-30 pointer-events-none"></div>
            <div className="flex items-center gap-2 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-warm-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" /> Nexora Gemini AI
                </h3>
                <p className="text-[9px] text-surface-accent font-medium">Context-Aware Campus Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-surface-primary/40 text-surface-accent hover:text-warm-white transition-colors z-10"
              aria-label="Close assistant panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs ${
                    msg.role === 'user'
                      ? 'bg-surface-primary border border-surface-accent/25 text-warm-white rounded-br-none'
                      : 'bg-midnight border border-surface-accent/10 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-[11px] leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>{formatMarkdown(msg.content)}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-midnight border border-surface-accent/10 rounded-lg rounded-bl-none p-3 flex items-center gap-2">
                  <Loader className="w-3 h-3 text-accent animate-spin" />
                  <span className="text-[10px] text-surface-accent uppercase tracking-widest animate-pulse">Thinking</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1 h-1 bg-accent rounded-full dot-blink"></span>
                    <span className="w-1 h-1 bg-accent rounded-full dot-blink"></span>
                    <span className="w-1 h-1 bg-accent rounded-full dot-blink"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-midnight/35 border-t border-surface-accent/5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.query)}
                  className="text-[9px] font-semibold text-surface-accent hover:text-accent border border-surface-accent/15 hover:border-accent bg-surface-primary/20 px-2 py-1 rounded transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-surface-accent/15 bg-surface-primary/10 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about schedules, grades, buses..."
              className="flex-1 bg-midnight border border-surface-accent/20 rounded-md px-3 py-1.5 text-xs text-warm-white placeholder-surface-accent/40 focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-btn-gradient text-midnight hover:opacity-90 rounded-md disabled:opacity-40 transition-opacity"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 2. FLOATING BUBBLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-btn-gradient hover:scale-105 active:scale-95 text-midnight flex items-center justify-center shadow-ai-glow border border-surface-accent/30 transition-all duration-200"
        aria-label="Toggle AI Assistant"
      >
        <MessageSquareCode className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatBot;
