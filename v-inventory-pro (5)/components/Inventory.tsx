
import React, { useState } from 'react';
import { Product, BusinessPlan, PlanLevel } from '../types';
import Scanner from './Scanner';

interface InventoryProps {
  products: Product[];
  plan: BusinessPlan;
  onAdd: (p: Product) => void;
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, plan, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: 'General', stock: 0, minStock: 5, basePriceUSD: 0, supplierCostUSD: 0, unit: 'Unidades', barcode: '', imageUrl: ''
  });

  const productLimit = plan.limits.products;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct && products.length >= productLimit) {
      alert(`Límite alcanzado (${productLimit} productos).`);
      return;
    }

    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name || 'Sin nombre',
      category: formData.category || 'General',
      stock: formData.stock || 0,
      minStock: formData.minStock || 0,
      basePriceUSD: formData.basePriceUSD || 0,
      supplierCostUSD: formData.supplierCostUSD || 0,
      unit: formData.unit || 'Unidades',
      barcode: formData.barcode,
      imageUrl: formData.imageUrl,
      lastPriceChange: new Date().toISOString()
    };

    if (editingProduct) onUpdate(product);
    else onAdd(product);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'General', stock: 0, minStock: 5, basePriceUSD: 0, supplierCostUSD: 0, unit: 'Unidades', barcode: '', imageUrl: '' });
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o barcode..."
              className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 focus:border-black rounded-3xl outline-none font-bold text-sm shadow-xl text-black transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
          </div>
          <button 
            onClick={() => setShowScanner(true)}
            className="bg-black text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2"/></svg>
          </button>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="w-full sm:w-auto bg-black text-white font-black px-8 py-4 rounded-3xl active:scale-95 transition-all text-[11px] uppercase tracking-widest shadow-xl"
        >
          Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => (
          <div 
            key={p.id} 
            onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }}
            className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-lg flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:shadow-2xl"
          >
            <div className="flex-1 min-w-0 pr-3">
              <h4 className="font-black text-sm text-black truncate">{p.name}</h4>
              <div className="flex items-center space-x-3 mt-1.5">
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">${p.basePriceUSD.toFixed(2)}</span>
                <span className={`text-[10px] font-black uppercase ${p.stock <= p.minStock ? 'text-red-500' : 'text-slate-400'}`}>Stock: {p.stock}</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-slate-50 rounded-3xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
              {p.imageUrl ? (
                <img src={p.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {showScanner && <Scanner onScan={c => { setSearchTerm(c); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-black text-white">
              <h3 className="text-sm font-black uppercase tracking-widest">{editingProduct ? 'Editar' : 'Nuevo'} Ítem</h3>
              <button onClick={resetForm} className="p-2 bg-white/10 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-bold text-sm text-black transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PVP (USD)</label>
                  <input type="number" step="0.01" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl font-black text-sm text-blue-600 outline-none" value={formData.basePriceUSD} onChange={e => setFormData({...formData, basePriceUSD: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Costo (USD)</label>
                  <input type="number" step="0.01" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl font-black text-sm text-slate-600 outline-none" value={formData.supplierCostUSD} onChange={e => setFormData({...formData, supplierCostUSD: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
                <input type="number" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl font-black text-sm text-red-500 outline-none" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Imagen</label>
                <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl text-sm outline-none" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div className="pt-4 flex flex-col space-y-3">
                <button type="submit" className="w-full bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl text-xs uppercase tracking-widest active:scale-[0.98] transition-all">Guardar</button>
                {editingProduct && (
                  <button type="button" onClick={() => { if(confirm('¿Borrar?')) onDelete(editingProduct.id); resetForm(); }} className="w-full py-2 text-red-500 font-bold text-[10px] uppercase tracking-widest">Eliminar permanentemente</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
