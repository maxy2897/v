import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TERMS_AND_CONDITIONS } from '../constants/terms';

interface ClientPageProps {
    onOpenForgotPassword?: () => void;
}

const ClientPage: React.FC<ClientPageProps> = ({ onOpenForgotPassword }) => {
    const { t } = useSettings();
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

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
        confirmPassword: '',
        gender: 'other'
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

        if (!acceptedPrivacy || !acceptedTerms) {
            setError('Debes aceptar las políticas de privacidad y los términos y condiciones');
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
                username: registerData.email.split('@')[0],
                gender: registerData.gender
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
                    {/* Header with Close Button */}
                    <div className="relative text-center mb-10">
                        <button
                            onClick={() => navigate('/')}
                            className="absolute -top-4 -right-4 md:-top-8 md:-right-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all backdrop-blur-sm"
                            title="Volver al inicio"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-xl shadow-teal-900/10 p-4 border border-teal-50">
                            <img src="./images/logo-n.png" alt="Bodipo Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-3xl font-black text-[#00151a] mb-2 tracking-tight">
                            {t('client.welcome')}
                        </h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                            {t('client.premium_area')}
                        </p>
                    </div>

                    {/* Social Login Button - Visible in both tabs */}
                    <div className="mb-8">
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { signInWithGoogle } = await import('../firebase');
                                    const user = await signInWithGoogle();
                                    await register({
                                        name: user.displayName || '',
                                        email: user.email || '',
                                        password: Math.random().toString(36).slice(-8), // Dummy password for social login
                                        phone: '',
                                        address: '',
                                        username: user.uid,
                                        photoUrl: user.photoURL || '',
                                        provider: 'google',
                                        uid: user.uid
                                    });
                                    navigate('/dashboard');
                                } catch (error) {
                                    console.error("Google Login Error:", error);
                                    // If registration fails (e.g. user exists), try login logic or handle it gracefully
                                    // Ideally use a unified social auth method
                                    navigate('/dashboard');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-3 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors group bg-white"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-black transition-colors">Continuar con Google</span>
                        </button>

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center">
                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-white px-4">O usa tu email</span>
                            </div>
                        </div>
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
                                    <span
                                        onClick={onOpenForgotPassword}
                                        className="text-[10px] font-bold text-teal-600 uppercase tracking-wide cursor-pointer hover:underline"
                                    >
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
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Sexo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRegisterChange({ target: { name: 'gender', value: 'male' } } as React.ChangeEvent<HTMLInputElement>)}
                                            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${registerData.gender === 'male' ? 'bg-[#00151a] text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            Hombre
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRegisterChange({ target: { name: 'gender', value: 'female' } } as React.ChangeEvent<HTMLInputElement>)}
                                            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${registerData.gender === 'female' ? 'bg-[#00151a] text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            Mujer
                                        </button>
                                    </div>
                                </div>
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

                                <div className="md:col-span-2 space-y-3 mt-2">
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id="privacy"
                                            checked={acceptedPrivacy}
                                            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                        />
                                        <label htmlFor="privacy" className="text-xs text-gray-600 font-medium leading-relaxed cursor-pointer">
                                            He leído y acepto la <Link to="/privacidad" target="_blank" onClick={(e) => e.stopPropagation()} className="text-teal-600 font-bold hover:underline">política de privacidad</Link>
                                        </label>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                        />
                                        <label htmlFor="terms" className="text-xs text-gray-600 font-medium leading-relaxed cursor-pointer">
                                            Acepto los <button type="button" onClick={() => setShowTermsModal(true)} className="text-teal-600 font-bold hover:underline">términos y condiciones</button> de envío de Bodipo Business
                                        </label>
                                    </div>

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

                    <AnimatePresence>
                        {showTermsModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowTermsModal(false)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="relative bg-white w-full max-w-lg rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl p-6 md:p-8"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl md:text-2xl font-black text-[#00151a] tracking-tight">Términos y Condiciones</h3>
                                        <button onClick={() => setShowTermsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Cerrar términos">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-teal-500">
                                        {TERMS_AND_CONDITIONS.map((term, index) => (
                                            <div key={index}>
                                                <h4 className="font-black text-teal-700 uppercase text-[10px] tracking-widest mb-2">{term.title}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">{term.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setAcceptedTerms(true);
                                            setShowTermsModal(false);
                                        }}
                                        className="w-full bg-[#00151a] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-8 hover:bg-[#007e85] transition-all"
                                    >
                                        Entendido y Aceptar
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

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
