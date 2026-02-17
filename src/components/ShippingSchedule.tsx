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
    { date: new Date(2026, 0, 17), type: 'Aéreo', destination: 'Malabo / Bata' },
    { date: new Date(2026, 0, 30), type: 'Aéreo', destination: 'Malabo / Bata' }
  ];

  const fullSchedule = dynamicSchedule.length > 0 ? dynamicSchedule : fallbackSchedule;

  // Filtrar salidas futuras (incluyendo hoy)
  const upcomingShipments = fullSchedule.filter(s => {
    // Crear copia de fecha para comparar solo día/mes/año sin hora
    const sDate = new Date(s.date);
    sDate.setHours(23, 59, 59, 999);
    return sDate >= today;
  }).slice(0, 2); // Tomamos solo las 2 próximas para mostrar

  // Si no hay salidas futuras (fin de año), mostrar mensaje o fallback
  const nextShipment = upcomingShipments[0];

  // Mes a mostrar: El mes de la próxima salida
  const currentMonth = nextShipment
    ? nextShipment.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : "Próximamente";

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
  const yearlyOverview = [
    {
      month: schedule?.block1?.month || 'DICIEMBRE',
      days: schedule?.block1?.days || '12 y 19'
    },
    {
      month: schedule?.block2?.month || 'ENERO',
      days: schedule?.block2?.days || '2, 17 y 30'
    },
    {
      month: schedule?.block3?.month || 'FEBRERO',
      days: schedule?.block3?.days || '13 y 27'
    },
    {
      month: schedule?.block4?.month || 'MARZO',
      days: schedule?.block4?.days || '13 y 27'
    },
  ];

  return (
    <section id="calendario" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-900">{t('schedule.status_operating')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#00151a] tracking-tighter">
              {t('schedule.title')} <br /><span className="text-[#005f6b]">{t('schedule.title_highlight')}</span>
            </h2>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('schedule.current_month_label')}</p>
            <p className="text-xl font-black text-[#00151a]">{currentMonth}</p>
          </div>
        </div>



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

        {/* Resumen Anual */}
        <div className="bg-[#f8fcfc] rounded-[3rem] p-8 md:p-12 border border-teal-100 shadow-sm">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-10 h-10 bg-[#005f6b] rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-[#00151a] tracking-tight">{t('schedule.overview_title')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {yearlyOverview.map((item, i) => (
              <div key={i} className={`p-6 rounded-3xl border shadow-sm transition-all ${item.month === 'ENERO' ? 'bg-white border-teal-500 ring-2 ring-teal-500/10 scale-105' : 'bg-white/50 border-teal-50 grayscale-[0.5]'}`}>
                <p className="text-[10px] font-black text-[#005f6b] uppercase tracking-[0.2em] mb-3">{item.month}</p>
                <p className="text-xl font-black text-[#00151a] tracking-tight">{item.days}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.month === 'ENERO' ? 'bg-teal-500' : 'bg-gray-300'}`}></span>
                  {item.month === 'ENERO' ? t('schedule.current_month_badge') : t('schedule.programming_badge')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShippingSchedule;
