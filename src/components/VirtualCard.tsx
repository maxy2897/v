import React from 'react';

interface VirtualCardProps {
  number?: string;
  expiry?: string;
  cvv?: string;
  holderName?: string;
  active?: boolean;
  logoUrl?: string;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  number = '4918 5004 2135 3238',
  expiry = '04/2029',
  holderName = 'CLIENTE B. BUSINESS',
  active = false,
  logoUrl = './images/logo-n.png'
}) => {
  return (
    <div className="relative w-full aspect-[1.6/1] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group select-none border-4 border-white/20 dark:border-gray-800/50">
      {/* Background: Professional Blue-Green Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#004d55] via-[#00606a] to-[#007e85]"></div>
      
      {/* Subtle Pattern Layer to break the solid color */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      {/* Diagonal Refraction/Light Beam */}
      <div 
        className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-30deg] scale-[2] translate-x-[-15%]"
        style={{ pointerEvents: 'none' }}
      ></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between z-20 text-white font-sans">
        
        {/* Header: REAL LOGO IMAGE and CARD TYPE */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             {logoUrl ? (
               <div className="bg-white/90 p-1.5 rounded-xl shadow-sm">
                 <img src={logoUrl} className="h-6 sm:h-10 w-auto object-contain" alt="Logo" />
               </div>
             ) : (
                <div className="flex items-baseline gap-1">
                  <span className="logo-font text-[24px] sm:text-[38px] font-black italic">bb</span>
                  <span className="text-[12px] sm:text-[18px] font-bold uppercase">BODIPO</span>
                </div>
             )}
          </div>
          <div className="flex flex-col items-end pt-1">
             <span className="text-[10px] sm:text-[14px] font-black uppercase tracking-[0.25em] opacity-40">PLATINUM</span>
          </div>
        </div>

        {/* Chip and Contactless Symbols */}
        <div className="flex items-center gap-4 mt-2">
           {/* Realistic Chip */}
           <div className="relative w-10 min-w-[40px] h-8 sm:w-16 sm:h-11 bg-gradient-to-br from-[#d4af37] via-[#f7e4a1] to-[#b8860b] rounded-md overflow-hidden border border-black/20 shadow-lg">
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-black/30"></div>
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/30"></div>
              <div className="absolute inset-2 border-[1.5px] border-black/10 rounded-[2px] bg-white/5"></div>
           </div>
           
           {/* Contactless Waves */}
           <div className="flex gap-1 opacity-50">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1 h-3 sm:w-2 sm:h-5 rounded-full border-r-[2px] sm:border-r-[3px] border-white/80" style={{ transform: `scaleY(${0.6 + i * 0.4}) rotate(-10deg)` }}></div>
              ))}
           </div>
        </div>

        {/* Card Number: Properly sized and spaced for ALL screens */}
        <div className="mt-4 sm:mt-6">
          <div className="relative">
            <p className={`text-[17px] sm:text-[28px] font-mono font-medium tracking-[0.12em] sm:tracking-[0.2em] transition-all duration-700 ease-out flex justify-start gap-4 sm:gap-8 drop-shadow-xl ${!active ? 'blur-[16px] opacity-10 select-none' : 'opacity-100'}`}>
              {number.split(' ').map((chunk, i) => (
                <span key={i} className="inline-block">{chunk}</span>
              ))}
            </p>
            {!active && (
               <div className="absolute inset-0 flex items-center justify-start">
                  <span className="text-[10px] sm:text-[13px] font-black uppercase tracking-[0.5em] text-white/40 italic">SOLICITAR ACTIVACIÓN</span>
               </div>
            )}
          </div>
        </div>

        {/* Footer: Expiry, Name and Label */}
        <div className="flex justify-between items-end mt-auto">
          <div className={`flex flex-col transition-all duration-700 ${!active ? 'blur-[12px] opacity-10' : 'opacity-100'}`}>
             <div className="flex items-center gap-4 mb-2">
               <span className="text-[7px] sm:text-[10px] font-black opacity-50 leading-none">VÁLIDA HASTA</span>
               <span className="text-[14px] sm:text-[22px] font-medium leading-none drop-shadow-sm">{expiry}</span>
             </div>
             <span className="text-[13px] sm:text-[22px] font-bold uppercase tracking-wider leading-none drop-shadow-sm">{holderName}</span>
          </div>
          
          {/* Card Label */}
          <div className="flex flex-col items-end mb-1 opacity-50 group-hover:opacity-100 transition-opacity">
             <span className="text-[9px] sm:text-[14px] font-black uppercase tracking-[0.2em] italic">Tarjeta</span>
             <span className="text-[9px] sm:text-[14px] font-black uppercase tracking-[0.2em] italic mt-0.5 sm:mt-1">Virtual</span>
          </div>
        </div>
      </div>

      {/* Surface Shine Animation */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out pointer-events-none z-30"></div>
    </div>
  );
};

export default VirtualCard;
