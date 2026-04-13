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
        <div className="relative font-['Poppins'] bg-[#f4fcfb] text-[#00151a] overflow-hidden selection:bg-teal-500/30">

            {/* 2. Sección Hero */}
            <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 min-h-[90vh] flex items-center">
                {/* Fondo de Mapa como en la imagen */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <div 
                        className="w-full h-full bg-cover bg-center bg-fixed mix-blend-multiply filter invert-[0.2]"
                        style={{ backgroundImage: "url('./images/bg/hero-map-v3.png')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#f4fcfb]/50 via-transparent to-[#f4fcfb]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 space-y-6"
                        >
                            <h1 
                                className="text-5xl md:text-6xl lg:text-7xl font-['Montserrat'] bg-clip-text text-transparent bg-gradient-to-b from-[#0a1b1d] to-[#040e0f] drop-shadow-[0_0_20px_rgba(200,250,245,0.7)] tracking-tighter leading-[0.9] font-black [-webkit-text-stroke:2px_#f0fdfc]"
                            >
                                Servicio<br />
                                Internacional
                            </h1>

                            <p className="text-xl md:text-2xl text-teal-950 max-w-2xl leading-relaxed font-semibold">
                                Deja tus gestiones en nuestras manos y olvídate del estrés.
                            </p>

                            {/* Review Cards (Floating style from image) */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white text-gray-900 p-3 rounded-2xl flex items-center gap-3 w-[260px] shadow-2xl"
                                >
                                    <img src="https://i.pravatar.cc/150?u=maria" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="María R." />
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 mb-0.5">Testimonios Reales</p>
                                        <div className="flex gap-0.5 mb-1 text-[12px] text-yellow-400">⭐⭐⭐⭐⭐</div>
                                        <p className="text-[11px] leading-tight font-medium text-gray-700">"Excelente servicio para mi negocio." - María R.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white text-gray-900 p-3 rounded-2xl flex items-center gap-3 w-[260px] shadow-2xl"
                                >
                                    <img src="https://i.pravatar.cc/150?u=marta" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="Martín G." />
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 mb-0.5">Testimonio Reales</p>
                                        <div className="flex gap-0.5 mb-1 text-[12px] text-yellow-400">⭐⭐⭐⭐⭐</div>
                                        <p className="text-[11px] leading-tight font-medium text-gray-700">"Excelente servicio para mi negocio." - Martín G.</p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-6">
                                <Link to="/tarifas" className="px-10 py-4 bg-[#1b3d41] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl active:scale-95 border border-white/10">
                                    REALIZAR ENVÍO
                                </Link>
                                <button 
                                    onClick={onOpenContact}
                                    className="px-10 py-4 bg-gradient-to-r from-[#6baba4] to-[#4b968d] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-xl active:scale-95"
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
                            <div className="relative rounded-[2.5rem] overflow-hidden bg-transparent shadow-2xl h-[550px] lg:h-[650px] w-full border-2 border-white/10 group">
                                <img
                                    className="w-full h-full object-cover"
                                    src="/images/foto-original.jpg"
                                    alt="Equipo BodipoBusiness"
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#00151a]/95 via-[#00151a]/50 to-transparent"></div>

                                {/* Floating Logos Overlay from Screenshot */}
                                <div className="absolute bottom-6 left-0 right-0 px-6 xl:px-8 z-20">
                                    <div className="flex flex-wrap items-center justify-between gap-4 text-white">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-6 h-6 md:w-8 md:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            <span className="text-[10px] md:text-sm font-bold leading-tight">Pagos<br/>Seguros<br/>SSL</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs md:text-base font-bold leading-tight">Entregas<br/>Certificadas</span>
                                        </div>
                                        <div className="font-extrabold italic text-xl md:text-3xl tracking-tighter shrink-0 border-y-2 border-white/20 py-0.5">
                                            DHL
                                        </div>
                                        <div className="flex flex-col items-center shrink-0">
                                            <span className="font-black text-lg md:text-3xl tracking-tighter leading-none">FedEx<span className="text-[8px] md:text-xs align-top font-bold">®</span></span>
                                            <span className="text-[7px] md:text-[9px] font-medium tracking-widest mt-0.5">Logística</span>
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
