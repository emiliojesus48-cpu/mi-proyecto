
import React, { useState, useEffect } from 'react';
import { Product, Transaction, ExchangeRates, Currency } from '../types';
import Scanner from './Scanner';

interface SalesProps {
  products: Product[];
  rates: ExchangeRates;
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
}

const Sales: React.FC<SalesProps> = ({ products, rates, transactions, onAddTransaction }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [txType, setTxType] = useState<'OUT' | 'IN'>('OUT');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.USD);
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Hardware Scanner Listener
  useEffect(() => {
    let buffer = '';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (buffer.length > 3) {
          handleBarcodeSearch(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        setTimeout(() => buffer = '', 500); // Reset buffer if not completed
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [products]);

  const handleBarcodeSearch = (code: string) => {
    const found = products.find(p => p.barcode === code);
    if (found) {
      setSelectedProductId(found.id);
      setBarcodeInput('');
    }
  };

  // Fixed handleProcess to correctly create a Transaction object according to the defined interface
  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const totalUSD = product.basePriceUSD * quantity;

    // Added missing saleCode and status property to ensure compliance with the Transaction interface
    const newTx: Transaction = {
      id: Date.now().toString(),
      saleCode: `TX-${Date.now().toString().slice(-6)}`,
      type: txType,
      category: txType === 'OUT' ? 'SALE' : 'SUPPLY',
      items: [{
        productId: product.id,
        name: product.name,
        quantity: quantity,
        priceUSD: product.basePriceUSD,
        costUSD: product.supplierCostUSD
      }],
      totalUSD: totalUSD,
      payments: [{
        method: selectedCurrency === Currency.USDT ? 'USDT' : 'Efectivo',
        amount: totalUSD,
        currency: selectedCurrency
      }],
      rateAtTimeVES: rates.ves,
      // Fix: Add status property as required by Transaction interface
      status: 'PAID',
      timestamp: new Date().toISOString()
    };

    onAddTransaction(newTx);
    setSelectedProductId('');
    setQuantity(1);
    setBarcodeInput('');
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const calculateDerivedValues = () => {
    if (!selectedProduct) return null;
    const totalUSD = selectedProduct.basePriceUSD * quantity;
    const totalVES = totalUSD * rates.ves;
    return {
      usd: totalUSD,
      ves: totalVES,
      eur: totalVES / rates.eur,
      usdt: totalVES / rates.usdt
    };
  };

  const totals = calculateDerivedValues();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 android-shadow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center">
              <span className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center mr-4 rotate-3 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </span>
              Transacción
            </h3>
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-slate-100 p-3 rounded-2xl text-slate-600 hover:bg-slate-200 transition-all"
              title="Escáner Cámara"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            </button>
          </div>
          
          <form onSubmit={handleProcess} className="space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setTxType('OUT')}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${txType === 'OUT' ? 'bg-white text-blue-600 android-shadow' : 'text-slate-500'}`}
              >
                VENTA
              </button>
              <button
                type="button"
                onClick={() => setTxType('IN')}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${txType === 'IN' ? 'bg-white text-emerald-600 android-shadow' : 'text-slate-500'}`}
              >
                REBASTECER
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Buscar por Código</label>
              <input
                type="text"
                placeholder="Escanee o escriba código..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono"
                value={barcodeInput}
                onChange={e => {
                  setBarcodeInput(e.target.value);
                  handleBarcodeSearch(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Manualmente</label>
              <select
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
              >
                <option value="">Seleccione item...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pago en</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold"
                  value={selectedCurrency}
                  onChange={e => setSelectedCurrency(e.target.value as Currency)}
                >
                  <option value={Currency.USD}>USD / BS</option>
                  <option value={Currency.VES}>BS / BS</option>
                  <option value={Currency.EUR}>EUR / BS</option>
                  <option value={Currency.USDT}>USDT / BS</option>
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-3xl mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm leading-tight">{selectedProduct.name}</p>
                  <p className="text-xs text-slate-500">{selectedProduct.stock} disp.</p>
                </div>
              </div>
            )}

            {totals && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Total USD</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-700">${totals.usd.toFixed(2)}</p>
                    <p className="text-[10px] text-blue-400 font-bold">{totals.ves.toLocaleString()} Bs.</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-blue-200/50 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>EUR / BS</span>
                    <span>{totals.eur.toFixed(2)} € / {totals.ves.toLocaleString()} Bs.</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>USDT / BS</span>
                    <span>{totals.usdt.toFixed(2)} ₮ / {totals.ves.toLocaleString()} Bs.</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedProductId}
              className={`w-full font-black py-5 rounded-2xl transition-all android-shadow text-lg active:scale-[0.98] ${
                txType === 'OUT' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200'
              }`}
            >
              Confirmar {txType === 'OUT' ? 'Venta' : 'Carga'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden android-shadow">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Historial Diario</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Ítem</th>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">USD / Bs.</th>
                  <th className="px-6 py-4">Ganancia</th>
                  <th className="px-6 py-4">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.slice(0, 10).map((t) => {
                  // Fixed rendering to access nested items array from Transaction object
                  const item = t.items[0];
                  if (!item) return null;
                  const profit = t.type === 'OUT' ? (item.priceUSD - item.costUSD) * item.quantity : 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-800 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Cant: {item.quantity}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          t.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {t.type === 'IN' ? 'Entrada' : 'Venta'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-800 text-sm">${(item.priceUSD * item.quantity).toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400">{(item.priceUSD * item.quantity * t.rateAtTimeVES).toLocaleString()} Bs.</p>
                      </td>
                      <td className="px-6 py-5 font-black text-emerald-500 text-sm">
                        {t.type === 'OUT' ? `+$${profit.toFixed(2)}` : '--'}
                      </td>
                      <td className="px-6 py-5 text-[10px] text-slate-400 font-bold">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showScanner && <Scanner onScan={(code) => { handleBarcodeSearch(code); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
    </div>
  );
};

export default Sales;
