import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../services/api';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialEmail?: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, initialEmail }) => {
    const { t, appConfig } = useSettings();
    const { user } = useAuth();
    const [method, setMethod] = useState<'email' | 'phone' | 'call'>('email');
    const [step, setStep] = useState<'input' | 'code' | 'password'>(initialEmail ? 'code' : 'input');
    const whatsappNumber = '34643521042';
    const [email, setEmail] = useState(initialEmail || '');
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

        // Crear un controlador para cancelar la petición si tarda demasiado
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

        try {
            const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar código');
            }

            setStep('code');
            alert('📧 Código enviado a tu email');
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('La solicitud está tardando demasiado. Prueba a contactar por WhatsApp o inténtalo de nuevo.');
            } else {
                setError(err.message || 'Error al enviar código');
            }
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
            setStep('input');
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
            <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-teal-900 to-teal-700 p-6 md:p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="text-5xl mb-4">🔐</div>
                    <h2 className="text-2xl font-black text-white tracking-tighter mb-2">
                        Recuperar Contraseña
                    </h2>
                    <p className="text-teal-100 text-xs font-medium uppercase tracking-widest">
                        {step === 'input' && 'Selecciona un método de recuperación'}
                        {step === 'code' && 'Verifica tu identidad'}
                        {step === 'password' && 'Crea una nueva contraseña'}
                    </p>
                </div>

                <div className="p-6 md:p-8">
                    {/* Method Tabs */}
                    {step === 'input' && (
                        <div className="flex bg-gray-100 p-1 mb-6 md:mb-8 rounded-xl overflow-x-auto">
                            <button
                                onClick={() => { setMethod('email'); setError(''); }}
                                className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${method === 'email' ? 'bg-white shadow-sm text-teal-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Email
                            </button>
                            <button
                                onClick={() => { setMethod('phone'); setError(''); }}
                                className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${method === 'phone' ? 'bg-white shadow-sm text-teal-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                WhatsApp
                            </button>
                            <button
                                onClick={() => { setMethod('call'); setError(''); }}
                                className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${method === 'call' ? 'bg-white shadow-sm text-teal-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Llamada
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* EMAIL FLOW */}
                    {method === 'email' && (
                        <>
                            {step === 'input' && (
                                <form onSubmit={handleSendCode} className="space-y-6">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">
                                            Email Registrado
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black"
                                            placeholder="tu-email@ejemplo.com"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#00151a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[#007e85] transition-all disabled:opacity-50 shadow-xl"
                                    >
                                        {loading ? 'Enviando...' : 'Enviar Código'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    {/* PHONE FLOW (WhatsApp Fallback) */}
                    {method === 'phone' && step === 'input' && (
                        <div className="text-center space-y-6 animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#00151a] mb-2">Recuperación por WhatsApp</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Contacta directamente con nuestro equipo de verificación para recuperar tu acceso de forma segura.
                                </p>
                            </div>
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, necesito recuperar el acceso a mi cuenta de Bodipo Business. Mi nombre es: ${user?.name || '(Escribe aquí tu nombre)'} y mi correo es: ${email || user?.email || '(Escribe aquí tu email)'}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all shadow-xl shadow-green-200"
                            >
                                Iniciar Chat
                            </a>
                        </div>
                    )}

                    {/* CALL FLOW */}
                    {method === 'call' && step === 'input' && (
                        <div className="text-center space-y-6 animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#00151a] mb-2">Soporte Telefónico</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Si prefieres una atención directa, puedes llamar a nuestra central de soporte en España.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <a
                                    href={`tel:+34643521042`}
                                    className="block w-full bg-[#00151a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[#007e85] transition-all shadow-xl"
                                >
                                    Llamar ahora
                                </a>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Horario: L-V 09:00 - 20:00 (GMT+1)
                                </p>
                            </div>
                        </div>
                    )}


                    {/* CODE VERIFICATION & NEW PASSWORD (Email Only for now) */}
                    {(step === 'code' || step === 'password') && (
                        <>
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
                                            className="w-full px-6 py-4 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-0 transition-all font-bold text-2xl text-center tracking-[0.5em] text-black"
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
                                        className="w-full bg-[#00151a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        Continuar
                                    </button>
                                </form>
                            )}

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
                                                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black pr-14"
                                                placeholder="Mínimo 6 caracteres"
                                                minLength={6}
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
                                            className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black"
                                            placeholder="Repite la contraseña"
                                            minLength={6}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#00151a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                    title="Cerrar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;


