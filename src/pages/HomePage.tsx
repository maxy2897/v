import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface HomePageProps {
    onOpenRegister: () => void;
    onOpenContact: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenRegister, onOpenContact }) => {
    const { t, appConfig } = useSettings();

    return (
        <div className="relative font-['Poppins'] bg-[#00151a] text-white overflow-hidden selection:bg-teal-500/30">
            {/* 1. Banner Superior de Seguridad (Estilo Exacto Imagen) */}
            <div className="bg-[#000d0f] border-b border-white/5 py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-4 text-[10px] md:text-xs font-bold tracking-widest text-teal-400 uppercase">
                    <div className="flex items-center gap-2">
                         Seguridad y Confianza Garantizada
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                         <span className="text-teal-400">🛡️</span> Pagos Seguros SSL
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                         <span className="text-teal-400">✅</span> Entregas Certificadas
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                         <span className="text-teal-400">📞</span> Atención 24/7
                    </div>
                </div>
            </div>

            {/* 2. Sección Hero */}
            <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 min-h-[90vh] flex items-center">
                {/* Fondo de Mapa como en la imagen */}
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                    <img 
                        src="./images/bg/hero-map-v3.png" 
                        alt="World Map Background" 
                        className="w-full h-full object-cover mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00151a]/50 via-transparent to-[#00151a]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 space-y-8"
                        >
                            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-['Montserrat'] font-black tracking-tighter leading-[0.85] text-white">
                                Servicio<br />
                                <span className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">Internacional</span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed font-medium">
                                Deja tus gestiones en nuestras manos y olvídate del estrés.
                            </p>

                            {/* Review Cards (Floating style from image) */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex items-center gap-4 max-w-sm"
                                >
                                    <img src="https://i.pravatar.cc/150?u=maria" className="w-12 h-12 rounded-full border-2 border-teal-500/30" alt="María R." />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Testimonios Reales</p>
                                        <div className="flex gap-0.5 mb-1 text-[10px]">⭐⭐⭐⭐⭐</div>
                                        <p className="text-xs italic text-gray-300">"Excelente servicio para mi negocio." - María R.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl flex items-center gap-4 max-w-sm"
                                >
                                    <img src="https://i.pravatar.cc/150?u=marta" className="w-12 h-12 rounded-full border-2 border-teal-500/30" alt="Marta G." />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Testimonio Reales</p>
                                        <div className="flex gap-0.5 mb-1 text-[10px]">⭐⭐⭐⭐⭐</div>
                                        <p className="text-xs italic text-gray-300">"Excelente servicio para mi negocio." - Marta G.</p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex flex-wrap gap-5 pt-8">
                                <Link to="/tarifas" className="px-12 py-5 bg-gradient-to-r from-teal-600 to-teal-500 text-[#00151a] rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-teal-500/20 active:scale-95">
                                    REALIZAR ENVÍO
                                </Link>
                                <button 
                                    onClick={onOpenContact}
                                    className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
                                >
                                    CONTACTAR
                                </button>
                            </div>
                        </motion.div>

                        {/* Right Panel (Two Boys Image + RAM/Ethiopian Overlays) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-5 mt-16 lg:mt-0 relative"
                        >
                            <div className="relative rounded-[3rem] overflow-hidden bg-gray-900 border border-white/10 shadow-3xl aspect-[4/5] md:aspect-auto">
                                <img
                                    className="w-full h-full object-cover brightness-90"
                                    src="./images/equipo-bodipo.png"
                                    alt="Equipo BodipoBusiness"
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#00151a] via-transparent to-transparent"></div>

                                {/* Floating Icons (Replaced DHL/FedEx with RAM/Ethiopian Airlines names/flags as requested) */}
                                <div className="absolute bottom-24 left-8 right-8 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                        <span className="text-xl">🛡️</span>
                                        <span className="text-[9px] font-black uppercase tracking-tighter leading-none text-white/80">Pagos Seguros<br/>SSL</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                        <span className="text-xl">✅</span>
                                        <span className="text-[9px] font-black uppercase tracking-tighter leading-none text-white/80">Entregas<br/>Certificadas</span>
                                    </div>
                                    
                                    {/* Partner 1: Royal Air Maroc (Logo only) */}
                                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 opacity-80 mix-blend-screen grayscale contrast-200">
                                        <img src="https://cdn-icons-png.flaticon.com/512/10007/10007490.png" className="w-20 h-8 object-contain" alt="RAM" />
                                    </div>

                                    {/* Partner 2: Ethiopian Airlines (Logo only) */}
                                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 opacity-80 mix-blend-screen grayscale contrast-150">
                                        <img src="https://cdn-icons-png.flaticon.com/512/2610/2610931.png" className="w-20 h-8 object-contain" alt="Ethiopian" />
                                    </div>
                                </div>

                                {/* Spain -> Guinea Label in Hero Image Overlay */}
                                <div className="absolute bottom-10 left-8 right-8">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-0.5 w-6 bg-teal-400"></div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">Servicios Destacados</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl md:text-3xl font-black font-['Montserrat'] tracking-tighter flex items-center gap-2">
                                                🇪🇸 España <span className="text-teal-400 text-xl">➔</span> Guinea 🇬🇶
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Money Transfer restyled to match aesthetic */}
            <section className="py-24 relative bg-[#000d0f]/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-[#001a22] to-[#000d11] rounded-[4rem] overflow-hidden relative border border-white/5 shadow-3xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
                            <div className="p-12 md:p-24 flex flex-col justify-center space-y-10">
                                <span className="px-5 py-2 rounded-full border border-teal-500/30 text-teal-400 text-[10px] font-black uppercase tracking-widest w-fit backdrop-blur-md bg-teal-500/5">
                                    Trusted Financial Services
                                </span>
                                <h2 className="text-5xl md:text-7xl font-['Montserrat'] font-black text-white tracking-tighter leading-none">
                                    Money<br />
                                    <span className="text-teal-400">Transfer</span>
                                </h2>
                                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
                                    Envía dinero de forma segura y al instante con las mejores tasas.
                                </p>
                                <Link
                                    to="/money-transfer"
                                    className="flex items-center justify-center px-12 py-5 bg-teal-500 text-[#00151a] rounded-3xl font-['Montserrat'] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-teal-500/10 w-fit active:scale-95"
                                >
                                    Realizar Transferencia
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="relative h-[500px] lg:h-auto">
                                <img
                                    src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=1200"
                                    alt="Money Transfer"
                                    className="w-full h-full object-cover brightness-75 grayscale-[0.2]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#001a22] via-transparent to-transparent hidden lg:block"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
