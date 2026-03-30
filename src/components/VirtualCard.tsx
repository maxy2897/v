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
    <div className="relative w-full aspect-[1.6/1] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none bg-[#004e92] p-10 flex flex-col justify-between">
      {/* Structural Elements (Subtle shadow/border for dimension) */}
      <div className="absolute inset-0 border border-white/5 rounded-[2rem]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10 z-0"></div>

      {/* Header: Logo matching the provided image exactly */}
      <div className="flex items-start z-10">
        <div className="flex items-start gap-4">
           {/* Stylized Logo 'bb' */}
           <div className="flex items-center gap-1 mt-1">
             <div className="relative flex items-center">
                <div className="w-6 h-6 sm:w-10 sm:h-10 border-[3px] sm:border-[5px] border-white rounded-full"></div>
                <div className="w-3 sm:w-5 h-[3px] sm:h-[5px] bg-white absolute -top-1 left-0 rotate-12"></div>
             </div>
             <div className="relative flex items-center -ml-1 sm:-ml-2">
                <div className="w-6 h-6 sm:w-10 sm:h-10 border-[3px] sm:border-[5px] border-white rounded-full"></div>
                <div className="w-3 sm:w-5 h-[3px] sm:h-[5px] bg-white absolute -top-1 left-0 rotate-12"></div>
             </div>
           </div>
           {/* Text: BODIPO BUSINESS */}
           <div className="flex flex-col leading-[0.85] pt-0.5 sm:pt-1">
              <span className="text-[14px] sm:text-[24px] font-bold tracking-tight text-white uppercase">BODIPO</span>
              <span className="text-[14px] sm:text-[24px] font-bold tracking-tight text-white uppercase mt-0.5 sm:mt-1">BUSINESS</span>
           </div>
        </div>
      </div>

      {/* Center: "Virtual" Label and Card Number */}
      <div className="flex flex-col items-center z-10">
         <span className="text-[32px] sm:text-[56px] font-normal leading-none tracking-tight text-white opacity-95 mb-4">Virtual</span>
         
         <div className="relative w-full text-center">
            <p className={`text-[17px] sm:text-[32px] font-mono tracking-[0.05em] text-white flex justify-center gap-4 transition-all duration-700 ${!active ? 'blur-[18px] opacity-10 select-none' : 'opacity-100'}`}>
              {number}
            </p>
            {!active && (
               <div className="absolute inset-0 flex items-center justify-center translate-y-1">
                  <span className="text-[10px] sm:text-[14px] font-black uppercase tracking-[0.6em] text-white/30 italic">BLOQUEADA</span>
               </div>
            )}
         </div>
      </div>

      {/* Footer: CVV, Expiry and VISA */}
      <div className="flex justify-between items-end z-10 w-full">
         <div className={`transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
            <span className="text-[11px] sm:text-[18px] font-medium text-white">CVV: {cvv}</span>
         </div>
         
         <div className={`flex flex-col items-end transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
            <span className="text-[11px] sm:text-[18px] font-medium text-white uppercase mb-1 sm:mb-2">VÁLIDA HASTA: {expiry}</span>
            <div className="h-4 sm:h-8 flex items-center pr-1 sm:pr-2">
               <span className="text-[24px] sm:text-[42px] font-black italic tracking-tighter text-white leading-none drop-shadow-md" style={{ fontFamily: 'sans-serif' }}>
                  VISA
               </span>
            </div>
         </div>
      </div>

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
