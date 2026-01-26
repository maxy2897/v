import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { BASE_URL } from '../../services/api';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const { t } = useSettings();
    const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar código');
            }

            setStep('code');
            alert('📧 Código enviado a tu email');
        } catch (err: any) {
            setError(err.message || 'Error al enviar código');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        setStep('password');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al resetear contraseña');
            }

            alert('✅ Contraseña actualizada exitosamente');
            onClose();
            // Reset form
            setStep('email');
            setEmail('');
            setCode('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Error al resetear contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#00151a]/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="text-2xl font-black text-white tracking-tighter mb-2">
                        {step === 'email' && 'Recuperar Contraseña'}
                        {step === 'code' && 'Verificar Código'}
                        {step === 'password' && 'Nueva Contraseña'}
                    </h2>
                    <p className="text-orange-100 text-sm">
                        {step === 'email' && 'Ingresa tu email para recibir un código'}
                        {step === 'code' && 'Ingresa el código que enviamos a tu email'}
                        {step === 'password' && 'Crea una nueva contraseña segura'}
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-black"
                                    placeholder="tu-email@ejemplo.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Code */}
                    {step === 'code' && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block text-center">
                                    Código de 6 dígitos
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-all font-bold text-2xl text-center tracking-[0.5em] text-black"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Enviado a: <span className="font-bold">{email}</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                Continuar
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Volver
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-black pr-14"
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-black"
                                    placeholder="Repite la contraseña"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                    title="Cerrar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
