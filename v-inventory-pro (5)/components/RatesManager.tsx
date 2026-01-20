
import React, { useState } from 'react';
import { ExchangeRates } from '../types';

interface RatesManagerProps {
  rates: ExchangeRates;
  onUpdate: (r: ExchangeRates) => void;
}

const RatesManager: React.FC<RatesManagerProps> = ({ rates, onUpdate }) => {
  const [localRates, setLocalRates] = useState<ExchangeRates>(rates);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...localRates,
      lastUpdated: new Date().toISOString()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 android-shadow">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Configuración de Tasas Diarias</h3>
            <p className="text-slate-500 text-sm">Última actualización: {new Date(rates.lastUpdated).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Tasa Oficial BCV (VES / USD)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">Bs.</span>
              <input
                type="number"
                step="0.01"
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                value={localRates.ves}
                onChange={e => setLocalRates({ ...localRates, ves: parseFloat(e.target.value) })}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">Usada como multiplicador base para todas las conversiones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Euro BCV (VES / EUR)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  value={localRates.eur}
                  onChange={e => setLocalRates({ ...localRates, eur: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Tasa USDT (VES / USDT)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  value={localRates.usdt}
                  onChange={e => setLocalRates({ ...localRates, usdt: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all android-shadow flex items-center justify-center space-x-2 ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaved ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span>Tasas Actualizadas Exitosamente</span>
              </>
            ) : (
              <span>Guardar y Actualizar Precios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatesManager;
