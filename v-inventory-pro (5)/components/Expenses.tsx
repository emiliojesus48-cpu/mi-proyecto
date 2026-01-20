
import React, { useState } from 'react';
import { Expense } from '../types';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
}

const CATEGORIES = ['Servicios', 'Sueldos', 'Alquiler', 'Transporte', 'Impuestos', 'Otros'];

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense }) => {
  const [formData, setFormData] = useState({ description: '', amount: 0, category: 'Servicios' });
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) return;
    onAddExpense({
      id: Date.now().toString(),
      description: formData.description,
      amountUSD: formData.amount,
      category: formData.category,
      date: new Date().toISOString()
    });
    setFormData({ description: '', amount: 0, category: 'Servicios' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {selectedExpense && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 text-center animate-in slide-in-from-top-4 duration-300">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <h3 className="font-black text-black uppercase tracking-widest text-sm mb-1">Comprobante de Egreso</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase mb-8">Ref: {selectedExpense.id.slice(-6)}</p>
             
             <div className="space-y-4 text-left border-y border-slate-100 py-6 mb-8">
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Motivo</span><span className="text-sm font-black text-black">{selectedExpense.description}</span></div>
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Categoría</span><span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full">{selectedExpense.category}</span></div>
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Monto Total</span><span className="text-lg font-black text-red-600">${selectedExpense.amountUSD.toFixed(2)}</span></div>
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Fecha Pago</span><span className="text-sm font-bold text-black">{new Date(selectedExpense.date).toLocaleString()}</span></div>
             </div>
             
             <button onClick={() => setSelectedExpense(null)} className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Cerrar Ticket</button>
           </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-2xl">
        <h2 className="text-xl font-black text-black uppercase tracking-tight mb-8">Registro de Gastos</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label><input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-bold text-sm text-black transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ej: Pago Alquiler Local" /></div>
          <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Importe USD</label><input type="number" step="0.01" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-black text-sm text-red-600 transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} /></div>
          <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rubro</label><select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-black text-sm text-black transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <button type="submit" className="md:col-span-3 bg-black text-white py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl">Guardar Egreso en Sistema</button>
        </form>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center"><h3 className="text-[11px] font-black text-black uppercase tracking-widest">Historial de Salidas de Caja</h3><span className="text-[9px] font-bold text-slate-400 uppercase">Hoy: {new Date().toLocaleDateString()}</span></div>
        <div className="divide-y divide-slate-50">
          {expenses.map(e => (
            <div key={e.id} onClick={() => setSelectedExpense(e)} className="p-6 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <p className="font-black text-black text-sm">{e.description}</p>
                <div className="flex space-x-2 mt-1">
                   <span className="text-[9px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-tighter">{e.category}</span>
                   <span className="text-[9px] text-slate-400 font-bold">{new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <p className="font-black text-red-600 text-lg">-${e.amountUSD.toFixed(2)}</p>
            </div>
          ))}
          {expenses.length === 0 && <div className="p-20 text-center text-slate-300 italic uppercase font-black text-[10px] tracking-widest">No hay gastos reportados</div>}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
