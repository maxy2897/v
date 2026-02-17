import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, AppConfig } from '../../types';

interface AIChatProps {
  config?: AppConfig;
}

const AIChat: React.FC<AIChatProps> = ({ config }) => {
  const { t } = useSettings();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize greeting
  useEffect(() => {
    const greeting = user?.name
      ? `Hola ${user.name}, ${t('chat.welcome').replace('¡Hola! ', '')}`
      : t('chat.welcome');

    setMessages([{ role: 'assistant', content: greeting }]);
  }, [user, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }]
      }));

      const response = await getGeminiResponse(userMsg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ayuda" className="fixed bottom-10 right-10 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#00151a] hover:bg-[#007e85] text-white p-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all transform hover:scale-110 flex items-center justify-center group"
        >
          <div className="relative">
            <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
          </div>
          <span className="ml-4 font-black uppercase text-[10px] tracking-[0.3em] hidden md:inline">{t('chat.cta')}</span>
        </button>
      ) : (
        <div className="fixed bottom-0 right-0 left-0 md:bottom-10 md:right-10 md:left-auto z-[9999] flex justify-center md:block pointer-events-none">
          <div className="bg-white w-[90vw] max-w-[380px] md:w-[400px] h-[70vh] md:h-[600px] md:max-h-none rounded-t-[2.5rem] md:rounded-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[0_50px_100px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-bottom-20 pointer-events-auto">
            <div className="bg-[#00151a] p-6 md:p-8 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center border-[4px] border-white shadow-sm overflow-hidden p-1">
                  {config?.customLogoUrl ? (
                    <img src={config.customLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="logo-font text-2xl md:text-3xl logo-color leading-none select-none pt-1">{config?.logoText || 'bb'}</span>
                  )}
                </div>
                <div>
                  <p className="font-black text-[10px] md:text-xs uppercase tracking-widest leading-none mb-1">Bodipo Business</p>
                  <p className="text-[9px] text-teal-400/70 font-bold uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    {t('chat.online')}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded-full p-2 md:p-2.5 transition-colors" title={t('chat.close')} aria-label={t('chat.close')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#fcfdfd]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3 md:px-6 md:py-4 rounded-3xl text-sm leading-relaxed font-medium ${msg.role === 'user'
                    ? 'bg-[#007e85] text-white rounded-tr-none shadow-lg shadow-teal-900/10'
                    : 'bg-white text-[#00151a] shadow-sm border border-gray-50 rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-6 py-4 rounded-3xl border border-gray-50 flex gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-200 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 border-t border-gray-50 bg-white shrink-0">
              <div className="flex gap-2 md:gap-4">
                <input
                  type="text"
                  placeholder={t('chat.placeholder')}
                  // Use text-base (16px) specifically on mobile to prevent iOS auto-zoom
                  className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-none rounded-2xl text-[16px] md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#007e85] transition-all text-gray-900"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-[#00151a] text-white p-3 md:p-4 rounded-2xl disabled:opacity-50 hover:bg-[#007e85] transition-colors shadow-xl"
                  title={t('chat.send')}
                  aria-label={t('chat.send')}
                >
                  <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
              <p className="text-[9px] text-gray-300 mt-4 md:mt-6 text-center font-black uppercase tracking-[0.4em]">{t('chat.system')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;