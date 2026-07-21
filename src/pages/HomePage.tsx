import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onOpenRegister: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
}

const operations = [
  { number: '01', title: 'Próximas salidas', text: 'Planifica con fechas, rutas y disponibilidad actualizadas.', to: '/calendario', action: 'Ver calendario' },
  { number: '02', title: 'Compras online', text: 'Recibe tus compras internacionales con acompañamiento local.', to: '/compras-online', action: 'Empezar a comprar' },
  { number: '03', title: 'Money Transfer', text: 'Transferencias claras, seguras y pensadas para tu día a día.', to: '/money-transfer', action: 'Enviar dinero' },
  { number: '04', title: 'Tienda Bodipo', text: 'Una selección de productos y oportunidades para nuestra comunidad.', to: '/tienda', action: 'Visitar tienda' },
];

const Arrow = () => (
  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 10h13m-5-5 5 5-5 5" />
  </svg>
);

const HomePage: React.FC<HomePageProps> = ({ onOpenRegister, onOpenContact, onOpenAbout }) => {
  const { appConfig } = useSettings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const hero = appConfig?.content?.hero;
  const heroImage = '/images/bodipo-malabo-delivery-hero.jpg';

  const submitTracking = (event: React.FormEvent) => {
    event.preventDefault();
    const code = trackingId.trim().toUpperCase();
    navigate(code ? `/rastreo?codigo=${encodeURIComponent(code)}` : '/rastreo');
  };

  return (
    <main className="overflow-hidden bg-[#f5f1e8] text-[#06272b]">
      <section className="relative isolate min-h-[620px] bg-[#06272b]">
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImage} alt="Equipo de logística de Bodipo Business" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06272b]/95 via-[#06272b]/76 to-[#06272b]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06272b]/55 via-transparent to-[#06272b]/10" />
        </div>
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full border border-teal-300/10" />
        <div className="absolute -left-8 top-40 h-44 w-44 rounded-full border border-teal-300/10" />

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl content-center gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[.52fr_.48fr] lg:px-10">
          <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }} className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-4 text-xs font-black uppercase tracking-[.24em] text-[#ffbd59]">
              <span className="h-px w-12 bg-[#ffbd59]" />
              Desde Guinea Ecuatorial al mundo
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[.98] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">
              {hero?.title || 'Movemos oportunidades.'}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#c8dad7]">
              {hero?.subtitle || 'Envíos, comercio y servicios financieros conectados por un equipo que conoce tu realidad.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/tarifas" className="group inline-flex items-center gap-3 bg-[#ffbd59] px-6 py-3.5 text-xs font-black uppercase tracking-[.13em] text-[#06272b] transition hover:bg-white">
                Calcular un envío <Arrow />
              </Link>
              <button onClick={onOpenContact} className="group inline-flex items-center gap-3 border border-white/30 px-6 py-3.5 text-xs font-black uppercase tracking-[.13em] text-white transition hover:border-white hover:bg-white hover:text-[#06272b]">
                Hablar con Bodipo <Arrow />
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .15 }} className="relative z-20 max-w-[520px] lg:col-start-1 lg:row-start-2 lg:w-full">
            <div className="border border-white/15 bg-[#f5f1e8] p-5 shadow-[0_20px_60px_rgba(0,0,0,.25)] sm:p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.25em] text-[#007e85]">Centro de seguimiento</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight">¿Dónde está tu envío?</h2>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#06272b] text-[#ffbd59]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></svg>
                </span>
              </div>
              <form onSubmit={submitTracking} className="mt-4">
                <label htmlFor="home-tracking" className="text-xs font-bold text-[#48625f]">Introduce tu número de seguimiento</label>
                <div className="mt-3 border-b-2 border-[#06272b]">
                  <input id="home-tracking" value={trackingId} onChange={(event) => setTrackingId(event.target.value.toUpperCase())} placeholder="Ej. BOD-2026-0001" className="w-full bg-transparent py-2 font-mono text-base font-bold uppercase outline-none placeholder:text-[#93a5a2]" />
                </div>
                <button type="submit" className="group mt-4 flex w-full items-center justify-between bg-[#007e85] px-5 py-3 text-xs font-black uppercase tracking-[.14em] text-white transition hover:bg-[#06272b]">
                  Consultar recorrido <Arrow />
                </button>
              </form>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#d8d3c9] pt-4 text-xs">
                <Link to="/tarifas" className="group font-black uppercase tracking-wider text-[#48625f] hover:text-[#007e85]">Tarifas <span aria-hidden="true">↗</span></Link>
                <Link to="/calendario" className="group text-right font-black uppercase tracking-wider text-[#48625f] hover:text-[#007e85]">Salidas <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8 lg:px-10 lg:pt-16">
        <div className="grid gap-10 border-b border-[#cfc8bc] pb-14 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#007e85]">El ecosistema Bodipo</p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-[-.035em] sm:text-6xl">Una cuenta.<br />Más caminos.</h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-[#48625f] lg:ml-auto">
            Hemos reunido las operaciones que más utilizas para que puedas pasar de planificar a actuar sin perder tiempo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2">
          {operations.map((operation, index) => (
            <motion.div key={operation.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .08 }}>
              <Link to={operation.to} className={`group block min-h-[280px] border-[#cfc8bc] py-10 transition hover:bg-white/70 lg:p-12 ${index % 2 === 0 ? 'lg:border-r' : ''} ${index < 2 ? 'border-b' : ''}`}>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-bold text-[#007e85]">{operation.number}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8ba09d] transition group-hover:border-[#007e85] group-hover:bg-[#007e85] group-hover:text-white"><Arrow /></span>
                </div>
                <h3 className="mt-12 text-2xl font-black tracking-tight sm:text-3xl">{operation.title}</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-[#5d716e]">{operation.text}</p>
                <span className="mt-8 inline-block text-[11px] font-black uppercase tracking-[.18em] text-[#007e85]">{operation.action}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#d9d2c7] bg-[#f5f1e8]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#007e85]">Sobre nosotros</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#06272b] sm:text-4xl">Conectamos personas, mercados y oportunidades.</h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#5d716e]">
              Bodipo Business es un equipo ecuatoguineano que facilita envíos, compras y servicios financieros entre Guinea Ecuatorial, España y Camerún con atención cercana y procesos claros.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onOpenAbout} className="border border-[#155e63] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#155e63] transition hover:bg-[#155e63] hover:text-white">Conocer al equipo</button>
            <button onClick={onOpenContact} className="bg-[#ffbd59] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#06272b] transition hover:bg-[#06272b] hover:text-white">Contactar</button>
          </div>
        </div>
      </section>
      {!isAuthenticated && (
      <section className="bg-[#007e85] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-[#b9eee8]">Tu próximo paso</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">La distancia no debería limitar tus oportunidades.</h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button onClick={onOpenRegister} className="bg-[#ffbd59] px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] text-[#06272b] transition hover:bg-white">Crear una cuenta</button>
            <button onClick={onOpenContact} className="border border-white/40 px-6 py-3.5 text-xs font-black uppercase tracking-[.14em] transition hover:bg-white hover:text-[#06272b]">Contactar</button>
          </div>
        </div>
      </section>
      )}
    </main>
  );
};

export default HomePage;