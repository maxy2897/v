import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { BASE_URL } from '../services/api';

interface VerifyEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerified: () => void;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ isOpen, onClose, email, onVerified }) => {
    const { t } = useSettings();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutos en segundos
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (code.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al verificar código');
            }

            alert('✅ Email verificado exitosamente');
            onVerified();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al verificar código');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${BASE_URL}/api/auth/send-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                // Si el error es que el usuario no existe, probablemente es un error de estado
                if (response.status === 404) {
                    throw new Error('Usuario no encontrado. Por favor regístrate nuevamente.');
                }
                throw new Error(data.message || 'Error al reenviar código');
            }

            setTimeLeft(900);
            setCanResend(false);
            alert('✅ Código reenviado. Por favor revisa tu bandeja de entrada y spam.');
        } catch (err: any) {
            console.error('Error resending code:', err);
            setError(err.message || 'Error al reenviar código');
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
                <div className="bg-gradient-to-r from-[#00151a] to-[#007e85] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="text-6xl mb-4">📧</div>
                    <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Verifica tu Email</h2>
                    <p className="text-teal-200 text-sm">Hemos enviado un código a</p>
                    <p className="text-white font-bold">{email}</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block text-center">
                                Ingresa el código de 6 dígitos
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0 transition-all font-bold text-2xl text-center tracking-[0.5em] text-black"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="text-center">
                            {timeLeft > 0 ? (
                                <p className="text-sm text-gray-500">
                                    Código expira en: <span className="font-bold text-teal-600">{formatTime(timeLeft)}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-red-600 font-bold">
                                    ⏰ Código expirado
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full bg-[#00151a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[#007e85] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verificando...' : 'Verificar Email'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={loading || !canResend}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {canResend ? 'Reenviar Código' : 'Espera para reenviar'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        ¿No recibiste el código? Revisa tu carpeta de spam
                    </p>
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

export default VerifyEmailModal;
