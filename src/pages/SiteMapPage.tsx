import React from 'react';
import { Link } from 'react-router-dom';

const groups = [
  { title: 'Envíos y logística', links: [{ label: 'Calcular tarifas', to: '/tarifas' }, { label: 'Seguimiento', to: '/rastreo' }, { label: 'Calendario de salidas', to: '/calendario' }] },
  { title: 'Servicios', links: [{ label: 'Money Transfer', to: '/money-transfer' }, { label: 'Compras online', to: '/compras-online' }, { label: 'Tienda Bodipo', to: '/tienda' }] },
  { title: 'Cuenta y ayuda', links: [{ label: 'Acceso de clientes', to: '/acceso' }, { label: 'Panel personal', to: '/dashboard' }, { label: 'Notificaciones', to: '/notificaciones' }] },
  { title: 'Información legal', links: [{ label: 'Condiciones de uso', to: '/condiciones' }, { label: 'Política de privacidad', to: '/privacidad' }] },
];

const SiteMapPage: React.FC = () => (
  <main className="min-h-screen bg-[#f5f1e8] px-5 py-16 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007e85]">Navegación</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-[#06272b] sm:text-5xl">Mapa del sitio</h1>
      <p className="mt-5 max-w-2xl text-[#5d716e]">Encuentra rápidamente todas las áreas y servicios disponibles en Bodipo Business.</p>
      <div className="mt-12 grid gap-px overflow-hidden border border-[#d9d2c7] bg-[#d9d2c7] sm:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title} className="bg-white p-7 sm:p-9">
            <h2 className="text-lg font-black text-[#06272b]">{group.title}</h2>
            <ul className="mt-5 space-y-3">
              {group.links.map((link) => (
                <li key={link.to}><Link to={link.to} className="group flex items-center justify-between text-sm font-semibold text-[#5d716e] hover:text-[#007e85]">{link.label}<span className="transition-transform group-hover:translate-x-1">→</span></Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </main>
);
export default SiteMapPage;