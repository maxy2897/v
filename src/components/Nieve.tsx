import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';

// Copos de nieve suaves para la portada en Navidad. No se pueden pulsar ni tapan nada.
const Nieve: React.FC<{ copos?: number }> = ({ copos = 36 }) => {
  const sinMovimiento = useReducedMotion();
  const lista = useMemo(
    () =>
      Array.from({ length: copos }, (_, i) => ({
        izq: (i * 37) % 100,
        tam: 3 + ((i * 7) % 5),
        dur: 9 + ((i * 13) % 10),
        retraso: -((i * 11) % 18),
        vaiven: 10 + ((i * 5) % 20),
        opacidad: 0.35 + ((i * 3) % 5) / 10,
      })),
    [copos],
  );
  if (sinMovimiento) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {lista.map((c, i) => (
        <span
          key={i}
          className="copo absolute -top-3 rounded-full bg-white"
          style={{
            left: `${c.izq}%`,
            width: c.tam,
            height: c.tam,
            opacity: c.opacidad,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.retraso}s`,
            ['--vaiven' as string]: `${c.vaiven}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Nieve;
