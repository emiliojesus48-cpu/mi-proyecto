
import React, { useState } from 'react';
import { Transaction, CreditIdentity, ExchangeRates, Currency } from '../types';

interface CreditsProps {
  transactions: Transaction[];
  rates: ExchangeRates;
  onUpdateStatus: (id: string, status: 'PAID' | 'PENDING') => void;
  onAddTransaction: (t: Transaction) => void;
}

const Credits: React.FC<CreditsProps> = ({ transactions, rates, onUpdateStatus, onAddTransaction }) => {
  const [tab, setTab] = useState<'CxC' | 'CxP'>('CxC');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreditIdentity & { amount: number }>({
    firstName: '', lastName: '', idNumber: '', phone: '', address: '', amount: 0
  });

  const credits = transactions.filter(t => 
    (tab === 'CxC' ? t.type === 'OUT' : t.type === 'IN') && t.status === 'PENDING'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const type = tab === 'CxC' ? 'OUT' : 'IN';
    const tx: Transaction = {
      id: Date.now().toString(),
      saleCode: `${tab}-${Date.now().toString().slice(-4)}`,
      type: type,
      category: tab === 'CxC' ? 'SALE' : 'SUPPLY',
      items: [], // Service/Credit items don't strictly need products
      totalUSD: formData.amount,
      payments: [],
      rateAtTimeVES: rates.ves,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      referenceNumber: `${tab}: ${formData.firstName} ${formData.lastName}`,
      identity: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        phone: formData.phone,
        address: formData.address
      }
    };
    onAddTransaction(tx);
    setShowForm(false);
    setFormData({ firstName: '', lastName: '', idNumber: '', phone: '', address: '', amount: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setTab('CxC')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'CxC' ? 'bg-white text-black shadow-md' : 'text-slate-400'}`}
          >
            A Cobrar (Clientes)
          </button>
          <button 
            onClick={() => setTab('CxP')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'CxP' ? 'bg-white text-black shadow-md' : 'text-slate-400'}`}
          >
            A Pagar (Proveed.)
          </button>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
        >
          {tab === 'CxC' ? '+ Registrar Deuda' : '+ Registrar Cuenta'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credits.map(c => (
          <div key={c.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all border-l-8 border-l-red-500">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black text-black text-lg leading-tight uppercase">{c.identity?.firstName} {c.identity?.lastName}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">C.I / RIF: {c.identity?.idNumber}</p>
                </div>
                <span className="text-[9px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full uppercase">Vencida</span>
              </div>
              
              <div className="space-y-3 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 mb-6">
                <div className="flex justify-between">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo USD</span>
                   <span className="text-sm font-black text-black">${c.totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo VES</span>
                   <span className="text-sm font-black text-blue-600">{(c.totalUSD * rates.ves).toLocaleString()} Bs.</span>
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                   <span>EUR: {(c.totalUSD * rates.ves / rates.eur).toFixed(2)}</span>
                   <span>USDT: {(c.totalUSD * rates.ves / rates.usdt).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl text-[10px]">
                   <p className="font-black text-slate-400 uppercase mb-1">📞 Teléfono</p>
                   <p className="font-bold text-black">{c.identity?.phone}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-[10px]">
                   <p className="font-black text-slate-400 uppercase mb-1">🗓️ Fecha</p>
                   <p className="font-bold text-black">{new Date(c.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onUpdateStatus(c.id, 'PAID')}
              className="w-full bg-emerald-600 text-white py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-emerald-50"
            >
              Confirmar Pago
            </button>
          </div>
        ))}
        {credits.length === 0 && <div className="col-span-full py-24 text-center text-slate-300 italic uppercase font-black tracking-widest opacity-40">No hay registros pendientes</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-black text-white">
               <h3 className="font-black uppercase tracking-widest text-sm">Registrar {tab === 'CxC' ? 'Acreencia' : 'Obligación'}</h3>
               <button onClick={() => setShowForm(false)} className="p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
               <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombres</label><input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl text-sm font-bold outline-none transition-all" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
               <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Apellidos</label><input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl text-sm font-bold outline-none transition-all" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
               <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">C.I / RIF</label><input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl text-sm font-black outline-none transition-all" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} /></div>
               <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label><input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl text-sm font-bold outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
               <div className="col-span-2 space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dirección Habitación/Fiscal</label><textarea required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl text-sm font-medium outline-none transition-all" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
               <div className="col-span-2 space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Monto de la Deuda (USD)</label><input type="number" step="0.01" required className="w-full px-5 py-5 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-[2rem] text-xl font-black text-red-600 outline-none transition-all text-center" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} /></div>
               <button type="submit" className="col-span-2 bg-black text-white font-black py-6 rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-widest mt-4">Guardar Registro en Sistema</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;
