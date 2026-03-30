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
  holderName = 'CLIENTE B. BUSINESS',
  active = false
}) => {
  return (
    <div className="relative w-full aspect-[1.6/1] rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none">
      {/* Background: BBVA Style Blue Gradient with Light Beam */}
      <div className="absolute inset-0 bg-[#004481]"></div>
      <div 
        className="absolute inset-0 opacity-40 bg-gradient-to-br from-transparent via-[#00a1df]/30 to-transparent skew-x-[-20deg] scale-[2] translate-x-[-10%]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 50%, transparent)' }}
      ></div>
      
      {/* Structural Elements */}
      <div className="absolute inset-0 border border-white/10 rounded-[1.2rem] sm:rounded-[2rem]"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-20 text-white font-sans">
        
        {/* Header: Logo and Card Type */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] sm:text-[34px] font-black italic tracking-tighter leading-none">bb</span>
              <span className="text-[12px] sm:text-[20px] font-bold tracking-tight leading-none uppercase">BODIPO</span>
            </div>
            <span className="text-[6px] sm:text-[10px] font-bold tracking-[0.3em] uppercase opacity-60 ml-0.5">BUSINESS</span>
          </div>
          <span className="text-[10px] sm:text-[14px] font-medium opacity-90">Virtual</span>
        </div>

        {/* Chip and Contactless Waves */}
        <div className="flex items-center gap-4 -mt-2">
           <div className="relative w-7 h-5 sm:w-12 sm:h-9 bg-gradient-to-br from-[#c0c0c0] via-[#e8e8e8] to-[#999999] rounded-sm sm:rounded-md overflow-hidden border border-black/10">
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/20"></div>
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/20"></div>
              <div className="absolute inset-1.5 border border-black/10 rounded-[1px]"></div>
           </div>
           <div className="flex gap-0.5 sm:gap-1 opacity-70">
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full border-r-[2px] sm:border-r-[3px] border-white/80 scale-y-[0.5] -rotate-12"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full border-r-[2px] sm:border-r-[3px] border-white/80 scale-y-[1] -rotate-12"></div>
              <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full border-r-[2px] sm:border-r-[3px] border-white/80 scale-y-[1.5] -rotate-12"></div>
           </div>
        </div>

        {/* Card Number: BBVA Style spacing and font */}
        <div className="mt-2 sm:mt-4">
          <div className="relative">
            <p className={`text-[17px] sm:text-[30px] font-medium tracking-[0.1em] sm:tracking-[0.18em] transition-all duration-700 ease-out flex justify-start gap-4 sm:gap-8 ${!active ? 'blur-[16px] opacity-10 select-none' : 'opacity-100'}`}>
              {number.split(' ').map((chunk, i) => (
                <span key={i} className="inline-block">{chunk}</span>
              ))}
            </p>
            {!active && (
               <div className="absolute inset-0 flex items-center justify-start ml-2">
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.5em] text-white/30 italic">Bloqueada</span>
               </div>
            )}
          </div>
        </div>

        {/* Footer: Expiry and Holder Name */}
        <div className="flex justify-between items-end mt-auto">
          <div className={`transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
            <div className="flex flex-col">
               <div className="flex items-center gap-4 mb-1">
                 <span className="text-[7px] sm:text-[10px] font-bold opacity-60 leading-none">VÁLIDA HASTA</span>
                 <span className="text-[14px] sm:text-[20px] font-medium leading-none">{expiry}</span>
               </div>
               <span className="text-[12px] sm:text-[20px] font-medium uppercase tracking-wider">{holderName}</span>
            </div>
          </div>
          
          {/* Visa Logo style */}
          <div className="h-6 sm:h-10">
             <span className="text-[24px] sm:text-[42px] font-black italic tracking-tighter opacity-100 drop-shadow-sm italic" style={{ fontFamily: 'sans-serif' }}>
                VISA
             </span>
          </div>
        </div>
      </div>

      {/* Subtle shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
