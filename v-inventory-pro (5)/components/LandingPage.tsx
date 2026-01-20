
import React from 'react';
import { PlanLevel, BusinessPlan } from '../types';

interface LandingPageProps {
  onSelectPlan: (plan: BusinessPlan) => void;
}

const PLANS: BusinessPlan[] = [
  {
    level: PlanLevel.BASIC,
    price: 15,
    limits: {
      users: 1,
      // Fix: Add registers property
      registers: 1,
      companies: 1,
      products: 100,
      features: ['Inventario Base', 'Reportes PDF', 'Soporte Multimoneda']
    }
  },
  {
    level: PlanLevel.PRO,
    price: 25,
    limits: {
      users: 5,
      // Fix: Add registers property
      registers: 5,
      companies: 3,
      products: 1000,
      features: ['POS Avanzado', 'Analíticas IA', 'Gestión de Sucursales', 'Escáner Ilimitado']
    }
  },
  {
    level: PlanLevel.PREMIUM,
    price: 49,
    limits: {
      users: 999,
      // Fix: Add registers property
      registers: 12,
      companies: 999,
      products: 99999,
      features: ['Todo lo de Pro', 'Soporte VIP 24/7', 'IA de Predicción', 'API de Integración']
    }
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onSelectPlan }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-20">
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 android-shadow rotate-3">
          <span className="text-white font-black text-4xl">V</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Potencia tu Negocio en Venezuela</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          La solución definitiva para control de inventario, ventas en multimoneda y cumplimiento fiscal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {PLANS.map((plan) => (
          <div key={plan.level} className={`bg-white rounded-[3rem] p-8 android-shadow border-2 transition-all hover:scale-[1.02] flex flex-col ${plan.level === PlanLevel.PRO ? 'border-blue-500 relative' : 'border-transparent'}`}>
            {plan.level === PlanLevel.PRO && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Más Popular</span>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">{plan.level}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-400 font-bold">/mes</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center space-x-3 text-slate-600 font-medium">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span>{plan.limits.users === 999 ? 'Usuarios Ilimitados' : `${plan.limits.users} Usuario(s)`}</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-600 font-medium">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span>Hasta {plan.limits.products} Productos</span>
              </li>
              {plan.limits.features.map(feat => (
                <li key={feat} className="flex items-center space-x-3 text-slate-600 font-medium">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(plan)}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all android-shadow active:scale-95 ${plan.level === PlanLevel.PRO ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              Seleccionar Plan
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 text-slate-400 text-sm font-medium flex items-center space-x-8">
        <span className="flex items-center"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg> soporte@vinventory.com.ve</span>
        <span className="flex items-center"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg> Caracas, Venezuela</span>
      </div>
    </div>
  );
};

export default LandingPage;
