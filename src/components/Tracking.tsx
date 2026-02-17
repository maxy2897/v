import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const Tracking: React.FC = () => {
  const { t } = useSettings();
  const [trackingId, setTrackingId] = useState('');
  const [found, setFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [error, setError] = useState('');

  const stepsOrder = ['Pendiente', 'Recogido', 'En tránsito', 'En Aduanas', 'Llegado a destino', 'Entregado'];

  const getStepIndex = (status: string) => {
    return stepsOrder.indexOf(status);
  };

  const currentStepIndex = shipmentData ? getStepIndex(shipmentData.status) : -1;

  const stepsList = [
    { label: 'Recogido', icon: 'M5 13l4 4L19 7' },
    { label: 'En tránsito', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'En Aduanas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Llegado a destino', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { label: 'Entregado', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const handleTrack = async () => {
    if (trackingId.length < 4) return;

    setIsSearching(true);
    setFound(false);
    setError('');
    setShipmentData(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/track/${trackingId}`);

      if (res.ok) {
        const data = await res.json();
        setShipmentData(data);
        setFound(true);
      } else {
        setError('Envío no encontrado. Verifique el número de rastreo.');
      }
    } catch (err) {
      setError('Error de conexión. Inténtelo más tarde.');
    } finally {
      setIsSearching(false);
    }
  };

  const getHistoryDate = (statusLabel: string) => {
    if (!shipmentData || !shipmentData.history) return '-';
    // Find the latest entry for this status
    const entry = shipmentData.history
      .slice()
      .reverse()
      .find((h: any) => h.status === statusLabel);

    if (entry) return new Date(entry.date).toLocaleDateString();

    // Special case: if status is 'Pendiente' and we are looking for 'Recogido' but it was skipped? 
    // For now just return '-' if not explicitly in history
    return '-';
  };

  return (
    <section id="rastreo" className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#001a1a] rounded-[3rem] p-12 text-white shadow-[0_30px_60px_rgba(0,26,26,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="text-center sm:text-left mb-10">
            <h2 className="text-4xl font-black mb-2">{t('track.title')}</h2>
            <p className="text-teal-400/60 text-xs font-bold uppercase tracking-widest">{t('track.subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 mb-12 relative z-10">
            <input
              type="text"
              placeholder={t('track.placeholder')}
              className="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-teal-100/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-xl font-mono uppercase"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
            <button
              onClick={handleTrack}
              disabled={isSearching || trackingId.length < 4}
              className="bg-teal-500 hover:bg-teal-400 text-teal-950 px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-teal-950 border-t-transparent rounded-full animate-spin"></div>
              ) : t('track.cta')}
            </button>
          </div>

          {error && (
            <div className="text-red-400 font-bold text-center mb-8 animate-in fade-in">
              {error}
            </div>
          )}

          {found && shipmentData && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-teal-400 text-xs font-black uppercase tracking-widest mb-1">{t('track.result.id_label')}: {trackingId}</p>
                  <p className="text-2xl font-black">{shipmentData.origin} &rarr; {shipmentData.destination}</p>
                  <p className="text-sm text-gray-400 mt-1">{shipmentData.description}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-teal-400 text-xs font-black uppercase tracking-widest mb-1">{t('track.result.status_badge')}</p>
                  <p className="text-2xl font-black text-teal-300">{shipmentData.status}</p>
                </div>
              </div>

              <div className="relative pl-8 sm:pl-12 space-y-12">
                <div className="absolute left-3.5 sm:left-4.5 top-2 bottom-2 w-0.5 bg-white/10"></div>

                {stepsList.map((step, idx) => {
                  // Determine if step is completed based on current status index
                  // We map our stepsList labels to the stepsOrder.
                  // Note: 'Recogido' is index 1 in stepsOrder.
                  // If current status is 'En tránsito' (index 2), then 'Recogido' (index 1) is completed.

                  const stepOrderIndex = stepsOrder.indexOf(step.label);
                  const isCompleted = currentStepIndex >= stepOrderIndex;
                  const isCurrent = currentStepIndex === stepOrderIndex;

                  const date = getHistoryDate(step.label);

                  return (
                    <div key={idx} className="relative group">
                      <div className={`absolute -left-8 sm:-left-12 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isCompleted
                        ? 'bg-teal-500 text-teal-950 shadow-[0_0_20px_rgba(20,184,166,0.4)] scale-110'
                        : 'bg-white/10 text-white/20'
                        }`}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full"></div>
                        )}
                      </div>
                      <div className="pl-4">
                        <p className={`text-xl font-black ${isCompleted ? 'text-white' : 'text-white/30'}`}>{step.label}</p>
                        <p className={`text-sm ${isCompleted ? 'text-teal-400' : 'text-white/20'}`}>
                          {isCompleted && date !== '-' ? date : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}


                {shipmentData.status === 'Cancelado' && (
                  <div className="relative group">
                    <div className="absolute -left-8 sm:-left-12 w-8 h-8 rounded-xl flex items-center justify-center bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <div className="pl-4">
                      <p className="text-xl font-black text-red-500 mb-1">Envío Cancelado</p>
                      <p className="text-sm text-red-400">Contacte con soporte para más información.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Tracking;
