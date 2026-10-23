import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppConfig } from '../../types';
import { useIrAlSeguimiento } from './Header';
import { AGENCIAS, EMAIL, HORARIO, REDES, enlaceTelefono } from '../constants/empresa';

interface FooterProps {
  config: AppConfig;
  onOpenCookies: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
}

type Enlace = { label: string; to?: string; href?: string; onClick?: () => void };

const WHATSAPP = 'https://wa.me/34641992110';

const Flecha = ({ abierto }: { abierto: boolean }) => (
  <svg className={`h-5 w-5 transition-transform duration-200 lg:hidden ${abierto ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  </svg>
);

const Footer: React.FC<FooterProps> = ({ config, onOpenCookies, onOpenContact, onOpenAbout }) => {
  const irAlSeguimiento = useIrAlSeguimiento();
  const [abierta, setAbierta] = useState<string | null>(null);

  const secciones: { titulo: string; enlaces: Enlace[] }[] = [
    {
      titulo: 'Envíos',
      enlaces: [
        { label: 'Seguimiento de envío', onClick: irAlSeguimiento },
        { label: 'Tarifas y calculadora', to: '/tarifas' },
        { label: 'Próximas salidas', to: '/calendario' },
        { label: 'Compras online', to: '/compras-online' },
      ],
    },
    {
      titulo: 'Bodipo Business',
      enlaces: [
        { label: 'Quiénes somos', onClick: onOpenAbout },
        { label: 'Money Transfer', to: '/money-transfer' },
        { label: 'Tienda Bodipo', to: '/tienda' },
        { label: 'Mapa del sitio', to: '/mapa-del-sitio' },
      ],
    },
    {
      titulo: 'Contacto',
      enlaces: [
        ...AGENCIAS.map((ag) => ({ label: `${ag.pais}: ${ag.telefono}`, href: enlaceTelefono(ag.telefono) })),
        { label: EMAIL, href: `mailto:${EMAIL}` },
        { label: HORARIO },
      ],
    },
    {
      titulo: 'Ayuda',
      enlaces: [
        { label: 'Cómo enviar', onClick: () => { irAlSeguimiento(); setTimeout(() => document.getElementById('como-enviar')?.scrollIntoView({ behavior: 'smooth' }), 400); } },
        { label: 'Puntos de recogida', onClick: () => { irAlSeguimiento(); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 400); } },
        { label: 'Escríbenos', onClick: onOpenContact },
        { label: 'Preguntar a Bodipo', onClick: () => window.dispatchEvent(new CustomEvent('open-bodipo-chat')) },
      ],
    },
  ];

  const pintarEnlace = (e: Enlace) => {
    const clase = 'text-[15px] text-[#A9C3CB] transition hover:text-white';
    if (e.to) return <Link to={e.to} className={clase}>{e.label}</Link>;
    if (e.href) return <a href={e.href} target={e.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={clase}>{e.label}</a>;
    if (e.onClick) return <button onClick={e.onClick} className={`${clase} text-left`}>{e.label}</button>;
    return <span className="text-[15px] text-[#A9C3CB]">{e.label}</span>;
  };

  return (
    <footer className="relative z-40 bg-[#0E2A3B] text-white">
      {/* Franja superior con la flecha de marca */}
      <div className="flex items-center overflow-hidden pt-12 lg:pt-16" aria-hidden="true">
        <span className="h-[3px] flex-1 bg-white/90" />
        <svg className="-ml-1 h-8 w-8 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="m8 4 8 8-8 8" /></svg>
        <span className="ml-3 mr-[18%] h-9 w-9 rounded-full bg-[#2E9E3E]" />
      </div>

      <div className="w-full px-5 pb-6 pt-8 sm:px-8 lg:px-16 lg:pt-12 xl:px-24">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-10">
          <div className="mb-6 lg:mb-0">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-[50px] w-[50px] place-items-center rounded-xl bg-white"><img src="/images/logo-bodipo.png" className="w-[40px]" alt="" /></span>
              <span className="flex flex-col">
                <span className="font-display text-2xl font-bold uppercase leading-none tracking-[.04em]">Bodipo Business</span>
                <span className="mt-1 text-[13px] uppercase tracking-[.12em] text-[#A9C3CB]">Cada envío cuenta</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#8FB0BA]">
              Envíos aéreos entre España, Guinea Ecuatorial y Camerún, con seguimiento de cada paquete.
            </p>
          </div>

          {secciones.map((s) => {
            const abierto = abierta === s.titulo;
            return (
              <div key={s.titulo} className="border-b border-white/15 lg:border-0">
                <button
                  onClick={() => setAbierta(abierto ? null : s.titulo)}
                  className="flex w-full items-center justify-between py-5 text-left font-display text-2xl font-bold uppercase tracking-[.04em] lg:pointer-events-none lg:py-0 lg:text-lg"
                  aria-expanded={abierto}
                >
                  {s.titulo}
                  <Flecha abierto={abierto} />
                </button>
                <ul className={`${abierto ? 'flex' : 'hidden'} flex-col gap-3 pb-5 lg:mt-4 lg:flex lg:pb-0`}>
                  {s.enlaces.map((e) => <li key={e.label}>{pintarEnlace(e)}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Redes y contacto rápido */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 transition hover:border-[#7FD08A] hover:text-[#7FD08A]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.4z" /></svg>
          </a>
          <a href={REDES.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 transition hover:border-[#7FD08A] hover:text-[#7FD08A]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
          </a>
          <a href={REDES.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 transition hover:border-[#7FD08A] hover:text-[#7FD08A]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" /></svg>
          </a>
          <a href={`mailto:${EMAIL}`} aria-label="Correo" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 transition hover:border-[#7FD08A] hover:text-[#7FD08A]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          </a>
        </div>

        {/* Enlaces legales */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/15 pt-6 text-sm text-[#A9C3CB] lg:flex-row lg:justify-between">
          <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2" aria-label="Enlaces legales">
            <Link to="/privacidad" className="px-3 hover:text-white">Política de privacidad</Link>
            <span className="h-4 w-px bg-white/40" aria-hidden="true" />
            <button onClick={onOpenCookies} className="px-3 hover:text-white">Cookies</button>
            <span className="h-4 w-px bg-white/40" aria-hidden="true" />
            <Link to="/condiciones" className="px-3 hover:text-white">Condiciones de uso</Link>
          </nav>
          <p className="text-[#8FB0BA]">© {new Date().getFullYear()} Bodipo Business S.L.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// Botón fijo "Seguimiento envío" junto al chat, como en las webs de paquetería.
export const SeguimientoFlotante: React.FC = () => {
  const irAlSeguimiento = useIrAlSeguimiento();
  return (
    <button
      onClick={irAlSeguimiento}
      className="fixed bottom-[46px] right-[116px] z-40 hidden h-14 md:flex items-center gap-2.5 rounded-full bg-[#2E9E3E] pl-5 pr-6 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,.25)] transition hover:bg-[#0E2A3B] sm:right-[124px]"
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" /></svg>
      Seguimiento envío
    </button>
  );
};
