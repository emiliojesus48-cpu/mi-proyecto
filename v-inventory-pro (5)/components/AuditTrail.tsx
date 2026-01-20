
import React, { useState } from 'react';
import { AuditLog, Transaction } from '../types';

interface AuditTrailProps {
  logs: AuditLog[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {selectedTx && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-black uppercase tracking-widest text-sm">Detalle de Registro</h3>
               <button onClick={() => setSelectedTx(null)} className="p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/></svg></button>
             </div>
             <div className="space-y-4 text-left">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Transacción ID</p>
                  <p className="font-black text-black text-sm">{selectedTx.saleCode}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Monto Operación</p>
                  <p className="font-black text-emerald-600 text-lg">${selectedTx.totalUSD.toFixed(2)}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Responsable</p>
                  <p className="font-black text-black text-sm uppercase">Administrador Principal</p>
               </div>
               <button onClick={() => setSelectedTx(null)} className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4">Cerrar Detalle</button>
             </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-black text-white">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Bitácora de Auditoría</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Control de accesos y modificaciones</p>
          </div>
          <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Registro</th>
                <th className="px-8 py-5">Usuario</th>
                <th className="px-8 py-5">Evento</th>
                <th className="px-8 py-5">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr 
                  key={log.id} 
                  className={`hover:bg-slate-50 transition-colors ${log.relatedTransaction ? 'cursor-pointer' : ''}`}
                  onClick={() => log.relatedTransaction && setSelectedTx(log.relatedTransaction)}
                >
                  <td className="px-8 py-5 text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-black bg-slate-100 px-3 py-1 rounded-full">{log.user}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase text-blue-600">{log.event}</span>
                  </td>
                  <td className="px-8 py-5 text-xs font-medium text-slate-600 flex items-center space-x-2">
                    <span>{log.details}</span>
                    {log.relatedTransaction && <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
