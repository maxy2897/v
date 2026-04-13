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
        <div className="relative font-['Poppins'] bg-[#00151a] text-white overflow-hidden">
            {/* 1. Banner Superior de Seguridad */}
            <div className="bg-[#000d0f] border-b border-white/5 py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs font-bold tracking-widest text-teal-400 uppercase gap-4 md:gap-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🛡️</span> Pagos 100% Seguros con Encriptación SSL
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">📦</span> Seguimiento de Paquetes en Tiempo Real
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">📞</span> Atención al Cliente 24/7 (España y Guinea)
                    </div>
                </div>
            </div>

            {/* 2. Sección Hero */}
            <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full"></div>
                    <div className="absolute top-1/2 -left-24 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 space-y-8"
                        >
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Montserrat'] font-black tracking-tighter leading-[0.9] text-white">
                                Servicio<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300">Internacional</span><br />
                                de Paquetería
                            </h1>

                            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed font-medium">
                                Conectamos tus envíos de España a Guinea con la máxima rapidez y seguridad. Deja tus gestiones en nuestras manos y olvídate del estrés.
                            </p>

                            <div className="flex flex-wrap gap-5 pt-4">
                                <Link to="/tarifas" className="px-10 py-5 bg-teal-500 text-[#00151a] rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/30 active:scale-95">
                                    REALIZAR ENVÍO
                                </Link>
                                <a 
                                    href="https://wa.me/34641992110" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
                                >
                                    CONTACTAR POR WHATSAPP
                                </a>
                            </div>

                            {/* 3. Sección de Reseñas de Google (Widget Style) */}
                            <div className="pt-12">
                                <div className="flex items-center gap-3 mb-6 font-['Montserrat']">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-lg">Excelente</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="text-yellow-400">⭐</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12.48 10.92v3.28h4.78c-.19 1.06-1.09 3.08-4.78 3.08-3.21 0-5.82-2.66-5.82-5.94s2.61-5.94 5.82-5.94c1.83 0 3.05.78 3.75 1.45l2.58-2.49c-1.66-1.55-3.82-2.5-6.33-2.5-5.52 0-10 4.48-10 10s4.48 10 10 10c5.77 0 9.61-4.06 9.61-9.78 0-.66-.07-1.16-.16-1.65H12.48z" />
                                            </svg>
                                            Puntuación: 4.9 / 5 Reseñas de Google
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div whileHover={{ y: -5 }} className="bg-white/5 p-5 rounded-2xl border border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-xs uppercase tracking-widest text-teal-400">Marta G.</span>
                                            <span className="text-[10px] text-yellow-400">⭐⭐⭐⭐⭐</span>
                                        </div>
                                        <p className="text-sm text-gray-300 italic leading-relaxed">
                                            "El envío llegó a Malabo antes de lo esperado. Muy profesionales y el trato por WhatsApp fue excelente. ¡Repetiré seguro!"
                                        </p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="bg-white/5 p-5 rounded-2xl border border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-xs uppercase tracking-widest text-teal-400">Sekou B.</span>
                                            <span className="text-[10px] text-yellow-400">⭐⭐⭐⭐⭐</span>
                                        </div>
                                        <p className="text-sm text-gray-300 italic leading-relaxed">
                                            "Llevo meses enviando mercancía para mi negocio en Guinea con ellos y nunca he tenido un problema. Son de total confianza."
                                        </p>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="bg-white/5 p-5 rounded-2xl border border-white/10 transition-all md:col-span-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-black text-xs uppercase tracking-widest text-teal-400">Carlos R.</span>
                                            <span className="text-[10px] text-yellow-400">⭐⭐⭐⭐⭐</span>
                                        </div>
                                        <p className="text-sm text-gray-300 italic leading-relaxed">
                                            "Muy contento con el servicio de compra online. Compré en Amazon España y ellos se encargaron de llevarlo hasta mi casa en Guinea."
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:col-span-5 mt-16 lg:mt-0 relative"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative rounded-[3rem] overflow-hidden bg-[#00151a] border border-white/10 shadow-2xl">
                                    <img
                                        className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                                        src="./images/equipo-bodipo.png"
                                        alt="Equipo BodipoBusiness"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#00151a] via-transparent to-transparent"></div>
                                    
                                    {/* 5. Pie de la Imagen de Equipo */}
                                    <div className="absolute bottom-10 left-10 right-10">
                                        <div className="flex flex-col space-y-4">
                                            <div className="inline-flex items-center space-x-3 bg-teal-500/20 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-teal-500/20">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">
                                                    Personal Propio en Destino para una Entrega Segura
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl md:text-4xl font-black font-['Montserrat'] tracking-tighter flex items-center gap-3">
                                                    ESPAÑA 🇪🇸 <span className="text-teal-500">➔</span> GUINEA 🇬🇶
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Sección de Partners (Aerolíneas) */}
            <section className="py-20 bg-[#000d0f]/50 border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-['Montserrat'] font-black uppercase tracking-widest text-white mb-4">
                        Nuestros Partners de Carga Aérea
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
                        "Garantizamos la rapidez de tus entregas gracias a nuestras alianzas estratégicas con <span className="text-teal-400">Royal Air Maroc</span> y <span className="text-teal-400">Ethiopian Airlines</span>, líderes en rutas africanas."
                    </p>
                    
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 font-['Montserrat']">
                         {/* RAM Placeholder Logo */}
                         <div className="flex items-center gap-4 group cursor-pointer hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">🇲🇦</div>
                            <span className="font-black tracking-tighter text-lg group-hover:text-teal-400 transition-colors">ROYAL AIR MAROC</span>
                         </div>
                         {/* Ethiopian Placeholder Logo */}
                         <div className="flex items-center gap-4 group cursor-pointer hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">🇪🇹</div>
                            <span className="font-black tracking-tighter text-lg group-hover:text-teal-400 transition-colors">ETHIOPIAN AIRLINES</span>
                         </div>
                    </div>
                </div>
            </section>

            {/* Money Transfer Section (Existing but restyled) */}
            <section className="py-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                >
                    <div className="bg-gradient-to-br from-[#001a1f] to-[#000d0f] rounded-[3rem] overflow-hidden relative border border-white/10 shadow-3xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
                            <div className="p-12 md:p-20 flex flex-col justify-center space-y-8">
                                <div className="inline-flex items-center space-x-2 bg-teal-500/10 px-4 py-2 rounded-full w-fit">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Servicio Premium</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-['Montserrat'] font-black text-white tracking-tighter leading-none">
                                    Envía Dinero <br />
                                    <span className="text-teal-400">Instantáneo</span>
                                </h2>
                                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">
                                    Transfiere fondos a tus familiares y socios en Guinea con las mejores tasas del mercado y seguridad garantizada.
                                </p>
                                <Link
                                    to="/money-transfer"
                                    className="inline-flex items-center justify-center px-10 py-5 bg-teal-500 text-[#00151a] rounded-2xl font-['Montserrat'] font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 w-fit active:scale-95"
                                >
                                    ENVIAR AHORA
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="relative h-[400px] lg:h-auto">
                                <img
                                    src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=1200"
                                    alt="Money Transfer"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00151a] via-transparent to-transparent hidden lg:block"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;
