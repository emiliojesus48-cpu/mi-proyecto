
import React, { useState } from 'react';
import { AppState, AuditLog, Expense, Transaction, CreditIdentity } from '../types';
import Credits from './Credits';
import Expenses from './Expenses';
import AuditTrail from './AuditTrail';

interface AuditHubProps {
  state: AppState;
  onUpdateTransactionStatus: (id: string, status: 'PAID' | 'PENDING') => void;
  onAddExpense: (e: Expense) => void;
  onAddTransaction: (t: Transaction) => void;
}

const AuditHub: React.FC<AuditHubProps> = ({ state, onUpdateTransactionStatus, onAddExpense, onAddTransaction }) => {
  const [tab, setTab] = useState<'logs' | 'expenses' | 'credits'>('logs');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex bg-slate-100 p-2 rounded-[2rem] w-fit mx-auto shadow-inner mb-8">
        {[
          { id: 'logs', label: 'Seguridad', icon: '🛡️' },
          { id: 'expenses', label: 'Egresos', icon: '💸' },
          { id: 'credits', label: 'Cuentas', icon: '🏦' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${tab === t.id ? 'bg-black text-white shadow-xl scale-105' : 'text-slate-500'}`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'logs' && <AuditTrail logs={state.auditLogs} />}
      {tab === 'expenses' && <Expenses expenses={state.expenses} onAddExpense={onAddExpense} />}
      {tab === 'credits' && <Credits transactions={state.transactions} rates={state.rates} onUpdateStatus={onUpdateTransactionStatus} onAddTransaction={onAddTransaction} />}
    </div>
  );
};

export default AuditHub;
