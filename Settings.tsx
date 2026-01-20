
import React, { useState } from 'react';
import { BusinessInfo } from '../types';

interface SettingsProps {
  info: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ info, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<BusinessInfo>(info);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 android-shadow">
        <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase mb-6 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Datos del Establecimiento
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
            <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Documento de Identidad (RIF)</label>
            <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-mono text-sm font-bold" value={formData.rif} onChange={e => setFormData({ ...formData, rif: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Fiscal</label>
            <textarea required rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-medium" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <button type="submit" className={`w-full font-black py-4 rounded-2xl transition-all android-shadow text-[11px] uppercase tracking-widest flex items-center justify-center space-x-2 ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            {saved ? <span>Cambios Guardados</span> : <span>Guardar Configuración</span>}
          </button>
        </form>
      </div>

      <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex flex-col space-y-4">
        <div>
          <h4 className="font-black uppercase tracking-widest text-[9px] text-red-600 mb-1">Zona de Seguridad</h4>
          <p className="text-[11px] text-red-500 leading-tight">Al salir se cerrará el acceso a la caja y el inventario.</p>
        </div>
        <button onClick={onLogout} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default Settings;
