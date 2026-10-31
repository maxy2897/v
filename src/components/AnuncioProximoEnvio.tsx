import React from 'react';
import { Link } from 'react-router-dom';
import { proximasSalidas } from '../constants/salidas';

// Franja de aviso bajo la cabecera, en todas las páginas: la próxima salida aérea del calendario.
// Cambia sola al pasar cada fecha; si no quedan salidas, no se muestra.
const AnuncioProximoEnvio: React.FC = () => {
  const proxima = proximasSalidas()[0];
  if (!proxima) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((proxima.getTime() - hoy.getTime()) / 86400000);
  const fecha = proxima.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  const cuando = dias === 0 ? '¡Sale hoy!' : dias === 1 ? '¡Sale mañana!' : `Faltan ${dias} días`;
  const mensaje = `Hola Bodipo, quiero reservar sitio en el envío aéreo del ${fecha}.`;

  return (
    <div className="bg-[#ffbd59] text-[#06272b]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-center text-sm">
        <span className="font-black uppercase tracking-[.14em] text-[11px]">✈️ Próximo envío aéreo</span>
        <span className="font-black">{fecha.charAt(0).toUpperCase() + fecha.slice(1)}</span>
        <span className="font-semibold">Malabo y Bata · {cuando} · Entrega de paquetes hasta las 12:00</span>
        <span className="flex gap-2">
          <a
            href={`https://wa.me/34641992110?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#06272b] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#155e63]"
          >
            Reservar
          </a>
          <Link to="/calendario" className="rounded-full border border-[#06272b] px-3 py-1 text-[11px] font-black uppercase tracking-widest hover:bg-[#06272b] hover:text-white">
            Calendario
          </Link>
        </span>
      </div>
    </div>
  );
};

export default AnuncioProximoEnvio;
