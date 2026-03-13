import React from 'react';
import { useSettings } from '../context/SettingsContext';

const ShippingSchedule: React.FC = () => {
  const { t, appConfig } = useSettings();

  // Lógica de fechas dinámica
  const today = new Date();

  // Verify config state
  console.log('ShippingSchedule: appConfig state:', appConfig);

  // Obtener fechas desde la configuración o usar defaults
  const nextAir = appConfig?.dates?.nextAirDeparture ? new Date(appConfig.dates.nextAirDeparture) : null;
  const nextSea = appConfig?.dates?.nextSeaDeparture ? new Date(appConfig.dates.nextSeaDeparture) : null;


  // Construir lista dinámica
  const dynamicSchedule = [];
  if (nextAir) dynamicSchedule.push({ date: nextAir, type: 'Aéreo', destination: 'Malabo / Bata' });
  if (nextSea) dynamicSchedule.push({ date: nextSea, type: 'Marítimo', destination: 'Malabo / Bata' });

  // Fallback si no hay config (Fechas hardcodeadas de ejemplo)
  const fallbackSchedule = [
    { date: new Date(2026, 3, 17), type: 'Aéreo', destination: 'Malabo / Bata' },
    { date: new Date(2026, 3, 30), type: 'Aéreo', destination: 'Malabo / Bata' }
  ];

  const fullSchedule = dynamicSchedule.length > 0 ? dynamicSchedule : fallbackSchedule;
  
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

  // Referencia anual dinámica con fallback
  const schedule = appConfig?.content?.schedule;
  const rawYearlyOverview = [
    {
      month: schedule?.block1?.month || 'ENERO',
      days: schedule?.block1?.days || '2, 17 y 30'
    },
    {
      month: schedule?.block2?.month || 'FEBRERO',
      days: schedule?.block2?.days || '10 y 21'
    },
    {
      month: schedule?.block3?.month || 'MARZO',
      days: schedule?.block3?.days || '7 y 24'
    },
    {
      month: schedule?.block4?.month || 'ABRIL',
      days: schedule?.block4?.days || '11, 18 y 28'
    },
  ];

  const currentMonthNum = new Date().getMonth() + 1;
  const getMonthNumber = (monthName: string) => {
    const name = monthName?.toUpperCase().trim() || '';
    const months: Record<string, number> = {
      'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4, 'ABLIL': 4, 'MAYO': 5, 'JUNIO': 6,
      'JULIO': 7, 'AGOSTO': 8, 'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
    };
    return months[name] || 0;
  };

  const processedOverview = rawYearlyOverview
    .map(item => {
      const num = getMonthNumber(item.month);
      let dist = num === 0 ? 999 : num - currentMonthNum;
      if (dist < -6 && dist !== 999) dist += 12; // Maneja saltos de año (ej. estando en Nov, Enero es +2 meses)
      return { ...item, num, dist };
    })
    .filter(item => item.num === 0 ? item.month.trim() !== '' : item.dist >= 0)
    .sort((a, b) => a.dist - b.dist);

  return (
    <section id="calendario" className="pt-10 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 w-full">
          <div className="max-w-xl shrink-0">
            <div className="inline-flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-900">{t('schedule.status_operating')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#00151a] tracking-tighter">
              {t('schedule.title')} <br /><span className="text-[#005f6b]">{t('schedule.title_highlight')}</span>
            </h2>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 shrink-0 lg:ml-auto">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('schedule.current_month_label')}</p>
            <p className="text-xl font-black text-[#00151a] uppercase leading-none">{currentMonth}</p>
          </div>
        </div>

        {nextShipment && (
           <div className="flex justify-center mb-12">
              <div className="bg-teal-50/80 border border-teal-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm relative overflow-hidden w-full max-w-lg">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm shrink-0 border border-teal-100/50 z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div className="z-10">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Próximo Envío en Curso ({nextShipment.type})</p>
                    <p className="text-xl font-black text-[#00151a] tracking-tight leading-none">{nextShipment.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                 </div>
              </div>
           </div>
        )}



        {/* Salidas Dinámicas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {displayShipments.map((ship, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden border ${ship.highlight
                ? 'bg-[#00151a] text-white shadow-2xl shadow-teal-900/40 scale-105 z-10 border-transparent'
                : 'bg-white text-[#00151a] border-gray-100 hover:border-teal-200 shadow-sm'
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
            <div className={`hidden lg:flex flex-col justify-center items-center rounded-[2.5rem] bg-gradient-to-br from-teal-50 to-white border border-teal-100 p-8 text-center relative overflow-hidden ${displayShipments.length === 1 ? 'lg:col-span-3' :
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
                {t('schedule.notice_title')}
              </p>
              <p className="mt-1 text-sm text-amber-700 font-bold leading-relaxed">
                {t('schedule.notice_desc')}
              </p>
            </div>
          </div>
        </div>
        {/* Resumen Anual - MOVIDO AQUÍ */}
        <div className="bg-[#f8fcfc] rounded-[3rem] p-8 md:p-12 border border-teal-100 shadow-sm mb-16">
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
        <div className="bg-[#f8fcfc] rounded-[3rem] p-8 md:p-12 mb-10 shadow-sm border border-teal-100 relative overflow-hidden">
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
                    <p className="text-[10px] text-gray-500 font-medium italic">{t('services.main.desc')}</p>
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
              <div className="bg-teal-500/5 rounded-[2.5rem] p-8 border border-teal-500/10">
                <h4 className="text-xl font-black text-[#00151a] mb-6 tracking-tight">{t('services.rates.title') || 'TARIFAS'}</h4>
                <ul className="space-y-3">
                  {[
                    { label: '🇪🇸 España -> Malabo (Aéreo)', price: '11€/Kg' },
                    { label: '🇪🇸 España -> Malabo (Marítimo)', price: '4€/Kg' },
                    { label: '🇨🇲 Camerún -> Malabo (Kg)', price: '3000 XAF' },
                    { label: '🇬🇶 Documentos -> España', price: '15€' },
                    { label: '🇪🇸 Bulto 23 Kg (España)', price: '220€' }
                  ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-white/50 px-2 rounded-xl transition-colors">
                      <span className="font-bold text-gray-600 text-xs">{item.label}</span>
                      <span className="font-black text-[#007e85]">{item.price}</span>
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
