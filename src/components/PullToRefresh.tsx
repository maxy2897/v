import React, { useState, useEffect, useCallback, ReactNode } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  children, 
  onRefresh, 
  threshold = 80,
  maxPull = 120 
}) => {
  const [startY, setStartY] = useState(0);
  const [pullDivY, setPullDivY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);

  const handleTouchStart = (e: React.TouchEvent | TouchEvent) => {
    // Solo permitir pulldown si estamos arriba del todo
    if (window.scrollY === 0) {
      setStartY('touches' in e ? e.touches[0].clientY : 0);
    }
  };

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (startY === 0 || refreshing) return;
    if (window.scrollY > 0) return;

    const y = 'touches' in e ? e.touches[0].clientY : 0;
    const dragDistance = y - startY;

    if (dragDistance > 0) {
      // Aplicar algo de resistencia al hacer el drag
      const pullDistance = Math.min(dragDistance * 0.5, maxPull);
      
      setPullDivY(pullDistance);
      setCanRefresh(pullDistance > threshold);
    }
  }, [startY, refreshing, threshold, maxPull]);

  const handleTouchEnd = async () => {
    if (startY === 0) return;

    if (canRefresh && !refreshing) {
      setRefreshing(true);
      setPullDivY(50); // Mantener el loader a 50px mientras refresca
      
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDivY(0);
        setCanRefresh(false);
        setStartY(0);
      }
    } else {
      // Cancelar refresh
      setPullDivY(0);
      setCanRefresh(false);
      setStartY(0);
    }
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div className="relative w-full">
      {/* Indicador visual de refresh */}
      <div 
        className="absolute w-full top-0 left-0 flex justify-center items-center overflow-hidden transition-all duration-300 ease-out z-50 pointer-events-none"
        style={{ 
          height: `${pullDivY}px`,
          opacity: pullDivY > 10 ? 1 : 0
        }}
      >
        <div 
          className={`w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`}
          style={{
            transform: `rotate(${pullDivY * 2}deg)`
          }}
        >
          <svg className={`w-5 h-5 ${canRefresh ? 'text-teal-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
      
      {/* Contenido envuelto que se desplaza hacia abajo */}
      <div 
        style={{ 
          transform: pullDivY > 0 ? `translateY(${pullDivY}px)` : 'none',
          transition: refreshing || pullDivY === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
