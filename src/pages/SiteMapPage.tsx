import React from 'react';
import { Link } from 'react-router-dom';

const groups = [
  { title: 'Hazte cliente', links: [{ label: 'Obtener presupuesto', to: '/tarifas' }, { label: 'Abrir una cuenta', to: '/acceso' }] },
  { title: 'Precios', links: [{ label: 'Tarifas', to: '/tarifas' }, { label: 'Próximas salidas', to: '/calendario' }, { label: 'Obtener presupuesto', to: '/tarifas' }] },
  { title: 'Envía con Bodipo', links: [{ label: 'Realizar un envío', to: '/tarifas' }, { label: 'Calendario de envíos', to: '/calendario' }] },
  { title: 'Soluciones de servicio', links: [{ label: 'Compras online', to: '/compras-online' }, { label: 'Money Transfer', to: '/money-transfer' }, { label: 'Tienda Bodipo', to: '/tienda' }] },
  { title: 'Seguimiento', links: [{ label: 'Seguimiento de envíos', to: '/rastreo' }, { label: 'Mis envíos', to: '/dashboard' }] },
  { title: 'Ayuda', links: [{ label: 'Centro de ayuda', to: '/dashboard?tab=help' }, { label: 'Preguntas y condiciones', to: '/condiciones' }, { label: 'Notificaciones', to: '/notificaciones' }] },
  { title: 'Cuenta', links: [{ label: 'Iniciar sesión', to: '/acceso' }, { label: 'Panel personal', to: '/dashboard' }, { label: 'Ajustes de cuenta', to: '/dashboard?tab=settings' }] },
  { title: 'Nuestra empresa', links: [{ label: 'Sobre Bodipo Business', to: '#about' }, { label: 'Página de inicio', to: '/' }, { label: 'Contactar', to: '/#ayuda' }] },
  { title: 'Información legal', links: [{ label: 'Condiciones de uso', to: '/condiciones' }, { label: 'Política de privacidad', to: '/privacidad' }] },
];

const SiteMapPage: React.FC = () => (
  <main className="min-h-screen bg-white px-5 py-14 sm:px-8 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <h1 className="text-center text-4xl font-light tracking-tight text-[#06272b] sm:text-5xl">Mapa del sitio</h1>

      <div className="mt-16 grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-xl font-medium text-[#06272b]">{group.title}</h2>
            <ul className="mt-6 space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.to === '#about' ? (
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-bodipo-about'))} className="text-left text-[15px] font-bold text-[#007eae] transition hover:text-[#155e63] hover:underline">{link.label}</button>
                  ) : (
                    <Link to={link.to} className="text-[15px] font-bold text-[#007eae] transition hover:text-[#155e63] hover:underline">{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  </main>
);

export default SiteMapPage;