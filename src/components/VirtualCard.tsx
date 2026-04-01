import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

interface VirtualCardProps {
  number?: string;
  expiry?: string;
  cvv?: string;
  holderName?: string;
  active?: boolean;
  onClick?: () => void;
  isRefreshing?: boolean;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  number = '4918 5004 2135 3238',
  expiry = '04/2029',
  cvv = '043',
  holderName = 'BODIPO BUSINESS',
  active = false,
  onClick,
  isRefreshing = false
}) => {
  const { t } = useSettings();
  const [logoUrl, setLogoUrl] = useState('./images/logo-n.png');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bb_config');
      if (saved) {
        const config = JSON.parse(saved);
        if (config.customLogoUrl) {
          setLogoUrl(config.customLogoUrl);
        }
      }
    } catch (e) {
      //
    }
  }, []);

  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[1.58/1] rounded-[1.2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 group select-none bg-[#020817] cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isRefreshing ? 'opacity-80' : ''}`}
    >
      {/* Premium Metallic/Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e293b]"></div>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Neon Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

      {/* Decorative SVG Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 C 20 0, 50 0, 100 100" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-teal-400" />
        <path d="M0 0 C 50 100, 80 100, 100 0" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-blue-400" />
      </svg>

      {/* Internal Border Glow */}
      <div className="absolute inset-0 rounded-[1.2rem] sm:rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/10 to-transparent"></div>

      {/* Content Container */}
      <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between z-20 text-white">
        
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 drop-shadow-2xl">
             <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                <img 
                   src={logoUrl} 
                   className="w-full h-full object-contain" 
                   style={{ filter: 'drop-shadow(1px 1px 0 white) drop-shadow(-1px -1px 0 white) drop-shadow(1px -1px 0 white) drop-shadow(-1px 1px 0 white)' }}
                   alt="Logo" 
                />
             </div>
             <div className="flex flex-col leading-none">
                <span className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white">BODIPO</span>
                <span className="text-[8px] sm:text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-teal-400/80 mt-0.5 sm:mt-1">BUSINESS</span>
             </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {isRefreshing ? (
               <div className="animate-spin text-teal-400">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
               </div>
            ) : (
              <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                <p className="text-[5px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-teal-400/80">{t('card.premium')}</p>
              </div>
            )}
            <div className="text-[5px] sm:text-[7px] md:text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1 mr-1">{t('card.member')}</div>
          </div>
        </div>

        {/* Center Section - Card Number */}
        <div className="flex flex-col items-center justify-center flex-grow py-2">
           <div className="relative w-full text-center">
              <p className={`text-[14px] sm:text-[22px] md:text-[28px] font-mono font-bold tracking-[0.1em] sm:tracking-[0.15em] transition-all duration-700 whitespace-nowrap drop-shadow-[0_0_15px_rgba(45,212,191,0.3)] ${!active ? 'blur-[12px] sm:blur-[24px] opacity-10' : 'opacity-100 text-white'}`}>
                {number.split(' ').map((chunk, i) => (
                  <span key={i} className={i % 2 === 0 ? 'text-white' : 'text-white/80'}>{chunk} </span>
                ))}
              </p>
              {!active && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[7px] sm:text-[10px] md:text-[14px] font-black uppercase tracking-[0.6em] text-teal-400/40 italic animate-pulse">{t('card.locked')}</span>
                 </div>
              )}
           </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end w-full">
           <div className={`flex flex-col gap-1.5 sm:gap-3 transition-all duration-700 ${!active ? 'blur-[10px] opacity-10' : 'opacity-100'} min-w-0 pr-4`}>
              <div className="flex flex-col min-w-0">
                <p className="text-[5px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-teal-400/60 mb-0.5">{t('card.holder')}</p>
                <p className="text-[8px] sm:text-[11px] md:text-[14px] font-black uppercase tracking-widest text-white truncate drop-shadow-sm leading-tight">{holderName}</p>
              </div>
              <div className="inline-flex flex-col bg-white/5 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-white/5 self-start">
                 <p className="text-[5px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-teal-400/60 mb-0.5">{t('card.cvv')}</p>
                 <p className="text-[8px] sm:text-[12px] md:text-[14px] font-mono font-black text-white leading-tight">{cvv}</p>
              </div>
           </div>
           
           <div className={`flex flex-col items-end gap-1.5 sm:gap-2 transition-all duration-700 ${!active ? 'blur-[10px] opacity-10' : 'opacity-100'} shrink-0`}>
              <div className="text-right">
                 <p className="text-[5px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-teal-400/60 mb-0.5">{t('card.valid_thru')}</p>
                 <p className="text-[8px] sm:text-[12px] md:text-[14px] font-black tracking-widest text-white leading-tight">{expiry}</p>
              </div>
              <div className="relative group/visa mt-1">
                <span className="text-[18px] sm:text-[28px] md:text-[36px] font-black italic leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] font-sans select-none tracking-tighter">VISA</span>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transform scale-x-0 group-hover/visa:scale-x-100 transition-transform duration-500"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Dynamic Shine Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out pointer-events-none z-30"></div>
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-black/10"></div>
    </div>
  );
};

export default VirtualCard;
