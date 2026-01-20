
import React, { useMemo } from 'react';
import { AppState, Transaction, PlanLevel } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface DashboardProps {
  state: AppState;
  insights: string;
  onRefreshInsights: () => void;
  onOpenHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, insights, onRefreshInsights, onOpenHistory }) => {
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysTransactions = state.transactions.filter(t => t.timestamp.startsWith(todayStr));
    const todaysExpenses = state.expenses.filter(e => e.date.startsWith(todayStr));
    
    const sales = todaysTransactions.filter(t => t.type === 'OUT' && t.category === 'SALE' && t.status === 'PAID');
    const pendings = state.transactions.filter(t => t.status === 'PENDING');
    
    let totalSalesUSD = 0;
    let totalExpensesUSD = todaysExpenses.reduce((sum, e) => sum + e.amountUSD, 0);

    sales.forEach(t => {
      totalSalesUSD += t.totalUSD;
    });

    const inventoryValueRetail = state.products.reduce((sum, p) => sum + (p.basePriceUSD * p.stock), 0);
    const lowStockItems = state.products.filter(p => p.stock <= p.minStock);

    return {
      todaySalesUSD: totalSalesUSD,
      todayExpensesUSD: totalExpensesUSD,
      invValueRetail: inventoryValueRetail,
      lowStockItems,
      pendingCount: pendings.length,
      pendingAmountUSD: pendings.reduce((sum, p) => sum + p.totalUSD, 0)
    };
  }, [state.transactions, state.products, state.rates, state.expenses]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    doc.text(`Reporte Flujo de Ventas Actual - ${state.businessInfo.name}`, 14, 20);
    doc.save(`Reporte_Flujo_${today}.pdf`);
  };

  const MetricCard = ({ label, value, color, glow, subText }: any) => {
    return (
      <div className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between transition-all hover:scale-[1.02] ${glow}`}>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</h3>
        <div>
          <p className={`text-2xl font-black ${color}`}>{typeof value === 'number' ? `$${value.toFixed(2)}` : value}</p>
          {subText && <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{subText}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[12px] font-black text-black uppercase tracking-widest">Dashboard General • <span className="text-blue-600">{state.plan.level}</span></h2>
        <div className="flex items-center space-x-2">
           <button 
             onClick={onOpenHistory}
             className="bg-slate-100 text-black p-2.5 rounded-xl active:scale-95 border border-slate-200"
             title="Consultar Historial"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
           </button>
           <button onClick={exportPDF} className="bg-black text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center space-x-2 active:scale-95 transition-all shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>PDF Reporte Flujo</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Ingresos Hoy" value={analytics.todaySalesUSD} color="text-black" glow="shadow-blue-50" />
        <MetricCard label="Egresos Hoy" value={analytics.todayExpensesUSD} color="text-red-600" glow="shadow-red-50" />
        <MetricCard label="Pendientes CxC/CxP" value={analytics.pendingAmountUSD} color="text-amber-600" subText={`${analytics.pendingCount} cuentas activas`} />
        <MetricCard label="Valor Inventario" value={analytics.invValueRetail} color="text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-sm font-black text-black uppercase">Alertas de Stock</h3>
          </div>
          <div className="space-y-4">
            {analytics.lowStockItems.length > 0 ? analytics.lowStockItems.slice(0, 5).map(p => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-red-50 rounded-[1.5rem] border border-red-100">
                <span className="text-xs font-black text-red-900">{p.name}</span>
                <span className="text-[10px] font-black text-red-600 uppercase">Quedan: {p.stock}</span>
              </div>
            )) : <p className="text-center py-10 text-slate-400 italic text-sm">Inventario al día</p>}
          </div>
        </div>

        <div className="bg-black rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-400">Inteligencia de Negocio</h3>
            </div>
            <p className="text-slate-100 text-[14px] leading-relaxed italic mb-8">"{insights}"</p>
            <button onClick={onRefreshInsights} className="bg-white text-black px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-2xl">Actualizar Análisis</button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/30 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
