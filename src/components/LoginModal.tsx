import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import { signInWithGoogle } from '../firebase';


interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenForgotPassword?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenForgotPassword }) => {
    const { login, registerWithSocial } = useAuth();
    const { t } = useSettings();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // Bloquear scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError(t('login.error.fields'));
            return;
        }

        setLoading(true);

        try {
            await login(formData.email, formData.password);
            onClose();
        } catch (err: any) {
            setError(err.message || t('login.error.general'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#00151a]/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="bg-[#00151a] p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{t('login.title')}</h2>
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">{t('login.welcome')}</p>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Social Login */}
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    console.log('Initiating Google Login...');
                                    const user = await signInWithGoogle();
                                    console.log('Google Login success, registering with social...', user);
                                    await registerWithSocial({
                                        name: user.displayName,
                                        email: user.email,
                                        photoUrl: user.photoURL,
                                        provider: 'google',
                                        uid: user.uid
                                    });
                                    console.log('Social registration success, closing modal...');
                                    onClose();
                                    navigate('/dashboard');
                                } catch (error: any) {
                                    console.error('Google Login Error:', error);
                                    alert('Error con Google: ' + (error.message || error));
                                }
                            }}
                            className="flex items-center justify-center gap-3 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-black transition-colors">Google</span>
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center">
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-white px-4">O continúa con email</span>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('login.email')}</label>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black text-[16px]"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('login.password')}</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black pr-14 text-[16px]"
                                    placeholder="••••••••"
                                    required
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
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={onOpenForgotPassword}
                                        className="text-[10px] font-bold text-teal-600 uppercase tracking-wide hover:underline"
                                    >
                                        {t('login.forgot')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00151a] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/20 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('login.loading') : t('login.btn')}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-gray-500 font-medium">
                        {t('login.no_account')}{' '}
                        <button
                            onClick={() => {
                                onClose();
                                // Aquí se podría abrir el modal de registro
                            }}
                            className="text-teal-600 font-black uppercase tracking-wider hover:underline"
                        >
                            {t('login.register_link')}
                        </button>
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white hover:text-teal-400 transition-colors bg-white/10 p-2 rounded-full backdrop-blur-sm"
                    title="Cerrar modal"
                    aria-label="Cerrar modal"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default LoginModal;
