
import React, { useState, useMemo } from 'react';
import { Product, CartItem, Currency, ExchangeRates, Transaction, PaymentMethodType, BusinessPlan, PlanLevel, BusinessInfo } from '../types';
import Scanner from './Scanner';

interface POSProps {
  products: Product[];
  rates: ExchangeRates;
  onProcessSale: (transaction: Transaction) => void;
  allTransactions: Transaction[];
  plan: BusinessPlan;
  businessInfo: BusinessInfo;
}

const POS: React.FC<POSProps> = ({ products, rates, onProcessSale, allTransactions, plan, businessInfo }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [viewState, setViewState] = useState<'history' | 'cart' | 'checkout'>('history');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [saleCode, setSaleCode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | 'Crédito' | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const isPro = plan.level === PlanLevel.PRO || plan.level === PlanLevel.PREMIUM;

  const generateCode = () => `TICKET-${Date.now().toString().slice(-6)}`;

  const startNewSale = () => {
    setCart([]);
    setReferenceNumber('');
    setSaleCode(generateCode());
    setSelectedPaymentMethod(null);
    setViewState('cart');
  };

  const totals = useMemo(() => {
    const usd = cart.reduce((sum, item) => sum + (item.basePriceUSD * item.cartQuantity), 0);
    const ves = usd * rates.ves;
    return { usd, ves, eur: ves / rates.eur, usdt: ves / rates.usdt };
  }, [cart, rates]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, cartQuantity: Math.max(0, item.cartQuantity + delta) };
      return item;
    }).filter(i => i.cartQuantity > 0));
  };

  const handleFinish = () => {
    if (cart.length === 0 || !selectedPaymentMethod) return;
    const isCredit = selectedPaymentMethod === 'Crédito';
    const tx: Transaction = {
      id: Date.now().toString(),
      saleCode,
      type: 'OUT',
      category: 'SALE',
      items: cart.map(i => ({ productId: i.id, name: i.name, quantity: i.cartQuantity, priceUSD: i.basePriceUSD, costUSD: i.supplierCostUSD })),
      totalUSD: totals.usd,
      payments: isCredit ? [] : [{ method: selectedPaymentMethod as PaymentMethodType, amount: totals.usd, currency: Currency.USD }],
      rateAtTimeVES: rates.ves,
      status: isCredit ? 'PENDING' : 'PAID',
      timestamp: new Date().toISOString(),
      referenceNumber
    };
    onProcessSale(tx);
    setViewState('history');
    setCart([]);
  };

  const historyForDate = allTransactions.filter(t => t.timestamp.startsWith(selectedDate) && t.category === 'SALE');

  if (viewState === 'history') {
    return (
      <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto">
        {selectedTransaction && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-8 flex flex-col items-center border-b border-slate-50 text-center">
                {isPro && businessInfo.logo && <img src={businessInfo.logo} className="w-16 h-16 mb-4 object-contain" alt="Logo" />}
                <h3 className="font-black text-black uppercase text-base">{businessInfo.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{businessInfo.rif}</p>
                <div className="flex flex-col text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-3 w-full">
                   <span>Fecha: {new Date(selectedTransaction.timestamp).toLocaleDateString()}</span>
                   <span>Hora: {new Date(selectedTransaction.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="mt-4 px-4 py-1.5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Factura {selectedTransaction.saleCode}</div>
              </div>
              <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="divide-y divide-slate-100">
                  {selectedTransaction.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex justify-between">
                      <div className="flex-1 pr-4">
                        <p className="font-black text-black text-xs leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.quantity} x ${item.priceUSD}</p>
                      </div>
                      <p className="font-black text-black text-xs">${(item.quantity * item.priceUSD).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-2 border border-slate-100">
                  <div className="flex justify-between font-black text-black text-sm"><span>TOTAL USD</span><span>${selectedTransaction.totalUSD.toFixed(2)}</span></div>
                  <div className="flex justify-between font-black text-blue-600 text-xs"><span>TOTAL VES</span><span>{(selectedTransaction.totalUSD * selectedTransaction.rateAtTimeVES).toLocaleString()} Bs.</span></div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mt-4"><span>PAGO</span><span>{selectedTransaction.payments[0]?.method || 'Crédito'}</span></div>
                </div>
              </div>
              <div className="p-8 bg-slate-50">
                <button onClick={() => setSelectedTransaction(null)} className="w-full bg-black text-white font-black py-5 rounded-[2rem] uppercase text-[10px] tracking-widest active:scale-95">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl text-center space-y-8">
          <div className="w-24 h-24 bg-black text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter">Facturación POS</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Caja Registradora 01</p>
          </div>
          <button onClick={startNewSale} className="w-full bg-black text-white font-black py-6 rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]">Facturar Nueva Venta</button>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-black uppercase tracking-widest">Facturas del {selectedDate}</h3>
            <div className="relative">
              <input type="date" className="opacity-0 absolute inset-0 cursor-pointer" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <button className="bg-slate-100 text-black px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center space-x-2 border border-slate-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>Cambiar Fecha</span>
              </button>
            </div>
          </div>
          <div className="overflow-y-auto divide-y divide-slate-50">
            {historyForDate.map(sale => (
              <div key={sale.id} onClick={() => setSelectedTransaction(sale)} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer">
                <div>
                  <p className="font-black text-black text-sm uppercase">{sale.saleCode}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(sale.timestamp).toLocaleTimeString()} • {sale.status === 'PAID' ? 'Contado' : 'Crédito'}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-black text-sm">${sale.totalUSD.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">{(sale.totalUSD * sale.rateAtTimeVES).toLocaleString()} Bs.</p>
                </div>
              </div>
            ))}
            {historyForDate.length === 0 && <div className="p-20 text-center text-slate-300 italic uppercase font-black tracking-widest text-[10px]">Sin ventas registradas</div>}
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'cart') {
    return (
      <div className="flex flex-col h-full space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <button onClick={() => setViewState('history')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg></button>
          <div><h2 className="text-base font-black text-black uppercase tracking-tight">Carrito de Facturación</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{saleCode}</p></div>
        </div>
        <div className="relative group flex items-center space-x-2">
          <div className="relative flex-1">
            <input type="text" placeholder="Buscar por nombre o barcode..." className="w-full pl-12 pr-4 py-5 bg-white border-2 border-slate-100 focus:border-black rounded-[2.5rem] outline-none font-black text-sm shadow-xl transition-all" value={searchTerm} autoFocus onChange={e => setSearchTerm(e.target.value)} />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-black"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></span>
          </div>
          <button onClick={() => setShowScanner(true)} className="bg-black text-white p-5 rounded-full active:scale-90 transition-all shadow-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2"/></svg></button>
        </div>
        {searchTerm && (
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-2xl z-20">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode === searchTerm).slice(0, 5).map(p => (
              <button key={p.id} onClick={() => addToCart(p)} className="w-full p-5 flex justify-between items-center active:bg-slate-50 text-left">
                <div><p className="font-black text-black text-sm">{p.name}</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">${p.basePriceUSD} • Disp: {p.stock}</p></div>
                <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"/></svg></div>
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 p-8 shadow-2xl flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4"><h3 className="text-[11px] font-black text-black uppercase tracking-widest">Productos a Cobrar</h3><button onClick={() => setCart([])} className="text-[10px] font-black text-red-500 uppercase underline decoration-2 underline-offset-4">Vaciar</button></div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                <div className="flex-1 pr-3">
                  <p className="font-black text-[12px] text-black leading-tight truncate">{item.name}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">${item.basePriceUSD}</p>
                </div>
                <div className="flex items-center bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-red-500 active:scale-75 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M20 12H4"/></svg></button>
                  <span className="px-4 font-black text-sm text-black min-w-[30px] text-center">{item.cartQuantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-blue-500 active:scale-75 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"/></svg></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20 opacity-50"><svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg><p className="text-[11px] font-black uppercase tracking-widest text-center">Escanee o busque ítems</p></div>}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50"><button disabled={cart.length === 0} onClick={() => setViewState('checkout')} className="w-full bg-black text-white p-6 rounded-[2.5rem] flex justify-between items-center active:scale-[0.98] transition-all shadow-2xl disabled:bg-slate-100 disabled:text-slate-300"><div><p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-2 tracking-[0.2em]">Liquidación VES</p><p className="font-black text-3xl tracking-tighter">{totals.ves.toLocaleString()} Bs.</p></div><div className="text-right"><p className="text-[11px] font-black text-slate-400 uppercase leading-none mb-2 tracking-widest">USD TOTAL</p><p className="font-black text-2xl">${totals.usd.toFixed(2)}</p></div></button></div>
        </div>

        {showScanner && <Scanner onScan={c => { setSearchTerm(c); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
      </div>
    );
  }

  if (viewState === 'checkout') {
    return (
      <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-2xl space-y-8 flex flex-col max-w-4xl mx-auto h-full overflow-y-auto">
        <div className="flex items-center space-x-4"><button onClick={() => setViewState('cart')} className="p-4 bg-slate-50 rounded-2xl text-black border border-slate-100 active:scale-95 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg></button><div><h2 className="text-2xl font-black text-black uppercase tracking-tight">Cobro de Factura</h2><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Cierre de operación</p></div></div>
        <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-center"><span className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em] mb-4 block">Total a Cobrar</span><span className="text-6xl font-black text-black tracking-tighter">{totals.ves.toLocaleString()} Bs.</span><div className="grid grid-cols-3 gap-6 mt-10"><div className="bg-white p-4 rounded-2xl shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equiv. USD</p><p className="text-lg font-black text-black">${totals.usd.toFixed(2)}</p></div><div className="bg-white p-4 rounded-2xl shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equiv. EUR</p><p className="text-lg font-black text-black">{totals.eur.toFixed(1)}€</p></div><div className="bg-white p-4 rounded-2xl shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Equiv. USDT</p><p className="text-lg font-black text-black">{totals.usdt.toFixed(1)}₮</p></div></div></div>
        <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Referencia / Cliente</label><input type="text" placeholder="Ej: Pago móvil / Ref..." className="w-full px-7 py-5 bg-slate-50 border-2 border-slate-100 focus:border-black rounded-[2rem] outline-none font-bold text-sm text-black transition-all" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} /></div>
        <div className="space-y-4"><p className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">Método de Pago</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'Pago Móvil', icon: '📱', color: 'bg-indigo-600' },
            { id: 'Efectivo', icon: '💵', color: 'bg-emerald-600' },
            { id: 'Punto', icon: '💳', color: 'bg-blue-600' },
            { id: 'Divisa', icon: '💰', color: 'bg-amber-600' },
            { id: 'USDT', icon: '₮', color: 'bg-teal-600' },
            { id: 'Zelle', icon: '⚡', color: 'bg-purple-600' },
            { id: 'Oro', icon: '✨', color: 'bg-yellow-500' },
            { id: 'Crédito', icon: '⏳', color: 'bg-slate-700' }
          ].map(m => (
            <button key={m.id} onClick={() => setSelectedPaymentMethod(m.id as any)} className={`${selectedPaymentMethod === m.id ? 'ring-8 ring-black ring-offset-2 scale-105 shadow-2xl z-10' : 'opacity-70 hover:opacity-100'} ${m.color} text-white p-6 rounded-[2.5rem] flex flex-col items-center justify-center space-y-2 transition-all h-32`}>
              <span className="text-3xl">{m.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{m.id}</span>
            </button>
          ))}
        </div></div>
        {selectedPaymentMethod && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
            <button onClick={handleFinish} className="w-full bg-black text-white font-black py-7 rounded-[3rem] shadow-2xl active:scale-[0.98] transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center space-x-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
              <span>{selectedPaymentMethod === 'Crédito' ? 'Confirmar Crédito (CxC)' : 'Completar y Guardar Ticket'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default POS;
