import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface HomePageProps {
  onOpenRegister: () => void;
  onOpenContact: () => void;
}

const actions = [
  { title: 'Tarifas y tiempos', subtitle: 'Calcula tu envío', to: '/tarifas', icon: 'M4 3h16v18H4zM8 7h8M8 12h2m4 0h2M8 16h2m4 0h2' },
  { title: 'Seguimiento', subtitle: 'Localiza tu paquete', to: '/rastreo', featured: true, icon: 'M10 18a8 8 0 1 1 5.3-2m5.7 5-5.2-5.2M9 8h5v5H9z' },
  { title: 'Realizar un envío', subtitle: 'Empieza ahora', to: '/tarifas', icon: 'm21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8m-9 5v8' },
];

const services = [
  { title: 'Próximas salidas', text: 'Consulta nuestro calendario de envíos.', to: '/calendario', icon: 'M3 5h18v16H3zM8 3v4m8-4v4M3 10h18' },
  { title: 'Compras online', text: 'Compra en tus tiendas favoritas sin fronteras.', to: '/compras-online', icon: 'M3 4h2l2.4 11.2h11L21 8H6M9 20h.01M19 20h.01' },
  { title: 'Money Transfer', text: 'Envía dinero de forma sencilla y segura.', to: '/money-transfer', icon: 'M7 7h11l-3-3m3 3-3 3m2 7H6l3 3m-3-3 3-3M12 3a9 9 0 1 0 9 9' },
  { title: 'Tienda Bodipo', text: 'Productos y oportunidades seleccionadas.', to: '/tienda', icon: 'M3 10h18l-2-6H5l-2 6Zm2 0v10h14V10M9 20v-6h6v6' },
];

const LineIcon = ({ path, className = 'h-9 w-9' }: { path: string; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={path} />
  </svg>
);

const HomePage: React.FC<HomePageProps> = ({ onOpenRegister, onOpenContact }) => {
  const { appConfig } = useSettings();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const hero = appConfig?.content?.hero;
  const heroImage = hero?.heroImage || '/images/foto-original.jpg';

  const submitTracking = (event: React.FormEvent) => {
    event.preventDefault();
    const code = trackingId.trim().toUpperCase();
    navigate(code ? `/rastreo?codigo=${encodeURIComponent(code)}` : '/rastreo');
  };

  return (
    <main className="bg-white text-[#00151a]">
      <section className="relative min-h-[610px] overflow-hidden bg-[#00151a]">
        <img src={heroImage} alt="Servicio logístico de Bodipo Business" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00151a]/95 via-[#00151a]/72 to-[#00151a]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00151a]/75 via-transparent to-black/15" />

        <div className="relative mx-auto flex min-h-[610px] max-w-7xl flex-col items-center justify-center px-4 pb-12 pt-16 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="max-w-4xl text-white">
            <span className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.22em] backdrop-blur-sm">Logística, comercio y servicios</span>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{hero?.title || 'Conectamos lo que importa'}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-xl">{hero?.subtitle || 'Soluciones de envío y servicios internacionales pensados para acercarte a nuevas oportunidades.'}</p>
          </motion.div>

          <div className="mt-10 grid w-full max-w-3xl grid-cols-1 overflow-hidden shadow-2xl sm:grid-cols-3">
            {actions.map((action) => (
              <Link key={action.title} to={action.to} className={`group flex min-h-32 items-center justify-center gap-4 border-b border-gray-200 px-5 py-6 text-left transition sm:flex-col sm:gap-2 sm:border-b-0 sm:border-r sm:text-center last:border-0 ${action.featured ? 'bg-[#007e85] text-white hover:bg-[#006a70]' : 'bg-white text-[#00151a] hover:bg-teal-50'}`}>
                <LineIcon path={action.icon} />
                <div><strong className="block text-sm font-black uppercase tracking-wide">{action.title}</strong><span className={`mt-1 block text-xs ${action.featured ? 'text-white/75' : 'text-gray-500'}`}>{action.subtitle}</span></div>
              </Link>
            ))}
          </div>

          <form onSubmit={submitTracking} className="mt-5 flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:gap-0" aria-label="Seguimiento de envíos">
            <label htmlFor="home-tracking" className="sr-only">Número de seguimiento</label>
            <input id="home-tracking" value={trackingId} onChange={(e) => setTrackingId(e.target.value.toUpperCase())} placeholder="NÚMERO DE SEGUIMIENTO" className="min-h-16 flex-1 border-0 bg-white px-6 text-base font-semibold uppercase text-[#00151a] outline-none ring-[#007e85] placeholder:text-gray-400 focus:ring-4" />
            <button type="submit" className="min-h-16 bg-[#f59e0b] px-9 text-sm font-black uppercase tracking-[.12em] text-[#00151a] transition hover:bg-amber-400">Buscar</button>
          </form>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <Link to="/calendario" className="mx-auto flex max-w-5xl items-start gap-4 border-l-4 border-[#f59e0b] bg-amber-50 px-5 py-5 text-sm text-gray-700 transition hover:bg-amber-100 sm:items-center">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] font-black text-[#00151a] sm:mt-0">!</span>
          <span><strong className="text-[#00151a]">Planifica tu próximo envío.</strong> Consulta fechas de salida, destinos y disponibilidad en nuestro calendario.</span>
          <span className="ml-auto hidden font-black text-[#007e85] sm:block">Ver calendario →</span>
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[.25em] text-[#007e85]">Todo en un solo lugar</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Gestiona tus operaciones</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">Accede rápidamente a los servicios de Bodipo Business y elige la solución que necesitas.</p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link key={service.title} to={service.to} className="group bg-white px-7 py-10 text-center transition hover:bg-teal-50">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#007e85] text-[#007e85] transition group-hover:bg-[#007e85] group-hover:text-white"><LineIcon path={service.icon} /></span>
              <h3 className="mt-6 text-base font-black uppercase tracking-wide">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{service.text}</p>
              <span className="mt-5 inline-block text-xs font-black uppercase tracking-widest text-[#007e85]">Acceder →</span>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-7 bg-[#00151a] px-7 py-10 text-white sm:flex-row sm:px-12">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-teal-300">¿Necesitas ayuda?</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Te ayudamos a elegir la mejor solución.</h2></div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button onClick={onOpenContact} className="border border-white/40 px-6 py-3 text-xs font-black uppercase tracking-wider transition hover:bg-white hover:text-[#00151a]">Contactar</button>
            <button onClick={onOpenRegister} className="bg-[#f59e0b] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#00151a] transition hover:bg-amber-400">Crear cuenta</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
