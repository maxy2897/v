import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface HomePageProps {
    onOpenRegister: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenRegister }) => {
    const { t, appConfig } = useSettings();
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-full bg-white -z-10"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-teal-50/20 to-transparent -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                        <div className="lg:col-span-7 space-y-8">
                            <h1 className="text-5xl md:text-7xl font-black text-[#00151a] tracking-tighter leading-[0.9]">
                                {appConfig?.content?.hero?.title || t('home.hero.title')}
                            </h1>

                            <p className="text-xl text-gray-500 max-w-xl leading-relaxed font-medium">
                                {appConfig?.content?.hero?.subtitle || t('home.hero.subtitle')}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <a href="/tarifas" className="px-10 py-5 bg-[#00151a] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#007e85] transition-all shadow-2xl shadow-teal-900/40">
                                    {appConfig?.content?.hero?.ctaPrimary || t('home.hero.cta_ship')}
                                </a>
                                <a
                                    href="/acceso"
                                    className="px-10 py-5 bg-teal-500 text-[#00151a] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20"
                                >
                                    {appConfig?.content?.hero?.ctaSecondary || t('home.hero.cta_register')}
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-5 mt-16 lg:mt-0 relative">
                            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] bg-[#00151a]">
                                <img
                                    className="w-full h-[500px] object-cover scale-110 transition-transform duration-700 hover:scale-125"
                                    src="/images/hero-home.jpg"
                                    alt="Carga BodipoBusiness"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#00151a] via-transparent to-transparent"></div>
                                <div className="absolute bottom-10 left-10 text-white">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-px bg-teal-500"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">{t('home.hero.star_service')}</span>
                                    </div>
                                    <p className="text-3xl font-black flex items-center gap-3">🇪🇸 {t('home.hero.route')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Money Transfer Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#00151a] rounded-[3rem] overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-500/10 -z-0"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
                            <div className="p-12 md:p-20 flex flex-col justify-center">
                                <div className="inline-flex items-center space-x-2 bg-teal-500/10 px-4 py-2 rounded-full mb-8 w-fit">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">{t('home.money.badge')}</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8">
                                    {t('home.money.title')} <br />
                                    <span className="text-teal-400">{t('home.money.title_highlight')}</span>
                                </h2>
                                <p className="text-gray-400 text-lg font-medium leading-relaxed mb-12 max-w-md">
                                    {t('home.money.desc')}
                                </p>
                                <a
                                    href="/money-transfer"
                                    className="inline-flex items-center justify-center px-10 py-5 bg-teal-500 text-[#00151a] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 w-fit"
                                >
                                    {t('home.money.cta')}
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                            <div className="relative h-[400px] lg:h-auto overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00151a] to-transparent z-10 lg:block hidden"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=1200"
                                    alt="Money Transfer"
                                    className="w-full h-full object-cover lg:scale-110"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-[#00151a] font-bold text-xs uppercase tracking-[0.2em] mb-8">
                        {t('home.social.follow')}
                    </p>
                    <div className="flex justify-center space-x-8">
                        {/* TikTok */}
                        <a
                            href={appConfig?.content?.social?.tiktok || "https://www.tiktok.com/@b.businnes?is_from_webapp=1&sender_device=pc"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                            title="Visítanos en TikTok"
                        >
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black text-white transition-all duration-300 shadow-lg shadow-gray-300/50 group-hover:scale-110 group-hover:shadow-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </div>
                        </a>

                        {/* WhatsApp Channel */}
                        <a
                            href={appConfig?.content?.social?.whatsapp || "https://whatsapp.com/channel/0029Vb49nL9DOQISuab0Tl3V"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                            title="Únete a nuestro canal de WhatsApp"
                        >
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#25D366] text-white transition-all duration-300 shadow-lg shadow-green-200/50 group-hover:scale-110 group-hover:shadow-green-300/50 group-hover:shadow-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                </svg>
                            </div>
                        </a>

                        {/* Instagram */}
                        <a
                            href={appConfig?.content?.social?.instagram || "https://www.instagram.com/bodipo_business?igsh=M3hjNXV2b2xydnhj"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                            title="Síguenos en Instagram"
                        >
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white transition-all duration-300 shadow-lg shadow-pink-200/50 group-hover:scale-110 group-hover:shadow-pink-300/50 group-hover:shadow-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                </svg>
                            </div>
                        </a>

                        {/* Facebook */}
                        <a
                            href={appConfig?.content?.social?.facebook || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                            title="Síguenos en Facebook"
                        >
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#1877F2] text-white transition-all duration-300 shadow-lg shadow-blue-200/50 group-hover:scale-110 group-hover:shadow-blue-300/50 group-hover:shadow-2xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Membership Banner */}
            <section className="py-12 bg-[#00151a] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">
                                {t('home.member.title')}
                            </h3>
                            <p className="text-teal-400 font-bold uppercase text-[10px] tracking-widest">
                                {t('home.member.subtitle')}
                            </p>
                        </div>
                        <a
                            href="/acceso"
                            className="bg-white text-[#00151a] px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-50 transition-all"
                        >
                            {t('home.member.cta')}
                        </a>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-900/20 to-transparent"></div>
            </section>
        </>
    );
};

export default HomePage;
