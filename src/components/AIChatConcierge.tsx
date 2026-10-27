import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Loader2, Minimize2, HelpCircle } from 'lucide-react';
import { ChatMessage, Itinerary } from '../types/trip';

interface AIChatConciergeProps {
  itinerary: Itinerary | null;
}

export const AIChatConcierge: React.FC<AIChatConciergeProps> = ({ itinerary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hi! Ask me anything about ${itinerary?.destination || 'your trip'} — transit tickets, local dining tips, tipping customs, or questions about your schedule.`,
      timestamp: 'Now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          tripContext: itinerary,
        }),
      });

      if (!res.ok) throw new Error('Failed to get concierge reply');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is what I found for you!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `For ${itinerary?.destination || 'this trip'}, contactless payment is generally accepted, but keep modest local cash for small family shops. Feel free to ask about nearby food or timing!`,
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const QUICK_QUESTIONS = [
    `How to get around in ${itinerary?.destination || 'the city'}?`,
    'Is tap water drinkable?',
    'Good coffee near our stops?',
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm shadow-md hover:scale-102 transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Local Trip Assistant</span>
        </button>
      )}

      {/* Concierge Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[500px] max-h-[calc(100vh-80px)] bg-white border border-stone-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-stone-900">
          {/* Header */}
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  {itinerary?.destination} Assistant
                </h4>
                <p className="text-[11px] text-stone-500">Local customs, dining & transit</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                      isUser ? 'bg-stone-900 text-white font-bold' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : 'V'}
                  </div>
                  <div
                    className={`p-3 rounded-xl text-xs max-w-[82%] leading-relaxed ${
                      isUser
                        ? 'bg-stone-900 text-white font-medium rounded-tr-xs'
                        : 'bg-stone-100 text-stone-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 opacity-60 ${
                        isUser ? 'text-stone-200' : 'text-stone-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-stone-500 p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-700" />
                <span>Checking details...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isSending}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition cursor-pointer border border-stone-200 disabled:opacity-50 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask about ${itinerary?.destination || 'your destination'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white transition cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
