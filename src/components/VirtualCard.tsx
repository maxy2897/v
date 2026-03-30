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
    <div className="relative w-full aspect-[1.6/1] rounded-[1.2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none">
      {/* Background: Characteristic Blue-Green Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003d44] via-[#005c66] to-[#007e85]"></div>
      
      {/* Diagonal Light Beam Effect */}
      <div 
        className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] scale-[2.5] translate-x-[-20%]"
        style={{ pointerEvents: 'none' }}
      ></div>
      
      {/* Structural Border */}
      <div className="absolute inset-0 border border-white/10 rounded-[1.2rem] sm:rounded-[2.5rem]"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-20 text-white font-sans">
        
        {/* Header: Authentic Bodipo Business Logo */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <span className="logo-font text-[28px] sm:text-[48px] text-white leading-none drop-shadow-md">bb</span>
             <div className="flex flex-col -space-y-0.5 sm:-space-y-1">
                <span className="text-[14px] sm:text-[22px] font-black tracking-tighter text-white uppercase leading-none drop-shadow-sm">Bodipo</span>
                <span className="text-[7px] sm:text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase leading-none">Business</span>
             </div>
          </div>
          <div className="flex flex-col items-end opacity-80">
             <span className="text-[9px] sm:text-[13px] font-black uppercase tracking-[0.3em] italic">Platinum</span>
          </div>
        </div>

        {/* Chip and Contactless Waves */}
        <div className="flex items-center gap-4 -mt-2">
           <div className="relative w-8 h-6 sm:w-14 sm:h-10 bg-gradient-to-br from-[#d4af37] via-[#f7e4a1] to-[#b8860b] rounded-sm sm:rounded-lg overflow-hidden border border-black/10 shadow-inner">
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/20"></div>
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/20"></div>
              <div className="absolute inset-2 border border-black/10 rounded-[2px]"></div>
           </div>
           <div className="flex gap-0.5 sm:gap-1.5 opacity-60">
              <div className="w-1.5 h-1.5 sm:w-4 sm:h-4 rounded-full border-r-[2px] sm:border-r-[3.5px] border-white/90 scale-y-[0.6] -rotate-12"></div>
              <div className="w-1.5 h-1.5 sm:w-4 sm:h-4 rounded-full border-r-[2px] sm:border-r-[3.5px] border-white/90 scale-y-[1.1] -rotate-12"></div>
              <div className="w-1.5 h-1.5 sm:w-4 sm:h-4 rounded-full border-r-[2px] sm:border-r-[3.5px] border-white/90 scale-y-[1.6] -rotate-12"></div>
           </div>
        </div>

        {/* Card Number: Optimized spacing */}
        <div className="mt-2 sm:mt-4">
          <div className="relative">
            <p className={`text-[16px] sm:text-[28px] font-mono font-medium tracking-[0.1em] sm:tracking-[0.18em] transition-all duration-700 ease-out flex justify-start gap-4 sm:gap-8 drop-shadow-lg ${!active ? 'blur-[16px] opacity-10 select-none' : 'opacity-100'}`}>
              {number.split(' ').map((chunk, i) => (
                <span key={i} className="inline-block">{chunk}</span>
              ))}
            </p>
            {!active && (
               <div className="absolute inset-0 flex items-center justify-start">
                  <span className="text-[10px] sm:text-[14px] font-black uppercase tracking-[0.6em] text-white/30 italic">Tarjeta Bloqueada</span>
               </div>
            )}
          </div>
        </div>

        {/* Footer: Expiry, Holder and "TARJETA VIRTUAL" label */}
        <div className="flex justify-between items-end mt-auto">
          <div className={`transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
            <div className="flex flex-col">
               <div className="flex items-center gap-4 mb-0.5 sm:mb-1">
                 <span className="text-[6px] sm:text-[10px] font-bold opacity-60 leading-none">VÁLIDA HASTA</span>
                 <span className="text-[12px] sm:text-[20px] font-medium leading-none">{expiry}</span>
               </div>
               <span className="text-[11px] sm:text-[19px] font-bold uppercase tracking-wider leading-none">{holderName}</span>
            </div>
          </div>
          
          {/* Label instead of Visa Logo */}
          <div className="flex flex-col items-end mb-0.5">
             <span className="text-[9px] sm:text-[16px] font-black uppercase tracking-[0.25em] text-white/50 italic leading-none">
                Tarjeta
             </span>
             <span className="text-[9px] sm:text-[16px] font-black uppercase tracking-[0.25em] text-white/50 italic leading-none mt-1">
                Virtual
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
