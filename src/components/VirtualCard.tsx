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

      {/* Content Container - Proportional font scaling reduced by 25% for high-density visibility */}
      <div className="absolute inset-0 p-5 sm:p-[6%] flex flex-col justify-between z-20 text-white">
        
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2.5 sm:gap-[4%]">
             <span className="logo-font text-[30px] sm:text-[3vw] min-[1400px]:text-[42px] text-white leading-none select-none">bb</span>
             <div className="flex flex-col leading-[0.85] pt-1 sm:pt-[0.4vw]">
                <span className="text-[10px] sm:text-[1.35vw] min-[1400px]:text-[18px] font-black uppercase tracking-tight">BODIPO</span>
                <span className="text-[10px] sm:text-[1.35vw] min-[1400px]:text-[18px] font-black uppercase tracking-tight mt-0.5 sm:mt-[0.2vw]">BUSINESS</span>
             </div>
          </div>
          {isRefreshing && (
             <div className="animate-spin text-white">
                <svg className="w-4 h-4 sm:w-[2.2vw] min-[1400px]:w-8" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
          )}
        </div>

        {/* Center Section - Balanced scaling */}
        <div className="flex flex-col items-center justify-center flex-grow -mt-[1vw]">
           <span className="text-[20px] sm:text-[3.35vw] min-[1400px]:text-[48px] font-normal tracking-tight mb-[1vw]">Virtual</span>
           <div className="relative w-full text-center">
              <p className={`text-[12px] sm:text-[1.95vw] min-[1400px]:text-[27px] font-sans font-medium tracking-[0.05em] transition-all duration-700 whitespace-nowrap ${!active ? 'blur-[10px] sm:blur-[1vw] opacity-10' : 'opacity-100'}`}>
                {number}
              </p>
              {!active && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[7px] sm:text-[0.75vw] min-[1400px]:text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">CONGELADA</span>
                 </div>
              )}
           </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end pb-[0.5vw]">
           <div className={`transition-all duration-700 ${!active ? 'blur-[8px] sm:blur-[1vw] opacity-10' : 'opacity-100'}`}>
              <span className="text-[8px] sm:text-[1.2vw] min-[1400px]:text-[16px] font-medium leading-none">CVV: {cvv}</span>
           </div>
           
           <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[8px] sm:blur-[1vw] opacity-10' : 'opacity-100'}`}>
              <span className="text-[8px] sm:text-[1.05vw] min-[1400px]:text-[15px] font-medium uppercase mb-[0.6vw] leading-none text-white/90">VÁLIDA HASTA: {expiry}</span>
              <span className="text-[16px] sm:text-[2.6vw] min-[1400px]:text-[36px] font-black italic leading-none pr-1 drop-shadow-md" style={{ fontFamily: 'sans-serif' }}>VISA</span>
           </div>
        </div>
      </div>

      {/* Surface shine animation overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
