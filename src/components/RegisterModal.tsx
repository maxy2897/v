import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { signInWithGoogle } from '../firebase';
import { PhoneInput } from './PhoneInput';


interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { register, registerWithSocial } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gender: 'other',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    if (!acceptedPrivacy) {
      setError(t('register.error.privacy'));
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError(t('register.error.fields'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.error.password'));
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      onClose();
      alert(t('register.success'));
    } catch (err: any) {
      setError(err.message || t('register.error.general'));
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
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="bg-[#00151a] p-6 text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-2xl font-black text-white tracking-tighter mb-1">{t('register.title')}</h2>
          <p className="text-teal-400 text-[9px] font-black uppercase tracking-[0.3em]">{t('register.subtitle')}</p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-teal-400 transition-colors bg-white/10 p-2 rounded-full backdrop-blur-sm"
            title="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-teal-50 p-4 rounded-xl mb-6 flex items-center space-x-3 border border-teal-100">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-[#00151a] font-black text-sm">
              10%
            </div>
            <p className="text-xs font-bold text-teal-900 leading-snug">
              {t('register.promo')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Social Register */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button
              type="button"
              onClick={async () => {
                try {
                  console.log('Initiating Google Register...');
                  const user = await signInWithGoogle();
                  console.log('Google Register success, creating account...', user);
                  await registerWithSocial({
                    name: user.displayName,
                    email: user.email,
                    photoUrl: user.photoURL,
                    provider: 'google',
                    uid: user.uid
                  });
                  onClose();
                  alert(t('register.success'));
                } catch (error: any) {
                  console.error('Google Register Error:', error);
                  alert('Error con Google: ' + (error.message || error));
                }
              }}

              className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-[10px] font-bold text-gray-600 group-hover:text-black transition-colors">Google</span>
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center">
              <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 bg-white px-3">O con email</span>
            </div>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="reg-gender" className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{t('register.gender') || 'Sexo'}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.gender === 'male' ? 'bg-[#00151a] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.gender === 'female' ? 'bg-[#00151a] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  Mujer
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-name" className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{t('register.name')} *</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black text-[16px]"
                placeholder="Juan Bodipo"
                required
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{t('register.email')} *</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black text-[16px]"
                placeholder="email@ejemplo.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{t('register.password')} *</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black text-[16px] pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reg-phone" className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{t('register.phone')}</label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-address" className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{t('register.address')}</label>
              <input
                id="reg-address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black text-[16px]"
                placeholder="Calle, Ciudad, País"
              />
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="privacy"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="privacy" className="text-xs text-gray-600 font-medium leading-relaxed cursor-pointer">
                {t('register.privacy_accept')} <span className="text-teal-600 font-bold hover:underline">políticas de privacidad</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00151a] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('register.loading') : t('register.btn')}
            </button>
          </form>

          <p className="mt-6 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            Al registrarte aceptas nuestras <a href="/privacidad" target="_blank" className="text-teal-600 underline">políticas de privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;

