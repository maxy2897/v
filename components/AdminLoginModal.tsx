import React, { useState, useRef, useEffect } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al autenticar');
        setPassword('');
        inputRef.current?.focus();
      } else {
        onSuccess(data.token);
        onClose();
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#00151a] to-[#00272f] border border-[#00c8c826]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#00c8c81a] border-[1.5px] border-[#00c8c840]"
          >
            <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-black uppercase tracking-widest mb-1">Acceso Admin</h2>
          <p className="text-gray-500 text-xs font-medium tracking-wider text-center">
            Introduce la contraseña de administrador
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
              className={`w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm font-medium outline-none transition-all bg-white/5 border-[1.5px] ${error ? 'border-red-400/60' : 'border-[#00c8c826] focus:border-[#00c8c880]'}`}
              disabled={loading}
            />
            {error && (
              <p className="text-red-400 text-xs font-semibold mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-gray-400 text-sm font-black uppercase tracking-wider transition-all hover:text-white hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-40 text-white ${loading || !password ? 'bg-[#00c8c833]' : 'bg-gradient-to-br from-[#00b4b4] to-[#007e85]'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z"/>
                  </svg>
                  Verificando…
                </span>
              ) : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
