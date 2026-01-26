import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientPage: React.FC = () => {
    const { t } = useSettings();
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login State
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Register State
    const [registerData, setRegisterData] = useState({
        name: '',
        apellidos: '',
        email: '',
        phone: '',
        dni: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(loginData.email, loginData.password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            await register({
                name: `${registerData.name} ${registerData.apellidos}`,
                email: registerData.email,
                password: registerData.password,
                phone: registerData.phone,
                address: registerData.address,
                username: registerData.email.split('@')[0]
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

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
                            {t('client.welcome')}
                        </h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                            {t('client.premium_area')}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

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
                            onClick={() => {
                                setActiveTab('login');
                                setError('');
                            }}
                            className={`flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'login' ? 'text-[#00151a]' : 'text-gray-400'}`}
                        >
                            {t('login.title')}
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('register');
                                setError('');
                            }}
                            className={`flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'register' ? 'text-[#00151a]' : 'text-gray-400'}`}
                        >
                            {t('login.register_link')}
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
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    placeholder={t('login.email')}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        placeholder={t('login.password')}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black pr-14"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide cursor-pointer hover:underline">
                                        {t('login.forgot')}
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#00151a] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007e85] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-900/10 disabled:opacity-50"
                                >
                                    {loading ? '...' : t('login.btn')}
                                </button>
                            </form>
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
                            <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="name"
                                    value={registerData.name}
                                    onChange={handleRegisterChange}
                                    placeholder="Nombre"
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={registerData.apellidos}
                                    onChange={handleRegisterChange}
                                    placeholder="Apellidos"
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    placeholder="Email"
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    placeholder="Teléfono"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />
                                <input
                                    type="text"
                                    name="dni"
                                    value={registerData.dni}
                                    onChange={handleRegisterChange}
                                    placeholder="DNI / Pasaporte"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />
                                <input
                                    type="text"
                                    name="address"
                                    value={registerData.address}
                                    onChange={handleRegisterChange}
                                    placeholder="Dirección Completa"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black"
                                />

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        placeholder="Contraseña"
                                        required
                                        minLength={6}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black pr-14"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        placeholder="Confirmar Contraseña"
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium text-black pr-14"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>

                                <div className="md:col-span-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00151a] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50"
                                    >
                                        {loading ? '...' : t('register.btn')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Persuasive Footer Text */}
                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-[#00151a] font-bold text-sm leading-relaxed max-w-[80%] mx-auto">
                            {t('client.footer_title')} <br />
                            <span className="text-gray-400 font-normal">{t('client.footer_desc')}</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ClientPage;
