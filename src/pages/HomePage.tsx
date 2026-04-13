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
            <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-4 text-[10px] md:text-sm font-bold tracking-tight text-gray-900">
                    <div className="flex items-center gap-2">
                         Seguridad y Confianza Garantizada
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                             <span className="text-teal-600 text-lg">🛡️</span> Pagos Seguros SSL
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-teal-600 text-lg">✅</span> Entregas Certificadas
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-teal-600 text-lg">📞</span> Atención 24/7
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Sección Hero */}
            <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 min-h-[90vh] flex items-center">
                {/* Fondo de Mapa como en la imagen */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <img 
                        src="./images/bg/hero-map-v3.png" 
                        alt="World Map Background" 
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 space-y-10"
                        >
                            <h1 className="text-7xl md:text-9xl font-['Montserrat'] font-black tracking-tighter leading-[0.8] text-white">
                                Servicio<br />
                                <span className="text-teal-400">Internacional</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-300 max-w-xl leading-relaxed font-medium">
                                Deja tus gestiones en nuestras manos y olvídate del estrés.
                            </p>

                            {/* Review Cards (White style from image) */}
                            <div className="flex flex-wrap gap-6 pt-6">
                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-5 rounded-[2rem] flex items-center gap-5 shadow-2xl max-w-sm text-gray-900 border border-gray-100"
                                >
                                    <img src="https://i.pravatar.cc/150?u=maria" className="w-16 h-16 rounded-full object-cover" alt="María R." />
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-500 mb-1">Testimonios Reales</p>
                                        <div className="flex gap-0.5 mb-1 text-xs">⭐⭐⭐⭐⭐</div>
                                        <p className="text-sm font-bold italic leading-tight">"Excelente servicio para mi negocio." - María R.</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-5 rounded-[2rem] flex items-center gap-5 shadow-2xl max-w-sm text-gray-900 border border-gray-100"
                                >
                                    <img src="https://i.pravatar.cc/150?u=marta" className="w-16 h-16 rounded-full object-cover" alt="Marta G." />
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-500 mb-1">Testimonio:Reales</p>
                                        <div className="flex gap-0.5 mb-1 text-xs">⭐⭐⭐⭐⭐</div>
                                        <p className="text-sm font-bold italic leading-tight">"Excelente servicio para mi negocio." - Marta G.</p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-10">
                                <Link to="/tarifas" className="px-14 py-6 bg-gradient-to-r from-[#2a454b] to-[#4c7e88] text-white rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-black/20 active:scale-95">
                                    REALIZAR ENVÍO
                                </Link>
                                <button 
                                    onClick={onOpenContact}
                                    className="px-14 py-6 bg-gradient-to-r from-[#699a9d] to-[#8eb6b2] text-white rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-black/20 active:scale-95"
                                >
                                    CONTACTAR
                                </button>
                            </div>
                        </motion.div>

                        {/* Right Panel (Hero Image with Overlays - Exactly like reference) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-5 mt-16 lg:mt-0 relative"
                        >
                            <div className="relative rounded-[4rem] overflow-hidden bg-white/5 border-[10px] border-white/10 shadow-3xl">
                                <img
                                    className="w-full aspect-[4/5] object-cover"
                                    src="./images/equipo-bodipo.png"
                                    alt="Equipo BodipoBusiness"
                                />
                                
                                {/* Black gradient overlay at bottom of internal image */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                {/* Overlays inside the image */}
                                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-3xl">🛡️</span>
                                            <span className="text-[10px] font-black uppercase text-white leading-none">Pagos Seguros<br/>SSL</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-3xl">✅</span>
                                            <span className="text-[10px] font-black uppercase text-white leading-none">Entregas<br/>Certificadas</span>
                                        </div>
                                        
                                        {/* Airline Logos (Simplified to just icons/logos like DHL/FedEx) */}
                                        <div className="flex items-center gap-3 grayscale brightness-200 opacity-90">
                                             <img src="https://cdn-icons-png.flaticon.com/512/10007/10007490.png" className="w-12 h-12 object-contain" alt="RAM Logo" />
                                             <span className="text-[10px] font-black uppercase text-white leading-none sr-only">RAM</span>
                                        </div>

                                        <div className="flex items-center gap-3 grayscale brightness-200 opacity-90">
                                             <img src="https://cdn-icons-png.flaticon.com/512/2610/2610931.png" className="w-12 h-12 object-contain" alt="Ethiopian Logo" />
                                             <span className="text-[10px] font-black uppercase text-white leading-none sr-only">Ethiopian</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-0.5 w-8 bg-teal-400"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Servicios Destacados</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl md:text-4xl font-black font-['Montserrat'] tracking-tighter flex items-center gap-3">
                                                🇪🇸 España <span className="text-teal-400">➔</span> Guinea 🇬🇶
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
