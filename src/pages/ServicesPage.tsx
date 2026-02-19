import React from 'react';
import { useSettings } from '../context/SettingsContext';

const ServicesPage: React.FC = () => {
    const { t } = useSettings();
    return (
        <>
            {/* Info Almacén Section */}
            <section className="py-12 bg-white border-y border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00151a]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#00151a]">{t('services.routes_badge')}</h3>
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
                                    <h4 className="text-xl font-black text-[#00151a] mb-6 tracking-tight">{t('services.rates.title')}</h4>
                                    <ul className="space-y-3">
                                        {[
                                            { label: '🇪🇸 España -> Malabo (Aéreo)', price: '11€/Kg' },
                                            { label: '🇪🇸 España -> Malabo (Marítimo)', price: '4€/Kg' },
                                            { label: '🇨🇲 Camerún -> Malabo (Kg)', price: '3000 XAF' },
                                            { label: '🇬🇶 Documentos -> España', price: '15€' },
                                            { label: '🇪🇸 Bulto 23 Kg (España)', price: '220€' }
                                        ].map((item, i) => (
                                            <li key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
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
            </section>
        </>
    );
};

export default ServicesPage;
