import React from 'react';

interface VirtualCardProps {
  number?: string;
  expiry?: string;
  cvv?: string;
  holderName?: string;
  active?: boolean;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  number = '4918 5004 2135 3238',
  expiry = '04/2029',
  cvv = '043',
  holderName = 'CLIENTE B. BUSINESS',
  active = false
}) => {
  return (
    <div className="relative w-full aspect-[1.6/1] rounded-[1.2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none">
      {/* Dynamic Background: Deep Navy/Teal Solid Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00151a] via-[#012d35] to-[#00151a]"></div>
      
      {/* Carbon fiber-ish texture or subtle pattern (opacity kept low for clean look) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

      {/* Subtle border for structure */}
      <div className="absolute inset-0 border border-white/10 rounded-[1.2rem] sm:rounded-[2.5rem]"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 p-6 sm:p-9 flex flex-col justify-between z-20 text-white">
        {/* Header: Logo and Brand */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <span className="logo-font text-[22px] sm:text-[32px] leading-none text-white tracking-widest drop-shadow-md">bb</span>
                <div className="flex flex-col -mt-1">
                   <span className="text-[7px] sm:text-[9px] font-black leading-none tracking-[0.35em] text-teal-500 drop-shadow-sm uppercase">BODIPO</span>
                   <span className="text-[7px] sm:text-[9px] font-black leading-none tracking-[0.35em] text-white/50 drop-shadow-sm uppercase mt-0.5">BUSINESS</span>
                </div>
             </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] sm:text-[14px] font-black italic text-teal-400 drop-shadow-lg uppercase tracking-[0.25em]">Virtual Card</span>
            <div className="mt-1 h-0.5 w-12 bg-gradient-to-r from-transparent to-teal-500 rounded-full"></div>
          </div>
        </div>

        {/* Card Number: Main Focus */}
        <div className="mt-auto mb-6 sm:mb-8">
          <div className="relative">
            <p className={`text-[18px] sm:text-[28px] font-mono tracking-[0.25em] sm:tracking-[0.32em] font-medium drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out flex justify-between ${!active ? 'blur-[14px] opacity-10 select-none' : 'opacity-100'}`}>
              {number.split(' ').map((chunk, i) => (
                <span key={i} className="inline-block">{chunk}</span>
              ))}
            </p>
            {!active && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Bloqueada</span>
               </div>
            )}
          </div>
        </div>

        {/* Footer: Date, CVV and Holder */}
        <div className="flex justify-between items-end">
          <div className="flex gap-8">
             <div className={`transition-all duration-700 ${!active ? 'blur-[10px] opacity-10' : 'opacity-100'}`}>
               <span className="block text-[6px] sm:text-[8px] font-black text-teal-400/70 uppercase tracking-[0.2em] mb-1">VÁLIDA HASTA</span>
               <span className="text-[11px] sm:text-[14px] font-mono font-bold tracking-[0.1em] text-white/90 drop-shadow-md">{expiry}</span>
             </div>
             <div className={`transition-all duration-700 ${!active ? 'blur-[10px] opacity-10' : 'opacity-100'}`}>
                <span className="block text-[6px] sm:text-[8px] font-black text-teal-400/70 uppercase tracking-[0.2em] mb-1">CVV CODE</span>
                <span className="text-[11px] sm:text-[14px] font-mono font-bold tracking-[0.1em] text-white/90 drop-shadow-md">{cvv}</span>
             </div>
          </div>
          
          <div className="flex flex-col items-end">
             <div className="h-6 sm:h-9 opacity-90 drop-shadow-lg">
                <svg viewBox="0 0 100 30" width="80" height="24" className="sm:w-[100px] sm:h-[30px]">
                    <text x="0" y="25" fontFamily="Arial" fontWeight="900" fontSize="24" fill="white" fontStyle="italic">VISA</text>
                    <path d="M70 5 L95 5 L95 25 L70 25 Z" fill="white" fillOpacity="0.1" />
                    <rect x="75" y="10" width="15" height="10" rx="2" fill="white" fillOpacity="0.8" />
                </svg>
             </div>
             <span className="text-[7px] sm:text-[9px] font-bold text-white/40 tracking-[0.1em] italic uppercase mt-1">{holderName}</span>
          </div>
        </div>
      </div>

      {/* Animated Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
      
      {/* Bottom corner branding */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
    </div>
  );
};

export default VirtualCard;
