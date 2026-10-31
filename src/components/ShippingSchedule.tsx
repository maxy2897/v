import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { SALIDAS_AEREAS } from '../constants/salidas';

const ShippingSchedule: React.FC = () => {
  const { t } = useSettings();

  // Lógica de fechas dinámica
  const today = new Date();


  // Calendario oficial de salidas aéreas (España → Malabo / Bata)
  const fullSchedule = SALIDAS_AEREAS.map(date => ({ date, type: 'Aéreo', destination: 'Malabo / Bata' }));
  
  // Ensure chronologically sorted items so that we accurately get the 'next' ones
  fullSchedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Filtrar salidas futuras (incluyendo hoy)
  const upcomingShipments = fullSchedule.filter(s => {
    // Crear copia de fecha para comparar solo día/mes/año sin hora
    const sDate = new Date(s.date);
    sDate.setHours(23, 59, 59, 999);
    return sDate >= today;
  }).slice(0, 2); // Tomamos solo las 2 próximas para mostrar

  // Si no hay salidas futuras, definimos nextShipment como null
  const nextShipment = upcomingShipments.length > 0 ? upcomingShipments[0] : null;

  // Mes a mostrar: El mes actual siempre
  const currentMonth = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Formatear para visualización
  const displayShipments = upcomingShipments.map((s, index) => ({
    day: s.date.getDate().toString(),
    monthName: s.date.toLocaleDateString('es-ES', { month: 'long' }),
    type: s.type,
    status: t('schedule.book_slot'),
    destination: s.destination,
    highlight: index === 0 // La primera de la lista es la próxima salida (destacada)
  }));

  // Resumen por meses: solo meses que aún no han terminado
  const processedOverview = [
    { month: 'OCTUBRE', year: 2026, m: 9, days: '13 y 27' },
    { month: 'NOVIEMBRE', year: 2026, m: 10, days: '10 y 28' },
    { month: 'DICIEMBRE', year: 2026, m: 11, days: '8, 22 y 29' },
  ]
    .filter(item => new Date(item.year, item.m + 1, 1) > today)
    .map(item => ({ ...item, dist: (item.year - today.getFullYear()) * 12 + item.m - today.getMonth() }));

  return (
    <section id="calendario" className="pt-10 pb-24 relative overflow-hidden bg-[#f5f1e8] [clip-path:inset(0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-2 gap-6 w-full">
          <div className="max-w-xl shrink-0 pt-2">
            <div className="inline-flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-900">{t('schedule.status_operating')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#00151a] tracking-tighter">
              {t('schedule.title')} <br /><span className="text-[#005f6b]">{t('schedule.title_highlight')}</span>
            </h2>
          </div>

          <div className="bg-transparent border border-white/5 shrink-0 lg:ml-auto">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('schedule.current_month_label')}</p>
            <p className="text-xl font-black text-[#00151a] uppercase leading-none">{currentMonth}</p>
          </div>
        </div>

        {/* Panel Centralizado - Ubicado en el "espacio" pero más abajo */}
        <div className="flex justify-center mb-16 mt-4">
           {nextShipment && (
              <div className="bg-teal-50/10 dark:bg-teal-900/10 backdrop-blur-md border border-teal-100/20 rounded-2xl p-5 flex items-center gap-5 shadow-sm relative overflow-hidden w-full max-w-lg">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm shrink-0 border border-teal-100/50 z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div className="z-10">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Próximo Envío en Curso ({nextShipment.type})</p>
                    <p className="text-xl font-black text-[#00151a] tracking-tight leading-none">{nextShipment.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                 </div>
              </div>
           )}
        </div>



        {/* Salidas Dinámicas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {displayShipments.map((ship, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-[1.5rem] transition-all duration-500 overflow-hidden border ${ship.highlight
                ? 'bg-[#0b4f55] text-white shadow-2xl shadow-teal-900/40 scale-105 z-10 border-transparent'
                : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-[#00151a] dark:text-white border-white/20 hover:border-teal-200/50 shadow-sm'
                }`}
            >
              {ship.highlight && (
                <div className="absolute top-0 right-0 bg-teal-500 text-[#00151a] px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                  {t('schedule.next_departure')}
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-5xl font-black tracking-tighter">{ship.day}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">{ship.monthName}</span>
                </div>
                <div className={`p-3 rounded-2xl ${ship.highlight ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-50 text-gray-400'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${ship.highlight ? 'text-teal-400' : 'text-gray-400'}`}>{t('schedule.service_type')}</p>
                  <p className="font-bold text-lg">{ship.type}</p>
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${ship.highlight ? 'text-teal-400' : 'text-gray-400'}`}>{t('schedule.destination')}</p>
                  <p className="font-bold text-sm opacity-80">{ship.destination}</p>
                </div>
                <div className="pt-4 border-t border-current opacity-10 flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest text-teal-500`}>
                    {ship.status}
                  </span>
                  <button className={`text-[10px] font-black underline uppercase tracking-widest ${ship.highlight ? 'text-white' : 'text-[#00151a]'}`}>
                    {t('schedule.book_slot')}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayShipments.length > 0 && displayShipments.length < 4 && (
            <div className={`hidden lg:flex flex-col justify-center items-center rounded-[1.5rem] bg-gradient-to-br from-teal-50 to-white border border-teal-100 p-8 text-center relative overflow-hidden ${displayShipments.length === 1 ? 'lg:col-span-3' :
                displayShipments.length === 2 ? 'lg:col-span-2' :
                  'lg:col-span-1'
              }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="w-20 h-20 bg-teal-100/50 rounded-full flex items-center justify-center mb-6 relative z-10 border border-teal-200 shadow-sm">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <h3 className="text-2xl font-black text-[#00151a] tracking-tight mb-3 relative z-10">
                {t('schedule.promo.title') || 'Prepara tu próximo envío'}
              </h3>
              <p className="text-sm text-gray-500 font-medium relative z-10 max-w-sm">
                {t('schedule.promo.desc') || 'Asegura tu espacio reservando con antelación. Contáctanos para asesoramiento personalizado.'}
              </p>
            </div>
          )}

        </div>

        {/* Notice moved here */}
        <div className="mb-10 bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-2xl shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-black text-amber-800 uppercase tracking-widest">
                Aviso importante
              </p>
              <p className="mt-1 text-sm text-amber-700 font-bold leading-relaxed">
                Los paquetes se pueden entregar hasta las 12:00 del mismo día de salida. Envíos marítimos: consulta las fechas con nuestro equipo. Las fechas de diciembre pueden variar según el stock de mercancía.
              </p>
            </div>
          </div>
        </div>
        {/* Resumen Anual - MOVIDO AQUÍ */}
        <div className="bg-transparent rounded-[1.75rem] p-8 md:p-12 border border-white/5 shadow-sm mb-16">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-10 h-10 bg-[#005f6b] rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-[#00151a] tracking-tight">{t('schedule.overview_title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processedOverview.map((item, i) => {
              const dist = item.dist;
              const isCurrent = dist === 0;
              return (
                <div key={i} className={`p-6 rounded-3xl border shadow-sm transition-all flex flex-col h-full ${isCurrent ? 'bg-white border-teal-500 ring-4 ring-teal-500/20 scale-105 shadow-xl relative z-10' : 'bg-gray-50/50 border-gray-100 hover:border-teal-200'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isCurrent ? 'text-teal-600' : 'text-gray-400'}`}>{item.month}</p>
                  <p className="text-2xl font-black text-[#00151a] tracking-tight">{item.days}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isCurrent ? 'bg-teal-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    {isCurrent ? t('schedule.current_month_badge') : t('schedule.programming_badge')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Services Integrated From ServicesPage --- */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-[1.75rem] p-8 md:p-12 mb-10 shadow-sm border border-teal-100 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00151a]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="w-3 h-3 bg-teal-500 rounded-full"></span>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#00151a]">{t('services.routes_badge') || 'SERVICIOS ACTIVOS'}</h3>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#00151a] tracking-tighter mb-8 leading-tight">
                {t('services.title')} <br /><span className="text-[#007e85]">{t('services.title_highlight')}</span>
              </h2>
              <div className="space-y-6">
                <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100 flex items-center space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                    <span className="text-2xl leading-none">🇪🇸 ➔ 🇬🇶</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-teal-800">{t('services.main.badge')}</p>
                    <p className="text-lg font-bold text-[#00151a]">{t('services.main.name')}</p>
                    <p className="text-[10px] text-gray-500 font-medium italic">Envíos aéreos desde 14€/Kg y marítimos por m³.</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#00151a] shadow-sm shrink-0">
                    <span className="text-2xl leading-none">🇨🇲 ➔ 🇬🇶</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('services.regional.badge')}</p>
                    <p className="text-lg font-bold text-[#00151a]">{t('services.regional.name')}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{t('services.regional.desc')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#00151a] shadow-sm shrink-0">
                    <span className="text-2xl leading-none">🇬🇶 ➔ 🇬🇶</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('services.national.badge')}</p>
                    <p className="text-lg font-bold text-[#00151a]">{t('services.national.name')}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{t('services.national.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-teal-500/5 rounded-[1.5rem] p-8 border border-teal-500/10">
                <h4 className="text-xl font-black text-[#00151a] mb-6 tracking-tight">{t('services.rates.title') || 'TARIFAS'}</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'España → Malabo (Aéreo)', price: '14€/Kg' },
                    { label: 'España → Bata (Aéreo)', price: '16€/Kg' },
                    { label: 'España → Guinea (Marítimo)', price: '470€/m³' },
                    { label: 'Marítimo: paquetes pequeños o cajas', price: 'desde 80€' },
                    { label: 'Camerún → Malabo (Kg)', price: '3000 XAF' },
                    { label: 'Documentos desde España', price: '20€' },
                    { label: 'Documentos desde Guinea', price: '25.000 XAF' },
                    { label: 'Bulto 23 Kg (Malabo / Bata)', price: '320€ / 360€' },
                    { label: 'Bulto 32 Kg (Malabo / Bata)', price: '440€ / 500€' }
                  ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-white/50 px-2 rounded-xl transition-colors">
                      <span className="font-bold text-gray-600 text-xs">{item.label}</span>
                      <span className="font-black text-[#007e85] text-right whitespace-nowrap pl-3">{item.price}</span>
                    </li>
                  ))}
                </ul>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default ShippingSchedule;
