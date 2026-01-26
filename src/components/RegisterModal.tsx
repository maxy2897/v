import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const { t } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      // Mostrar mensaje de éxito
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
      <div className="relative bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-[#00151a] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{t('register.title')}</h2>
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">{t('register.subtitle')}</p>
        </div>

        <div className="p-10">
          <div className="bg-teal-50 p-6 rounded-2xl mb-8 flex items-center space-x-4 border border-teal-100">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-[#00151a] font-black">
              10%
            </div>
            <p className="text-sm font-bold text-teal-900 leading-snug">
              {t('register.promo')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('register.name')} *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black"
                placeholder="Juan Bodipo"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('register.email')} *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black"
                placeholder="email@ejemplo.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('register.password')} *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black pr-14"
                    placeholder="••••••••"
                    required
                    minLength={6}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('register.phone')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black"
                  placeholder="+34..."
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('register.address')}</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-black"
                placeholder="Calle, Ciudad, País"
              />
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="privacy"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="privacy" className="text-[10px] text-gray-600 font-medium leading-relaxed">
                {t('register.privacy_accept')} <a href="/privacidad" target="_blank" className="text-teal-600 underline font-bold">políticas de privacidad</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00151a] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('register.loading') : t('register.btn')}
            </button>
          </form>

          <p className="mt-8 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            Al registrarte aceptas nuestras <a href="/privacidad" target="_blank" className="text-teal-600 underline">políticas de privacidad</a>
          </p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          title="Cerrar modal"
          aria-label="Cerrar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;

