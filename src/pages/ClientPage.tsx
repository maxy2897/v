import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ClientPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    return (
        <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-white/50">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-teal-50/30 -z-10 skew-x-12 transform translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-2xl w-full mx-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/50 p-8 md:p-12 overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-xl shadow-teal-900/10 p-4 border border-teal-50">
                            <img src="/images/logo-n.png" alt="Bodipo Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-3xl font-black text-[#00151a] mb-2 tracking-tight">
                            Bienvenido a Bodipo
                        </h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                            Premium Logistics Area
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-gray-100/50 p-1.5 rounded-2xl mb-8 relative">
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm z-0"
                            initial={false}
                            animate={{
                                left: activeTab === 'login' ? '0.375rem' : '50%',
                                width: 'calc(50% - 0.375rem)'
                            }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'login' ? 'text-[#00151a]' : 'text-gray-400'}`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'register' ? 'text-[#00151a]' : 'text-gray-400'}`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Login Form */}
                    {activeTab === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Tu Email"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <div className="flex justify-end">
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide cursor-pointer hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </span>
                                </div>
                                <button className="w-full bg-[#00151a] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007e85] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-900/10">
                                    Entrar
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Register Form */}
                    {activeTab === 'register' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="text"
                                    placeholder="Apellidos"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="tel"
                                    placeholder="Teléfono"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="text"
                                    placeholder="DNI / Pasaporte"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="text"
                                    placeholder="Dirección Completa"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />

                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar Contraseña"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                                />

                                <div className="md:col-span-2 mt-2">
                                    <button className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00151a] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20">
                                        Crear Cuenta Completa
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Persuasive Footer Text */}
                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-[#00151a] font-bold text-sm leading-relaxed max-w-[80%] mx-auto">
                            Únete a la élite logística. <br />
                            <span className="text-gray-400 font-normal">Gestiona tus envíos con prioridad absoluta y ventajas exclusivas.</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ClientPage;
