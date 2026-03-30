import React from 'react';

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
  active = false,
  onClick,
  isRefreshing = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[1.602/1] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none bg-[#0a488e] cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${isRefreshing ? 'opacity-80' : ''}`}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#0a488e]"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 opacity-40"></div>

      {/* Content Container */}
      <div className="absolute inset-0 p-8 sm:p-14 flex flex-col justify-between z-20 text-white font-sans">
        
        {/* Header: Logo - Refined to match image font */}
        <div className="flex items-start z-10">
          <div className="flex items-center gap-3 sm:gap-5">
             {/* Realistic stylized Logo */}
             <div className="flex items-center gap-1.5">
                <div className="relative">
                   <div className="w-6 h-6 sm:w-12 sm:h-12 border-[3.5px] sm:border-[9px] border-white rounded-full"></div>
                </div>
                <div className="relative -ml-2 sm:-ml-4">
                   <div className="w-6 h-6 sm:w-12 sm:h-12 border-[3.5px] sm:border-[9px] border-white rounded-full"></div>
                </div>
             </div>
             {/* Text: BODIPO BUSINESS - Precise Font Weight */}
             <div className="flex flex-col leading-[0.8] sm:leading-[0.85] pt-0.5 sm:pt-2">
                <span className="text-[14px] sm:text-[34px] font-[900] tracking-[-0.03em] text-white uppercase">BODIPO</span>
                <span className="text-[14px] sm:text-[34px] font-[900] tracking-[-0.03em] text-white uppercase mt-0.5 sm:mt-1.5">BUSINESS</span>
             </div>
          </div>
          {isRefreshing && (
            <div className="ml-auto animate-spin text-white">
               <svg className="w-5 h-5 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
          )}
        </div>

        {/* Center: "Virtual" Label and Card Number */}
        <div className="flex flex-col items-center z-10 -mt-2 sm:-mt-6">
           <span className="text-[34px] sm:text-[68px] font-medium leading-none tracking-tight text-white/95 mb-4 sm:mb-10 font-sans">Virtual</span>
           
           <div className="relative w-full text-center">
              <p className={`text-[17px] sm:text-[30px] font-sans font-medium tracking-[0.02em] text-white flex justify-center gap-3 sm:gap-10 transition-all duration-700 whitespace-nowrap ${!active ? 'blur-[18px] opacity-10 select-none' : 'opacity-100'}`}>
                {number}
              </p>
              {!active && (
                 <div className="absolute inset-0 flex items-center justify-center translate-y-1">
                    <span className="text-[10px] sm:text-[16px] font-black uppercase tracking-[0.6em] text-white/40 italic">CONGELADA</span>
                 </div>
              )}
           </div>
        </div>

        {/* Footer: CVV, Expiry and VISA */}
        <div className="flex justify-between items-end z-10 w-full">
           <div className={`transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[11px] sm:text-[22px] font-medium text-white/90">CVV: {cvv}</span>
           </div>
           
           <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[11px] sm:text-[22px] font-medium text-white/90 uppercase mb-1 sm:mb-3">VÁLIDA HASTA: {expiry}</span>
              <div className="h-4 sm:h-10 flex items-center pr-1 sm:pr-2">
                 <span className="text-[26px] sm:text-[52px] font-black italic tracking-tighter text-white leading-none drop-shadow-lg italic" style={{ fontFamily: 'sans-serif' }}>
                    VISA
                 </span>
              </div>
           </div>
        </div>

        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
      </div>
    </div>
  );
};

export default VirtualCard;
