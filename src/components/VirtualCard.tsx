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
      className={`relative w-full aspect-[1.58/1] rounded-[1.2rem] sm:rounded-[2.4rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none bg-[#0a488e] cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${isRefreshing ? 'opacity-80' : ''}`}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#0a488e]"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 opacity-30"></div>

      {/* Content Container (Increased padding for larger card sizes) */}
      <div className="absolute inset-0 p-6 sm:p-16 flex flex-col justify-between z-20 text-white">
        
        {/* Header: Authentic bb Logo */}
        <div className="flex justify-between items-start z-10">
          <div className="flex items-start gap-4 sm:gap-6">
             <span className="logo-font text-[32px] sm:text-[58px] text-white leading-none tracking-tighter select-none">bb</span>
             <div className="flex flex-col leading-[0.8] pt-1.5 sm:pt-4">
                <span className="text-[12px] sm:text-[24px] font-black uppercase tracking-tight text-white/95">BODIPO</span>
                <span className="text-[12px] sm:text-[24px] font-black uppercase tracking-tight text-white/95 mt-0.5 sm:mt-2">BUSINESS</span>
             </div>
          </div>
          {isRefreshing && (
             <div className="animate-spin text-white">
                <svg className="w-5 h-5 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
          )}
        </div>

        {/* Center Section: Label and Number */}
        <div className="flex flex-col items-center">
           <span className="text-[28px] sm:text-[62px] font-normal tracking-tight text-white mb-2 sm:mb-6">Virtual</span>
           <div className="relative w-full text-center">
              <p className={`text-[12px] sm:text-[34px] font-sans font-medium tracking-[0.05em] text-white flex justify-center gap-4 sm:gap-10 transition-all duration-700 whitespace-nowrap ${!active ? 'blur-[12px] sm:blur-[22px] opacity-10' : 'opacity-100'}`}>
                {number}
              </p>
              {!active && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] sm:text-[14px] font-black uppercase tracking-[0.5em] text-white/40 italic">CONGELADA</span>
                 </div>
              )}
           </div>
        </div>

        {/* Footer: CVV, Expiry and VISA */}
        <div className="flex justify-between items-end">
           <div className={`transition-all duration-700 ${!active ? 'blur-[10px] sm:blur-[14px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[10px] sm:text-[24px] font-medium leading-none">CVV: {cvv}</span>
           </div>
           
           <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[10px] sm:blur-[14px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[10px] sm:text-[22px] font-medium uppercase mb-1 sm:mb-3 leading-none text-white/90">VÁLIDA HASTA: {expiry}</span>
              <div className="h-6 sm:h-14 flex items-center pr-1 sm:pr-3">
                 <span className="text-[24px] sm:text-[54px] font-black italic tracking-tighter text-white leading-none drop-shadow-md" style={{ fontFamily: 'sans-serif' }}>VISA</span>
              </div>
           </div>
        </div>
      </div>

      {/* Surface shine animation */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
