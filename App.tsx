
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ExchangeRates, 
  Product, 
  Transaction, 
  AppState,
  BusinessInfo,
  BusinessPlan,
  Supplier,
  PlanLevel,
  Expense,
  AuditLog
} from './types';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import RatesManager from './components/RatesManager';
import Settings from './components/Settings';
import SupplyManager from './components/SupplyManager';
import Suppliers from './components/Suppliers';
import Sidebar from './components/Sidebar';
import Subscription from './components/Subscription';
import AuditHub from './components/AuditHub';
import { getBusinessInsights } from './services/geminiService';

const INITIAL_RATES: ExchangeRates = {
  ves: 46.50,
  eur: 49.80,
  usdt: 47.20,
  lastUpdated: new Date().toISOString()
};

const INITIAL_BUSINESS: BusinessInfo = {
  name: 'V-Inventory Pro',
  rif: 'J-12345678-9',
  address: 'Caracas, Venezuela'
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'pos' | 'inventory' | 'restock' | 'suppliers' | 'subscription' | 'audit_hub'>('dashboard');
  const [showConfig, setShowConfig] = useState(false);
  const [configSubView, setConfigSubView] = useState<'rates' | 'settings'>('rates');

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('v_inventory_data_v6');
    if (saved) return JSON.parse(saved);
    return {
      products: [],
      transactions: [],
      expenses: [],
      auditLogs: [],
      suppliers: [],
      rates: INITIAL_RATES,
      businessInfo: INITIAL_BUSINESS,
      plan: null as any,
      user: null
    };
  });
  
  const [insights, setInsights] = useState<string>("Analizando datos...");

  useEffect(() => {
    if (state.plan) {
      localStorage.setItem('v_inventory_data_v6', JSON.stringify(state));
    }
  }, [state]);

  const fetchInsights = useCallback(async () => {
    if (state.user && (state.transactions.length > 0 || state.products.length > 0)) {
      const res = await getBusinessInsights(state.products, state.transactions, state.rates);
      setInsights(res);
    } else {
      setInsights("Inicia operaciones para obtener análisis de IA.");
    }
  }, [state.products, state.transactions, state.rates, state.user]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const addLog = (event: string, details: string, relatedTransaction?: Transaction) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      event,
      details,
      user: state.user?.name || 'Sistema',
      timestamp: new Date().toISOString(),
      relatedTransaction
    };
    setState(prev => ({ ...prev, auditLogs: [log, ...prev.auditLogs].slice(0, 100) }));
  };

  const addTransaction = (transaction: Transaction) => {
    setState(prev => {
      const updatedProducts = prev.products.map(p => {
        const itemInTx = transaction.items.find(i => i.productId === p.id);
        if (itemInTx) {
          const delta = transaction.type === 'IN' ? itemInTx.quantity : -itemInTx.quantity;
          return { ...p, stock: Math.max(0, p.stock + delta) };
        }
        return p;
      });

      return {
        ...prev,
        products: updatedProducts,
        transactions: [transaction, ...prev.transactions]
      };
    });
    addLog(transaction.type === 'OUT' ? 'Venta' : 'Suministro', `Ticket: ${transaction.saleCode}`, transaction);
  };

  if (!state.plan) return <LandingPage onSelectPlan={(p) => setState(prev => ({...prev, plan: p}))} />;
  if (!state.user?.isAuthenticated) return <Login onLogin={(name) => setState(prev => ({...prev, user: { isAuthenticated: true, name }}))} />;

  const viewTitles: Record<string, string> = {
    dashboard: 'Panel de Control',
    pos: 'Ventas e Historial',
    inventory: 'Catálogo de Productos',
    restock: 'Gestión de Stock',
    suppliers: 'Proveedores',
    subscription: 'Planes y Facturación',
    audit_hub: 'Auditoría y Egresos'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black font-sans">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentView={view} 
        onViewChange={(v: any) => setView(v)} 
        userName={state.user.name} 
        planLevel={state.plan.level}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center z-30">
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-black uppercase italic tracking-tighter">V-Inventory</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{viewTitles[view]} • <span className="text-blue-600 font-black">{state.plan.level}</span></p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setView('audit_hub')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all border ${view === 'audit_hub' ? 'bg-black text-white border-black' : 'bg-slate-50 text-black border-slate-200'}`}
              title="Auditoría"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </button>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="w-9 h-9 bg-slate-50 text-black rounded-xl flex items-center justify-center active:scale-95 transition-all border border-slate-200"
              title="Ajustes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          </div>
        </header>

        {/* Config Overlay */}
        {showConfig && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex space-x-1">
                  <button onClick={() => setConfigSubView('rates')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${configSubView === 'rates' ? 'bg-black text-white' : 'bg-slate-50 text-slate-400'}`}>Tasas</button>
                  <button onClick={() => setConfigSubView('settings')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${configSubView === 'settings' ? 'bg-black text-white' : 'bg-slate-50 text-slate-400'}`}>Perfil</button>
                </div>
                <button onClick={() => setShowConfig(false)} className="p-2 text-black"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="p-4">
                {configSubView === 'rates' ? (
                  <RatesManager rates={state.rates} onUpdate={(r) => setState(prev => ({...prev, rates: r}))} />
                ) : (
                  <Settings info={state.businessInfo} onUpdate={(i) => { setState(prev => ({...prev, businessInfo: i})); addLog('Ajuste Perfil', 'Datos actualizados'); }} onLogout={() => setState(prev => ({...prev, user: null}))} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 pb-24 md:pb-6">
          {view === 'dashboard' && <Dashboard state={state} insights={insights} onRefreshInsights={fetchInsights} onOpenHistory={() => setView('pos')} />}
          {view === 'pos' && <POS products={state.products} rates={state.rates} onProcessSale={addTransaction} allTransactions={state.transactions} plan={state.plan} businessInfo={state.businessInfo} />}
          {view === 'inventory' && (
            <Inventory 
              products={state.products} 
              plan={state.plan}
              onAdd={(p) => { setState(prev => ({...prev, products: [...prev.products, p]})); addLog('Nuevo Producto', p.name); }}
              onUpdate={(up) => { setState(prev => ({...prev, products: prev.products.map(p => p.id === up.id ? up : p)})); addLog('Edición Producto', up.name); }}
              onDelete={(id) => { setState(prev => ({...prev, products: prev.products.filter(p => p.id !== id)})); addLog('Eliminación Producto', `ID: ${id}`); }}
            />
          )}
          {view === 'restock' && <SupplyManager products={state.products} suppliers={state.suppliers} onAddTransaction={addTransaction} transactions={state.transactions} rates={state.rates} />}
          {view === 'suppliers' && <Suppliers suppliers={state.suppliers} transactions={state.transactions} onAddSupplier={(s) => setState(prev => ({...prev, suppliers: [...prev.suppliers, s]}))} />}
          {view === 'subscription' && <Subscription currentPlan={state.plan} onSelectPlan={(p) => { setState(prev => ({...prev, plan: p})); setView('dashboard'); }} />}
          {view === 'audit_hub' && <AuditHub state={state} onUpdateTransactionStatus={(id, status) => setState(prev => ({...prev, transactions: prev.transactions.map(t => t.id === id ? {...t, status} : t)}))} onAddExpense={(e) => { setState(prev => ({...prev, expenses: [e, ...prev.expenses]})); addLog('Gasto Registrado', `${e.description} - $${e.amountUSD}`); }} onAddTransaction={addTransaction} />}
        </main>

        {/* Mobile Bottom Nav - REORDERED 5 ITEMS */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-1 py-1 flex md:hidden justify-around items-center safe-bottom z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <NavButton active={view === 'dashboard'} label="Panel" onClick={() => setView('dashboard')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          </NavButton>
          <NavButton active={view === 'inventory'} label="Catálogo" onClick={() => setView('inventory')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </NavButton>
          {/* POS CENTER */}
          <button 
            onClick={() => setView('pos')}
            className={`w-14 h-14 -mt-6 bg-black text-white rounded-full flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all border-4 border-white ${view === 'pos' ? 'bg-blue-600' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </button>
          <NavButton active={view === 'restock'} label="Stock" onClick={() => setView('restock')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          </NavButton>
          <NavButton active={view === 'suppliers'} label="Proveed." onClick={() => setView('suppliers')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </NavButton>
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, label, children, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center py-2 flex-1 transition-all ${active ? 'text-black font-black' : 'text-slate-400'}`}>
    <div className={`p-1.5 rounded-xl ${active ? 'bg-slate-50' : ''}`}>{children}</div>
    <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">{label}</span>
  </button>
);

export default App;
