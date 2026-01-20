
import React from 'react';
import { PlanLevel } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  userName: string;
  planLevel: PlanLevel;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userName, planLevel }) => {
  const isPro = planLevel === PlanLevel.PRO || planLevel === PlanLevel.PREMIUM;

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
    ) },
    { id: 'pos', label: 'Facturación POS', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
    ) },
    { id: 'inventory', label: 'Catálogo Stock', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
    ) },
    { id: 'restock', label: 'Gestión Stock', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
    ) },
    { id: 'suppliers', label: 'Proveedores', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    ) },
    { id: 'subscription', label: 'Mi Suscripción', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    ) },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-black text-white shrink-0">
      <div className="p-10 flex flex-col h-full overflow-y-auto">
        <div className="flex items-center space-x-4 mb-14">
          <div className="w-12 h-12 bg-white text-black rounded-3xl flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <span className="font-black text-2xl italic">V</span>
          </div>
          <span className="text-2xl font-black tracking-tighter">V-Inventory</span>
        </div>
        
        <nav className="space-y-3 flex-1">
          {links.map((link) => (
            <button 
              key={link.id} 
              onClick={() => onViewChange(link.id)} 
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-3xl transition-all duration-300 ${
                currentView === link.id 
                  ? 'bg-white text-black shadow-xl scale-[1.05]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={currentView === link.id ? 'text-black' : 'text-slate-500'}>
                {link.icon}
              </span>
              <span className="text-[12px] font-black uppercase tracking-[0.15em]">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-10 border-t border-white/10 flex items-center space-x-4">
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-black text-lg uppercase shadow-lg">
            {userName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-[12px] font-black truncate uppercase tracking-widest">{userName}</p>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{planLevel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
