import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const Tracking: React.FC = () => {
  const { t } = useSettings();
  const [trackingId, setTrackingId] = useState('');
  const [found, setFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const mockSteps = [
    { date: t('track.date.ongoing'), status: t('track.step.registered'), location: t('track.loc.madrid'), completed: true },
    { date: '-', status: t('track.step.pending'), location: t('track.loc.alcala'), completed: false },
    { date: '-', status: t('track.step.transit'), location: t('track.loc.barajas'), completed: false },
    { date: '-', status: t('track.step.arrival'), location: t('track.loc.customs'), completed: false },
  ];

  const handleTrack = () => {
    if (trackingId.length < 4) return;

    setIsSearching(true);
    setFound(false);

    setTimeout(() => {
      setFound(true);
      setIsSearching(false);
    }, 800);
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

          {found && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-teal-400 text-xs font-black uppercase tracking-widest mb-1">{t('track.result.id_label')}: {trackingId}</p>
                  <p className="text-2xl font-black">{t('track.result.status_main')}</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-teal-400 text-xs font-black uppercase tracking-widest mb-1">{t('track.result.status_badge')}</p>
                  <p className="text-2xl font-black text-teal-300">{t('track.result.status_loc')}</p>
                </div>
              </div>

              <div className="relative pl-8 sm:pl-12 space-y-12">
                <div className="absolute left-3.5 sm:left-4.5 top-2 bottom-2 w-0.5 bg-white/10"></div>
                {mockSteps.map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-8 sm:-left-12 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${step.completed
                      ? 'bg-teal-500 text-teal-950 shadow-[0_0_20px_rgba(20,184,166,0.4)] scale-110'
                      : 'bg-white/10 text-white/20'
                      }`}>
                      {step.completed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                      )}
                    </div>
                    <div className="pl-4">
                      <p className={`text-xl font-black ${step.completed ? 'text-white' : 'text-white/30'}`}>{step.status}</p>
                      <p className={`text-sm ${step.completed ? 'text-teal-400' : 'text-white/20'}`}>{step.location} <span className="mx-2">/</span> {step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Tracking;
