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

      {/* Content Container */}
      <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between z-20 text-white">
        
        {/* Header - Logo */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2 sm:gap-3">
             <div className="flex items-center gap-1">
                <div className="relative flex items-center justify-center">
                   <div className="w-5 h-5 sm:w-8 sm:h-8 border-[3px] border-white rounded-full"></div>
                   <span className="logo-font absolute text-[12px] sm:text-[18px] text-white leading-none mt-1">b</span>
                </div>
                <div className="relative flex items-center justify-center -ml-1 sm:-ml-1.5">
                   <div className="w-5 h-5 sm:w-8 sm:h-8 border-[3px] border-white rounded-full"></div>
                   <span className="logo-font absolute text-[12px] sm:text-[18px] text-white leading-none mt-1">b</span>
                </div>
             </div>
             <div className="flex flex-col leading-[0.85] pt-0.5">
                <span className="text-[10px] sm:text-[16px] font-black uppercase tracking-tight">BODIPO</span>
                <span className="text-[10px] sm:text-[16px] font-black uppercase tracking-tight mt-0.5">BUSINESS</span>
             </div>
          </div>
          {isRefreshing && (
             <div className="animate-spin text-white">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
          )}
        </div>

        {/* Center Section - Label and Number (Lifted up) */}
        <div className="flex flex-col items-center -mt-2">
           <span className="text-[20px] sm:text-[38px] font-normal tracking-tight mb-2 sm:mb-4">Virtual</span>
           <div className="relative w-full text-center">
              <p className={`text-[12px] sm:text-[22px] font-sans font-medium tracking-[0.05em] transition-all duration-700 whitespace-nowrap ${!active ? 'blur-[10px] sm:blur-[16px] opacity-10' : 'opacity-100'}`}>
                {number}
              </p>
              {!active && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.5em] text-white/40 italic">CONGELADA</span>
                 </div>
              )}
           </div>
        </div>

        {/* Footer - CVV and Expiry/Visa */}
        <div className="flex justify-between items-end">
           <div className={`transition-all duration-700 ${!active ? 'blur-[8px] sm:blur-[12px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[8px] sm:text-[15px] font-medium leading-none">CVV: {cvv}</span>
           </div>
           
           <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[8px] sm:blur-[12px] opacity-10' : 'opacity-100'}`}>
              <span className="text-[8px] sm:text-[14px] font-medium uppercase mb-0.5 sm:mb-1.5 leading-none">VÁLIDA HASTA: {expiry}</span>
              <span className="text-[16px] sm:text-[30px] font-black italic leading-none drop-shadow-sm" style={{ fontFamily: 'sans-serif' }}>VISA</span>
           </div>
        </div>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
