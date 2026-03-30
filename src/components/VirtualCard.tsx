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
  active = false
}) => {
  return (
    <div className="relative w-full aspect-[1.6/1] rounded-[1.8rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none bg-[#004b93]">
      {/* Structural Elements */}
      <div className="absolute inset-0 border border-white/5 rounded-[1.8rem]"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between z-20 text-white font-sans">
        
        {/* Header: Logo */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="logo-font text-[30px] sm:text-[48px] text-white leading-none tracking-tighter">bb</span>
                <div className="flex flex-col -space-y-1">
                   <span className="text-[14px] sm:text-[24px] font-bold tracking-tight text-white uppercase leading-none">BODIPO</span>
                   <span className="text-[14px] sm:text-[24px] font-bold tracking-tight text-white uppercase leading-none">BUSINESS</span>
                </div>
             </div>
          </div>
        </div>

        {/* Center: "Virtual" Label */}
        <div className="flex flex-col items-center mt-2">
           <span className="text-[36px] sm:text-[60px] font-normal leading-none tracking-tight opacity-90 drop-shadow-sm">Virtual</span>
        </div>

        {/* Card Number */}
        <div className="flex justify-center -mt-2">
          <div className="relative">
            <p className={`text-[20px] sm:text-[36px] font-sans font-medium tracking-[0.05em] transition-all duration-700 ease-out flex justify-center gap-4 ${!active ? 'blur-[18px] opacity-10 select-none' : 'opacity-100'}`}>
              {number}
            </p>
            {!active && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] sm:text-[14px] font-black uppercase tracking-[0.6em] text-white/30 italic">CONGELADA</span>
               </div>
            )}
          </div>
        </div>

        {/* Footer: CVV, Expiry and Visa */}
        <div className="flex justify-between items-end mt-auto">
          <div className={`transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
             <span className="text-[12px] sm:text-[20px] font-medium tracking-wide">CVV: {cvv}</span>
          </div>
          
          <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
             <span className="text-[12px] sm:text-[20px] font-medium tracking-wide mb-1 sm:mb-2 uppercase">VÁLIDA HASTA: {expiry}</span>
             <div className="h-6 sm:h-10">
                <span className="text-[28px] sm:text-[48px] font-black italic tracking-tighter text-white drop-shadow-sm italic leading-none" style={{ fontFamily: 'sans-serif' }}>
                   VISA
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Subtle shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
