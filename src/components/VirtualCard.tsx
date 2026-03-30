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
      className={`relative w-full aspect-[1.58/1] rounded-[1.2rem] sm:rounded-[1.8rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none bg-[#0a488e] cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${isRefreshing ? 'opacity-80' : ''}`}
    >
      {/* Background layer */}
      <div className="absolute inset-0 bg-[#0a488e]"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 opacity-30"></div>

      {/* Content Container - Use flex for better distribution */}
      <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-20 text-white">
        
        {/* Header - Logo */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex items-center gap-1">
                <div className="w-5 h-5 sm:w-10 sm:h-10 border-[3px] sm:border-[6px] border-white rounded-full"></div>
                <div className="w-5 h-5 sm:w-10 sm:h-10 border-[3px] sm:border-[6px] border-white rounded-full -ml-2 sm:-ml-4"></div>
             </div>
             <div className="flex flex-col leading-[0.8] pt-0.5 sm:pt-1">
                <span className="text-[10px] sm:text-[18px] font-black uppercase tracking-tight">BODIPO</span>
                <span className="text-[10px] sm:text-[18px] font-black uppercase tracking-tight sm:mt-0.5">BUSINESS</span>
             </div>
          </div>
          {isRefreshing && (
             <div className="animate-spin text-white/50">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
          )}
        </div>

        {/* Center Section - Label and Number */}
        <div className="flex flex-col items-center">
           <span className="text-[20px] sm:text-[42px] font-normal tracking-tight mb-2 sm:mb-4">Virtual</span>
           <div className="relative w-full text-center">
              <p className={`text-[12px] sm:text-[24px] font-sans font-medium tracking-[0.05em] transition-all duration-700 whitespace-nowrap ${!active ? 'blur-[12px] sm:blur-[18px] opacity-10' : 'opacity-100'}`}>
                {number}
              </p>
              {!active && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">CONGELADA</span>
                 </div>
              )}
           </div>
        </div>

        {/* Footer - CVV and Expiry/Visa */}
        <div className="flex justify-between items-end">
           <div className={`transition-all duration-700 ${!active ? 'blur-[8px] sm:blur-[12px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[8px] sm:text-[16px] font-medium">CVV: {cvv}</span>
           </div>
           
           <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[8px] sm:blur-[12px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[8px] sm:text-[16px] font-medium uppercase mb-0.5 sm:mb-2">VÁLIDA HASTA: {expiry}</span>
              <span className="text-[16px] sm:text-[34px] font-[900] italic leading-none pr-1 sm:pr-2">VISA</span>
           </div>
        </div>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
