import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const MoneyTransfer: React.FC = () => {
  const { t, appConfig } = useSettings();
  const [direction, setDirection] = useState<'ES_GQ' | 'GQ_ES' | 'CM_GQ'>('ES_GQ');
  const [amount, setAmount] = useState<number>(0);
  const [formData, setFormData] = useState({
    senderName: '',
    senderId: '',
    senderPhone: '',
    beneName: '',
    beneIdOrIban: '',
    benePhoneOrBizum: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successTxId, setSuccessTxId] = useState<string | null>(null);

  // Tasas actualizadas desde configuración dinámica
  const rateEURO_CFA = appConfig?.rates.exchange.eur_xaf || 600;
  const rateCFA_EURO = appConfig?.rates.exchange.xaf_eur ? (1 / appConfig.rates.exchange.xaf_eur) : 0.00167; // Aprox fallback
  const feeCM_GQ = 0.04;    // 4% comisión para Camerún

  const calculateResult = () => {
    if (direction === 'ES_GQ') return amount * rateEURO_CFA;
    if (direction === 'GQ_ES') return amount * (appConfig?.rates.exchange.xaf_eur ? (1 / appConfig.rates.exchange.xaf_eur) : rateCFA_EURO);
    if (direction === 'CM_GQ') return amount;
    return 0;
  };
  // ... (rest of component logic identical until render)

  // ...

  {/* Cuenta Guinea */ }
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <span className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-[#00151a] font-black text-xs">🇬🇶</span>
      <p className="text-xs font-black uppercase tracking-widest text-teal-400">🇬🇶 {t('transfer.accounts.guinea.bank')}</p>
    </div>
    <div className="bg-white/5 rounded-2xl p-6 space-y-3 border border-white/5">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.name_label')}</p>
      <p className="text-sm font-black uppercase">{appConfig?.bank?.holder || 'SUSANA MBA MIKUE.'}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.iban_label')}</p>
      <p className="text-lg font-mono font-black text-teal-300">{appConfig?.bank?.accountNumber || '39360018962'}</p>
      <div className="pt-2 border-t border-white/5">
        <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.swift_label')}</p>
        <p className="text-md font-mono font-black text-teal-500">ECOCGQGQ</p>
      </div>
    </div>
  </div>

  {/* Cuenta España */ }
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <span className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-[#00151a] font-black text-xs">🇪🇸</span>
      <p className="text-xs font-black uppercase tracking-widest text-yellow-400">🇪🇸 {t('transfer.accounts.spain.bank')}</p>
    </div>
    <div className="bg-white/5 rounded-2xl p-6 space-y-3 border border-white/5">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.name_label')}</p>
      <p className="text-sm font-black uppercase">{appConfig?.bank?.holder || 'ANTONIO M. NDONG'}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.iban_label')}</p>
      <p className="text-xs font-mono font-black text-yellow-300 break-all">{appConfig?.bank?.iban || 'ES46 1583 0001 1590 4700 6648'}</p>
    </div>
  </div>

  const calculatedAmount = calculateResult();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !file || !formData.senderName || !formData.beneName) {
      alert(t('transfer.alert.required'));
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      const sender = {
        name: formData.senderName,
        idDocument: formData.senderId,
        phone: formData.senderPhone
      };

      const beneficiary = {
        name: formData.beneName,
        idDocument: direction !== 'GQ_ES' ? formData.beneIdOrIban : undefined,
        phone: direction !== 'GQ_ES' ? formData.benePhoneOrBizum : undefined,
        iban: direction === 'GQ_ES' ? formData.beneIdOrIban : undefined,
        bizum: direction === 'GQ_ES' ? formData.benePhoneOrBizum : undefined
      };

      data.append('sender', JSON.stringify(sender));
      data.append('beneficiary', JSON.stringify(beneficiary));
      data.append('amount', amount.toString());
      data.append('currency', direction === 'ES_GQ' ? 'EUR' : 'CFA');
      data.append('direction', direction);
      data.append('proofImage', file);

      const res = await import('../services/api').then(module => module.createTransfer(data));

      // alert(t('transfer.alert.success')); // Removing alert to show success UI instead
      setSuccessTxId(res.transactionId);

      // Reset form
      setAmount(0);
      setFile(null);
      setFormData({
        senderName: '',
        senderId: '',
        senderPhone: '',
        beneName: '',
        beneIdOrIban: '',
        benePhoneOrBizum: ''
      });

    } catch (error: any) {
      console.error(error);
      alert(t('transfer.alert.error') + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!successTxId) return;
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transactions/${successTxId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error downloading');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${successTxId}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('Error al descargar recibo');
    }
  };

  if (successTxId) {
    return (
      <section className="py-24 bg-white min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4 bg-[#00151a] p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-transparent"></div>
          <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 text-[#00151a]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">¡Transferencia Solicitada!</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Tu solicitud ha sido registrada correctamente. Puedes descargar tu comprobante a continuación.</p>

          <button onClick={downloadReceipt} className="w-full bg-white text-[#00151a] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-teal-50 transition-all shadow-lg flex items-center justify-center gap-2 mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Descargar Recibo
          </button>

          <button onClick={() => setSuccessTxId(null)} className="text-teal-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="transferencias" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-teal-50 px-4 py-2 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-800">{t('transfer.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#00151a] tracking-tighter leading-none">
            {t('transfer.title')} <br /><span className="text-[#007e85]">{t('transfer.title_highlight')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Calculadora y Formulario */}
          <div className="lg:col-span-7 bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-sm">
            <div className="flex bg-gray-50 p-1 rounded-2xl mb-10 overflow-x-auto">
              <button
                onClick={() => setDirection('ES_GQ')}
                className={`flex-1 min-w-[120px] py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${direction === 'ES_GQ' ? 'bg-white text-[#00151a] shadow-sm' : 'text-gray-400'}`}
              >
                <span className="text-lg leading-none">🇪🇸 ➔ 🇬🇶</span>
                {t('transfer.tab.es_gq')}
              </button>
              <button
                onClick={() => setDirection('GQ_ES')}
                className={`flex-1 min-w-[120px] py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${direction === 'GQ_ES' ? 'bg-white text-[#00151a] shadow-sm' : 'text-gray-400'}`}
              >
                <span className="text-lg leading-none">🇬🇶 ➔ 🇪🇸</span>
                {t('transfer.tab.gq_es')}
              </button>
              <button
                onClick={() => setDirection('CM_GQ')}
                className={`flex-1 min-w-[120px] py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${direction === 'CM_GQ' ? 'bg-white text-[#00151a] shadow-sm' : 'text-gray-400'}`}
              >
                <span className="text-lg leading-none">🇨🇲 ➔ 🇬🇶</span>
                {t('transfer.tab.cm_gq')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <p className="text-xs font-black uppercase tracking-widest text-[#007e85]">{t('transfer.sender.title')}</p>
                <input name="senderName" value={formData.senderName} onChange={handleInputChange} type="text" placeholder={t('transfer.sender.name')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                <input name="senderId" value={formData.senderId} onChange={handleInputChange} type="text" placeholder={t('transfer.sender.id')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                <input name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} type="text" placeholder={t('transfer.sender.phone')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="space-y-6">
                <p className="text-xs font-black uppercase tracking-widest text-[#007e85]">{t('transfer.bene.title')}</p>
                <input name="beneName" value={formData.beneName} onChange={handleInputChange} type="text" placeholder={t('transfer.bene.name')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                {direction !== 'GQ_ES' ? (
                  <>
                    <input name="beneIdOrIban" value={formData.beneIdOrIban} onChange={handleInputChange} type="text" placeholder={t('transfer.bene.id_passport')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                    <input name="benePhoneOrBizum" value={formData.benePhoneOrBizum} onChange={handleInputChange} type="text" placeholder={t('transfer.bene.phone')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                  </>
                ) : (
                  <>
                    <input name="beneIdOrIban" value={formData.beneIdOrIban} onChange={handleInputChange} type="text" placeholder={t('transfer.bene.iban')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                    <input name="benePhoneOrBizum" value={formData.benePhoneOrBizum} onChange={handleInputChange} type="text" placeholder={t('transfer.bene.bizum')} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-teal-500" />
                  </>
                )}
              </div>
            </div>

            <div className="bg-teal-50 rounded-3xl p-8 mb-10 border border-teal-100">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-teal-800 mb-2 block">{t('transfer.amount.label')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border-none rounded-2xl px-6 py-5 text-2xl font-black text-black focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="0.00"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-400 uppercase">
                      {direction === 'ES_GQ' ? 'EUR' : 'CFA'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <svg className="w-8 h-8 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-teal-800 mb-2 block">
                    {direction === 'CM_GQ' ? t('transfer.amount.total_label') : t('transfer.amount.receive_label')}
                  </label>
                  <div className="w-full bg-white/50 rounded-2xl px-6 py-5 text-2xl font-black text-[#00151a]">
                    {direction === 'CM_GQ'
                      ? (amount * 1.04).toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : calculatedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    }
                    <span className="text-sm font-bold ml-2 text-teal-600">
                      {direction === 'GQ_ES' ? 'EUR' : 'FCFA'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col md:flex-row justify-between text-[10px] font-bold text-teal-700 uppercase tracking-widest gap-2">
                <span>
                  {direction === 'ES_GQ' && `${t('transfer.tasa')}: 1€ = ${rateEURO_CFA} CFA`}
                  {direction === 'GQ_ES' && `${t('transfer.tasa')}: ${rateCFA_EURO} CFA = 1€`}
                  {direction === 'CM_GQ' && `${t('transfer.cargo')}: 4%`}
                </span>
                <span className="italic">{t('transfer.slogan')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{t('transfer.proof.label')}</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-teal-400 transition-colors group">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title={t('transfer.proof.select')}
                  aria-label={t('transfer.proof.select')}
                />
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 text-gray-300 group-hover:text-teal-500 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="text-sm font-bold text-gray-500">
                    {file ? file.name : t('transfer.proof.cta')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-[#00151a] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#007e85] transition-all shadow-xl shadow-teal-900/10 mt-6 ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading ? t('transfer.cta.processing') : t('transfer.cta.submit')}
              </button>
            </div>
          </div>


          {/* Información de Cuentas Destino */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#00151a] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
              <h3 className="text-2xl font-black mb-8 border-b border-white/10 pb-4">{t('transfer.accounts.title')}</h3>

              <div className="space-y-10">
                {/* Cuenta Guinea */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-[#00151a] font-black text-xs">🇬🇶</span>
                    <p className="text-xs font-black uppercase tracking-widest text-teal-400">🇬🇶 {t('transfer.accounts.guinea.bank')}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 space-y-3 border border-white/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.name_label')}</p>
                    <p className="text-sm font-black uppercase">SUSANA MBA MIKUE.</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.iban_label')}</p>
                    <p className="text-lg font-mono font-black text-teal-300">39360018962</p>
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.swift_label')}</p>
                      <p className="text-md font-mono font-black text-teal-500">ECOCGQGQ</p>
                    </div>
                  </div>
                </div>

                {/* Cuenta España */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-[#00151a] font-black text-xs">🇪🇸</span>
                    <p className="text-xs font-black uppercase tracking-widest text-yellow-400">🇪🇸 {t('transfer.accounts.spain.bank')}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 space-y-3 border border-white/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.name_label')}</p>
                    <p className="text-sm font-black uppercase">ANTONIO M. NDONG</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t('transfer.accounts.iban_label')}</p>
                    <p className="text-xs font-mono font-black text-yellow-300 break-all">ES46 1583 0001 1590 4700 6648</p>
                  </div>
                </div>

                {/* Contacto Camerún */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-[#00151a] font-black text-xs">🇨🇲</span>
                    <p className="text-xs font-black uppercase tracking-widest text-green-400">🇨🇲 {t('transfer.accounts.cameroon.bank')}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Yaoundé</p>
                    <p className="text-sm font-black text-white">Universidad Católica de África</p>
                    <p className="text-md font-mono font-black text-green-400 mt-2">+237 6 58 49 73 49</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex items-center space-x-6">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-400 leading-relaxed">
                <span className="text-[#00151a] font-bold">Bodipo Business:</span> {t('transfer.info.text')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyTransfer;
