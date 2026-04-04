
import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { register } = useAuth();
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
      setError('Debes aceptar la política de privacidad');
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      onClose();
      // Mostrar mensaje de éxito
      alert('¡Registro exitoso! Bienvenido a Bodipo Business');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
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
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Club BodipoBusiness</h2>
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">Beneficios Exclusivos</p>
        </div>

        <div className="p-10">
          <div className="bg-teal-50 p-6 rounded-2xl mb-8 flex items-center space-x-4 border border-teal-100">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-[#00151a] font-black">
              10%
            </div>
            <p className="text-sm font-bold text-teal-900 leading-snug">
              Regístrate hoy y recibe un <span className="text-teal-600">10% de descuento</span> inmediato en tu próximo envío a Guinea.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Nombre Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                placeholder="Juan Bodipo"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                placeholder="email@ejemplo.com"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                  placeholder="+34..."
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
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
                Acepto las <a href="/privacidad" target="_blank" className="text-teal-600 underline font-bold">políticas de privacidad</a> de BODIPO BUSINESS
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00151a] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
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

