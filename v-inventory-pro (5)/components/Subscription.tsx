
import React from 'react';
import { PlanLevel, BusinessPlan, OperationalLimits } from '../types';

interface SubscriptionProps {
  currentPlan: BusinessPlan;
  onSelectPlan: (p: BusinessPlan) => void;
}

const PLANS: BusinessPlan[] = [
  {
    level: PlanLevel.BASIC,
    price: 15,
    limits: {
      users: 3,
      registers: 1,
      companies: 1,
      products: 100,
      features: ['1 Negocio / 1 Caja', 'Hasta 3 Usuarios', 'Inventario Base', 'Historial de Ventas', 'Factura no fiscal base']
    }
  },
  {
    level: PlanLevel.PRO,
    price: 25,
    limits: {
      users: 10,
      registers: 5,
      companies: 1,
      products: 1000,
      features: [
        '5 Cajas Registradoras',
        'Hasta 10 Usuarios',
        'Reportes Avanzados (ABC/Utilidad)',
        'Alertas de Stock Bajo',
        'Catálogo Público WhatsApp',
        'Exportación CSV',
        'Logo en Tickets'
      ]
    }
  },
  {
    level: PlanLevel.PREMIUM,
    price: 49,
    limits: {
      users: 20,
      registers: 12,
      companies: 3,
      products: 99999,
      features: [
        'Multicompañía (Hasta 3)',
        '12 Cajas Registradoras',
        'Hasta 20 Usuarios',
        'Actualización Masiva de Precios',
        'Reportes KPI Avanzados',
        'Proyecciones de Inventario',
        'Soporte Prioritario'
      ]
    }
  }
];

const Subscription: React.FC<SubscriptionProps> = ({ currentPlan, onSelectPlan }) => {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">Planes de Suscripción</h2>
        <p className="text-slate-500 font-medium">Escala tu negocio con la tecnología adecuada</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan.level === plan.level;
          const isPro = plan.level === PlanLevel.PRO;
          const isPremium = plan.level === PlanLevel.PREMIUM;

          return (
            <div 
              key={plan.level} 
              className={`flex flex-col rounded-[3rem] p-10 border-4 transition-all duration-300 relative ${
                isCurrent ? 'border-black' : isPro ? 'border-blue-500 shadow-2xl shadow-blue-100 scale-105 z-10' : 'border-slate-100'
              } bg-white`}
            >
              {isPro && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Más Elegido</span>
              )}
              {isPremium && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Corporativo</span>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-black uppercase tracking-widest mb-4 ${isPro ? 'text-blue-600' : isPremium ? 'text-yellow-600' : 'text-slate-400'}`}>
                  {plan.level}
                </h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-black">${plan.price}</span>
                  <span className="text-slate-400 font-bold">/mes</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.limits.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-sm font-bold text-slate-700">
                    <svg className={`w-5 h-5 shrink-0 ${isPro ? 'text-blue-500' : isPremium ? 'text-yellow-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  isCurrent 
                    ? 'bg-slate-100 text-slate-400 cursor-default' 
                    : isPro 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100' 
                      : isPremium 
                        ? 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-xl shadow-yellow-100' 
                        : 'bg-black text-white hover:bg-slate-800'
                }`}
              >
                {isCurrent ? 'Plan Actual' : `Cambiar a ${plan.level}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
