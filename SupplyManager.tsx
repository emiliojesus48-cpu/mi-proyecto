
import React, { useState, useMemo } from 'react';
import { Product, Supplier, Transaction, Currency, ExchangeRates } from '../types';

interface SupplyManagerProps {
  products: Product[];
  suppliers: Supplier[];
  onAddTransaction: (t: Transaction) => void;
  transactions: Transaction[];
  rates: ExchangeRates;
}

const SupplyManager: React.FC<SupplyManagerProps> = ({ products, suppliers, onAddTransaction, transactions, rates }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [costUSD, setCostUSD] = useState(0);

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !supplierName) return;

    const tx: Transaction = {
      id: Date.now().toString(),
      saleCode: `SUP-${Date.now().toString().slice(-4)}`,
      type: 'IN',
      category: 'SUPPLY',
      items: [{
        productId: product.id,
        name: product.name,
        quantity,
        priceUSD: product.basePriceUSD,
        costUSD: costUSD || product.supplierCostUSD
      }],
      totalUSD: (costUSD || product.supplierCostUSD) * quantity,
      payments: [{ method: 'Efectivo', amount: (costUSD || product.supplierCostUSD) * quantity, currency: Currency.USD }],
      rateAtTimeVES: rates.ves,
      status: 'PAID',
      timestamp: new Date().toISOString(),
      referenceNumber: `Proveedor: ${supplierName}`
    };

    onAddTransaction(tx);
    setSelectedProductId('');
    setSupplierName('');
    setQuantity(1);
    setCostUSD(0);
  };

  const supplyHistory = useMemo(() => {
    return transactions.filter(t => t.category === 'SUPPLY').slice(0, 20);
  }, [transactions]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-slate-100">
        <h2 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center">
          <span className="w-12 h-12 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mr-4 shadow-lg rotate-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg></span>
          Carga de Mercancía
        </h2>
        <form onSubmit={handleRestock} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proveedor / Origen</label>
            <input 
              required
              list="suppliers-list"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-bold text-sm text-black transition-all"
              placeholder="Nombre del proveedor..."
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
            />
            <datalist id="suppliers-list">
              {suppliers.map(s => <option key={s.id} value={s.name} />)}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto</label>
            <select 
              required
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-bold text-sm text-black transition-all"
              value={selectedProductId}
              onChange={e => {
                setSelectedProductId(e.target.value);
                const p = products.find(prod => prod.id === e.target.value);
                if (p) setCostUSD(p.supplierCostUSD);
              }}
            >
              <option value="">Seleccionar ítem...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Cantidad</label>
            <input type="number" min="1" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-black text-sm text-black transition-all" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Costo Unit. USD</label>
            <input type="number" step="0.01" required className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-2xl outline-none font-black text-sm text-emerald-600 transition-all" value={costUSD} onChange={e => setCostUSD(parseFloat(e.target.value))} />
          </div>

          <button type="submit" className="md:col-span-2 bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl active:scale-[0.98] transition-all text-sm uppercase tracking-widest mt-2">Cargar Inventario</button>
        </form>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Historial de Recepciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Fecha / Hora</th>
                <th className="px-8 py-5">Proveedor</th>
                <th className="px-8 py-5">Ítem</th>
                <th className="px-8 py-5">Inversión (USD / EUR / USDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {supplyHistory.map(t => {
                const item = t.items[0];
                const ves = t.totalUSD * t.rateAtTimeVES;
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-[10px] font-black text-black leading-none mb-1">{new Date(t.timestamp).toLocaleDateString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase truncate block max-w-[150px]">{t.referenceNumber?.replace('Proveedor: ', '')}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[10px] font-black text-black leading-none mb-1 truncate max-w-[200px]">{item.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Cant: {item.quantity}</p>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col space-y-0.5">
                         <span className="text-[10px] font-black text-emerald-600">${t.totalUSD.toFixed(2)} USD</span>
                         <div className="flex space-x-2 text-[8px] font-bold text-slate-400 uppercase">
                           <span>{(ves / rates.eur).toFixed(2)} EUR</span>
                           <span>{(ves / rates.usdt).toFixed(2)} USDT</span>
                         </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {supplyHistory.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-300 italic text-sm">Sin registros</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplyManager;
