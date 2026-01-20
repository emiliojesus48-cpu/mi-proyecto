
import React, { useState, useMemo } from 'react';
import { Supplier, Transaction } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  transactions: Transaction[];
  onAddSupplier: (s: Supplier) => void;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, transactions, onAddSupplier }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({ name: '', rif: '', address: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSupplier({
      id: Date.now().toString(),
      name: formData.name || '',
      rif: formData.rif || '',
      address: formData.address || '',
      phone: formData.phone || ''
    });
    setFormData({ name: '', rif: '', address: '', phone: '' });
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directorio de Proveedores</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider android-shadow">Añadir Proveedor</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-2xl android-shadow border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-slate-900 text-[14px] uppercase">{s.name}</h3>
                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{s.rif}</span>
              </div>
              <div className="space-y-1 mt-3">
                <div className="flex items-center text-[11px] text-slate-500"><svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{s.phone}</div>
                <div className="flex items-center text-[11px] text-slate-500"><svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{s.address}</div>
              </div>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 italic">No hay proveedores registrados</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl android-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-[12px] text-slate-800 uppercase">Nuevo Proveedor</h3>
              <button onClick={() => setShowModal(false)} className="p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1"><label className="block text-[9px] font-black text-slate-400 uppercase">Razón Social</label><input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-1"><label className="block text-[9px] font-black text-slate-400 uppercase">RIF</label><input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={formData.rif} onChange={e => setFormData({...formData, rif: e.target.value})} /></div>
              <div className="space-y-1"><label className="block text-[9px] font-black text-slate-400 uppercase">Teléfono</label><input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div className="space-y-1"><label className="block text-[9px] font-black text-slate-400 uppercase">Dirección</label><input required className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest android-shadow">Guardar Proveedor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
