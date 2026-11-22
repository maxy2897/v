import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sección del Sorteo Navideño 2026 en la portada.
// Banner horizontal en PC, cuadrado en móvil; al pulsar abre el registro de clientes
// (si ya ha iniciado sesión, lleva a su área de cliente). Debajo, el vídeo del sorteo.
const SorteoNavidad: React.FC<{ onOpenRegister: () => void }> = ({ onOpenRegister }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const abrir = () => (isAuthenticated ? navigate('/dashboard') : onOpenRegister());

  return (
    <section id="sorteo-navidad" aria-label="Sorteo Navideño 2026" className="w-full bg-[#0E2A3B] px-5 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-24">
      <button
        type="button"
        onClick={abrir}
        className="group block w-full overflow-hidden rounded-xl shadow-[0_18px_50px_rgba(0,0,0,.35)] outline-none ring-[#ffbd59] transition focus-visible:ring-4"
        aria-label={isAuthenticated ? 'Sorteo Navideño 2026: ir a mi cuenta' : 'Sorteo Navideño 2026: regístrate para participar'}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet="/sorteo/banner-pc.jpg" width={1920} height={720} />
          <img
            src="/sorteo/banner-movil.jpg"
            width={1080}
            height={1080}
            alt="Gran Sorteo Navideño 2026: sorteamos 9 cestas de Navidad entre nuestros clientes registrados"
            className="block h-auto w-full transition duration-500 group-hover:scale-[1.01]"
          />
        </picture>
      </button>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={abrir}
          className="bg-[#ffbd59] px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] text-[#06272b] transition hover:bg-white"
        >
          {isAuthenticated ? 'Ya estás registrado · Ver mi cuenta' : 'Regístrate y participa'}
        </button>
      </div>
      <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-xl bg-black shadow-[0_18px_50px_rgba(0,0,0,.35)]">
        <video
          className="block aspect-video h-auto w-full"
          src="/sorteo/video-sorteo.mp4"
          poster="/sorteo/video-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Vídeo del Sorteo Navideño 2026"
        />
      </div>
    </section>
  );
};

export default SorteoNavidad;
