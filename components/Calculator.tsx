
import React, { useState } from 'react';
import { PackageInfo } from '../types';

const Calculator: React.FC = () => {
  const [calcMode, setCalcMode] = useState<'kg' | 'bulto' | 'documento'>('kg');
  const [info, setInfo] = useState<PackageInfo>({
    weight: 0,
    length: 20,
    width: 20,
    height: 20,
    origin: 'España',
    destination: 'Malabo',
    type: 'Aéreo'
  });

  const [bultoType, setBultoType] = useState<23 | 32>(23);
  const [total, setTotal] = useState<{ value: number; currency: string } | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Payment preference states
  const [payLocation, setPayLocation] = useState<'Origen' | 'Guinea'>('Origen');
  const [payMethod, setPayMethod] = useState<'Almacén' | 'Ecobank'>('Almacén');

  const [userData, setUserData] = useState({
    fullName: '',
    phone: '',
    idNumber: ''
  });

  const calculateShipping = () => {
    setGeneratedCode(null);
    setShowForm(false);

    if (calcMode === 'documento') {
      setTotal({ value: 15, currency: '€' });
      return;
    }

    if (calcMode === 'kg') {
      let rate = 0;
      let currency = '€';

      if (info.origin === 'España') {
        if (info.type === 'Aéreo') {
          rate = info.destination === 'Malabo' ? 11 : 13;
        } else {
          // Marítimo
          rate = info.destination === 'Malabo' ? 4 : 5;
        }
        currency = '€';
      } else if (info.origin === 'Camerún') {
        rate = info.destination === 'Malabo' ? 3000 : 2000;
        currency = 'XAF';
      } else if (info.origin === 'Guinea Ecuatorial') {
        rate = 5000;
        currency = 'XAF';
      }
      setTotal({ value: info.weight * rate, currency });
    } else {
      setTotal({ value: bultoType === 23 ? 220 : 310, currency: '€' });
    }
  };

  const handleStartRegistration = () => {
    setShowForm(true);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.fullName || !userData.phone || !userData.idNumber) {
      alert("Por favor, rellena todos los datos personales.");
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let result = '';
      for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedCode(`BB-${result}`);
      setIsRegistering(false);
      setShowForm(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      alert('Código copiado al portapapeles');
    }
  };

  const resetCalculator = () => {
    setTotal(null);
    setGeneratedCode(null);
    setShowForm(false);
    setUserData({ fullName: '', phone: '', idNumber: '' });
    setPayLocation('Origen');
    setPayMethod('Almacén');
  };

  return (
    <section id="calculadora" className="bg-white rounded-[3.5rem] border border-gray-100 p-1 md:p-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
        <div className="p-8 md:p-0">
          <div className="inline-block px-4 py-1.5 bg-teal-50 rounded-full mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Envíos Oficiales 2026</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#00151a] tracking-tighter mb-8">
            Calcula tu <br /><span className="text-[#007e85]">Envío</span>
          </h2>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">País de Origen</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setInfo({ ...info, origin: 'España' }); setCalcMode('kg'); }}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all flex flex-col items-center justify-center gap-1 ${info.origin === 'España' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  <span className="text-xl">🇪🇸</span>
                  España
                </button>
                <button
                  onClick={() => { setInfo({ ...info, origin: 'Camerún' }); setCalcMode('kg'); }}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all flex flex-col items-center justify-center gap-1 ${info.origin === 'Camerún' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  <span className="text-xl">🇨🇲</span>
                  Camerún
                </button>
                <button
                  onClick={() => { setInfo({ ...info, origin: 'Guinea Ecuatorial' }); setCalcMode('kg'); }}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all flex flex-col items-center justify-center gap-1 ${info.origin === 'Guinea Ecuatorial' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  <span className="text-xl">🇬🇶</span>
                  Guinea
                </button>
              </div>
            </div>

            <div className="flex bg-gray-50 p-1 rounded-2xl">
              <button
                onClick={() => setCalcMode('kg')}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${calcMode === 'kg' ? 'bg-white text-[#00151a] shadow-sm' : 'text-gray-400'}`}
              >
                Kilos
              </button>
              {info.origin === 'España' && (
                <button
                  onClick={() => setCalcMode('bulto')}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${calcMode === 'bulto' ? 'bg-white text-[#00151a] shadow-sm' : 'text-gray-400'}`}
                >
                  Bultos
                </button>
              )}
              {info.origin === 'Guinea Ecuatorial' && (
                <button
                  onClick={() => setCalcMode('documento')}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${calcMode === 'documento' ? 'bg-white text-[#00151a] shadow-sm' : 'text-gray-400'}`}
                >
                  Documentos
                </button>
              )}
            </div>

            {info.origin === 'España' && calcMode === 'kg' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Tipo de Servicio</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setInfo({ ...info, type: 'Aéreo' })}
                    className={`py-4 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 ${info.type === 'Aéreo' ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm' : 'border-gray-100 bg-white text-gray-400'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Aéreo
                  </button>
                  <button
                    onClick={() => setInfo({ ...info, type: 'Marítimo' })}
                    className={`py-4 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 ${info.type === 'Marítimo' ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm' : 'border-gray-100 bg-white text-gray-400'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Marítimo (BIO)
                  </button>
                </div>
                {info.type === 'Marítimo' && (
                  <p className="text-[9px] text-amber-600 font-bold uppercase mt-3 tracking-widest animate-pulse">
                    ⚠️ Tiempo estimado: 25-30 días
                  </p>
                )}
              </div>
            )}

            <div className="space-y-6">
              {calcMode === 'kg' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Destino</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setInfo({ ...info, destination: 'Malabo' })}
                        className={`py-4 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 ${info.destination === 'Malabo' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}
                      >
                        <span className="text-lg">🇬🇶</span>
                        Malabo
                      </button>
                      <button
                        onClick={() => setInfo({ ...info, destination: 'Bata' })}
                        className={`py-4 rounded-2xl font-bold border transition-all flex items-center justify-center gap-2 ${info.destination === 'Bata' ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}
                      >
                        <span className="text-lg">🇬🇶</span>
                        Bata
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Peso Total (kg)</label>
                    <input
                      type="number"
                      value={info.weight || ''}
                      onChange={(e) => setInfo({ ...info, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </>
              ) : calcMode === 'bulto' ? (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Selecciona tu Bulto</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setBultoType(23)} className={`py-6 rounded-2xl font-bold border flex flex-col items-center transition-all ${bultoType === 23 ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}>
                      <span className="text-2xl font-black">23 Kg</span>
                      <span className="text-xs uppercase opacity-60">220€</span>
                    </button>
                    <button onClick={() => setBultoType(32)} className={`py-6 rounded-2xl font-bold border flex flex-col items-center transition-all ${bultoType === 32 ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-gray-100 bg-white text-gray-400'}`}>
                      <span className="text-2xl font-black">32 Kg</span>
                      <span className="text-xs uppercase opacity-60">310€</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-teal-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-lg">🇬🇶</span> Envíos de Documentos <span className="text-lg">🇪🇸</span>
                  </p>
                  <p className="text-2xl font-black text-[#00151a]">15€ <span className="text-xs text-gray-400 font-bold uppercase ml-2">Tarifa Plana</span></p>
                  <p className="text-[9px] text-teal-600 font-bold uppercase mt-4">Ruta Directa: 🇬🇶 Guinea Ecuatorial {'->'} 🇪🇸 España</p>
                </div>
              )}
            </div>

            <button onClick={calculateShipping} className="w-full bg-[#00151a] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/10">
              Ver Coste Envío
            </button>
          </div>
        </div>

        <div className="relative flex">
          {generatedCode ? (
            <div className="bg-[#005f6b] p-8 md:p-12 rounded-[3rem] w-full flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-300 to-transparent"></div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-teal-200 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Registro Exitoso</p>
              <h3 className="text-2xl font-black mb-6 leading-tight">Hola {userData.fullName.split(' ')[0]}, registro completado</h3>

              <div className="bg-white/10 border border-white/20 p-8 rounded-[2rem] w-full mb-8">
                <p className="text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-2">Código de Rastreo</p>
                <p className="text-5xl font-black tracking-tighter mb-4">{generatedCode}</p>
                <button onClick={copyToClipboard} className="bg-white text-[#005f6b] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-colors">
                  Copiar Código
                </button>
              </div>

              <div className="text-[10px] font-bold text-teal-100/60 uppercase tracking-widest mb-6">
                Lugar de Pago: {payLocation === 'Origen' ? info.origin : 'Guinea Ecuatorial'}
                {payLocation === 'Guinea' && ` (${payMethod})`}
              </div>

              <button onClick={resetCalculator} className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 hover:opacity-100 transition-opacity">Nuevo Envío</button>
            </div>
          ) : showForm ? (
            <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[3rem] w-full flex flex-col shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-y-auto max-h-[700px]">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-8 right-8 text-gray-300 hover:text-gray-500 transition-colors"
                title="Cerrar modal"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="mb-8">
                <h3 className="text-2xl font-black text-[#00151a] tracking-tight">Datos del Remitente</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Generar comprobante oficial</p>
              </div>
              <form onSubmit={handleFinalSubmit} className="space-y-5">
                <input required type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all" placeholder="Nombre Completo" value={userData.fullName} onChange={e => setUserData({ ...userData, fullName: e.target.value })} />
                <input required type="tel" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all" placeholder="Teléfono" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} />
                <input required type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all" placeholder="DNI / DIP" value={userData.idNumber} onChange={e => setUserData({ ...userData, idNumber: e.target.value })} />

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#007e85] mb-4">Confirmar Método de Pago</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPayLocation('Origen')}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${payLocation === 'Origen' ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                    >
                      Pagar en {info.origin}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayLocation('Guinea')}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${payLocation === 'Guinea' ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                    >
                      Pagar en Guinea
                    </button>
                  </div>

                  {payLocation === 'Guinea' && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod('Almacén')}
                        className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${payMethod === 'Almacén' ? 'bg-[#00151a] text-white border-[#00151a]' : 'bg-white text-gray-400 border-gray-100'}`}
                      >
                        En Almacén
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod('Ecobank')}
                        className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${payMethod === 'Ecobank' ? 'bg-[#00151a] text-white border-[#00151a]' : 'bg-white text-gray-400 border-gray-100'}`}
                      >
                        Vía Ecobank
                      </button>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isRegistering} className="w-full bg-[#007e85] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-[#00151a] transition-all shadow-lg flex items-center justify-center space-x-3 mt-6">
                  {isRegistering ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>Finalizar y Registrar</span>}
                </button>
              </form>
            </div>
          ) : total !== null ? (
            <div className="bg-[#00151a] p-12 rounded-[3rem] w-full flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-transparent"></div>
              <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Importe de Envío</p>
              <div className="flex items-baseline">
                <span className="text-7xl font-black text-white">{total.value.toLocaleString()}</span>
                <span className="text-2xl font-black text-teal-500 ml-2">{total.currency}</span>
              </div>

              <div className="mt-8 space-y-4 w-full">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-teal-400 mb-2">Opciones de Pago Disponibles</p>
                  <ul className="text-[10px] text-gray-300 space-y-1 font-medium">
                    <li>• Pagar en {info.origin}</li>
                    <li>• Pagar en Guinea (Efectivo en almacén)</li>
                    <li>• Pagar en Guinea (Ingreso Ecobank)</li>
                  </ul>
                </div>

                <button onClick={handleStartRegistration} className="w-full bg-teal-500 text-[#00151a] py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20">
                  Registrar Paquete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] w-full min-h-[400px] flex flex-col justify-center items-center text-center p-6 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                {info.type === 'Marítimo' ? (
                  <img src="/images/service-ship.png" className="w-full h-full object-cover scale-150" alt="" />
                ) : (
                  <img src="/images/service-plane.png" className="w-full h-full object-cover scale-150" alt="" />
                )}
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full max-w-[280px] aspect-square rounded-[2rem] overflow-hidden mb-8 shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                  {info.type === 'Marítimo' ? (
                    <img src="/images/service-ship.png" className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" alt="Transporte Marítimo" />
                  ) : (
                    <img src="/images/service-plane.png" className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" alt="Transporte Aéreo" />
                  )}
                </div>

                <h4 className="text-xl font-black text-[#00151a] mb-2 uppercase tracking-tight">
                  {info.type === 'Marítimo' ? 'Envío Marítimo (BIO)' : 'Envío Aéreo'}
                </h4>
                <p className="text-gray-400 font-bold max-w-[240px] text-xs uppercase tracking-widest leading-relaxed">
                  Calcula el costo para habilitar el registro oficial de tu mercancía
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Calculator;
