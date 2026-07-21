import React from 'react';
import { Link } from 'react-router-dom';
import { TERMS_AND_CONDITIONS } from '../constants/terms';
import { useSettings } from '../context/SettingsContext';

const TermsPage: React.FC = () => {
  const { t } = useSettings();
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007e85]">Información legal</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[#06272b] sm:text-5xl">Condiciones de uso</h1>
        <p className="mt-5 max-w-3xl leading-relaxed text-[#5d716e]">Condiciones aplicables a los servicios de logística, transporte y atención prestados por Bodipo Business.</p>
        <div className="mt-12 space-y-4">
          {TERMS_AND_CONDITIONS.map((term, index) => (
            <section key={term.title} className="border border-[#d9d2c7] bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#155e63] text-xs font-black text-white">{index + 1}</span>
                <div>
                  <h2 className="text-lg font-black text-[#06272b]">{t('terms.title.' + (index + 1)) || term.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[#5d716e]">{t('terms.content.' + (index + 1)) || term.content}</p>
                </div>
              </div>
            </section>
          ))}
        </div>
        <Link to="/" className="mt-10 inline-flex bg-[#155e63] px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#06272b]">Volver al inicio</Link>
      </div>
    </main>
  );
};
export default TermsPage;