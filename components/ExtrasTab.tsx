
import React from 'react';
import { Project, ExtraCostLine } from '../types';
import { calculateExtraLine, formatCurrency } from '../utils/calculations';

interface ExtrasTabProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
}

const ExtrasTab: React.FC<ExtrasTabProps> = ({ project, onUpdate }) => {
  const updateLine = (id: string, updates: Partial<ExtraCostLine>) => {
    const extras = project.extras.map(e => e.id === id ? { ...e, ...updates } : e);
    onUpdate({ extras });
  };

  const addLine = () => {
    onUpdate({ extras: [...project.extras, { id: crypto.randomUUID(), description: '', cost: 0, marginEnabled: true, marginPct: 15 }] });
  };

  const deleteLine = (id: string) => onUpdate({ extras: project.extras.filter(e => e.id !== id) });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Desktop Table */}
      <div className="hidden md:block bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Omschrijving</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40">Kosten (€)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">Marge (%)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-right text-blue-400">Verkoop</th>
              <th className="px-6 py-5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {project.extras.map(line => {
              const { sales } = calculateExtraLine(line);
              return (
                <tr key={line.id} className="hover:bg-slate-800/30 group transition-all">
                  <td className="px-6 py-5"><input type="text" value={line.description} placeholder="Beschrijving..." onChange={(e) => updateLine(line.id, { description: e.target.value })} className="w-full bg-transparent border-b border-slate-700 focus:border-blue-500 py-1 outline-none font-bold text-white" /></td>
                  <td className="px-6 py-5"><input type="number" step="0.01" value={line.cost} onChange={(e) => updateLine(line.id, { cost: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white" /></td>
                  <td className="px-6 py-5"><div className="flex items-center gap-3"><input type="checkbox" checked={line.marginEnabled} onChange={(e) => updateLine(line.id, { marginEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500" />{line.marginEnabled && <input type="number" value={line.marginPct} onChange={(e) => updateLine(line.id, { marginPct: Number(e.target.value) })} className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white" />}</div></td>
                  <td className="px-6 py-5 text-right font-black text-blue-400">{formatCurrency(sales)}</td>
                  <td className="px-6 py-5 text-right"><button onClick={() => deleteLine(line.id)} className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Extras Cards */}
      <div className="md:hidden space-y-4">
        {project.extras.length === 0 && <p className="text-center py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Geen onkosten</p>}
        {project.extras.map(line => {
          const { sales } = calculateExtraLine(line);
          return (
            <div key={line.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] space-y-4">
              <div className="flex justify-between items-start">
                <input value={line.description} placeholder="Omschrijving..." onChange={(e) => updateLine(line.id, { description: e.target.value })} className="flex-1 bg-transparent border-b border-slate-800 text-sm font-black text-white outline-none mr-2" />
                <button onClick={() => deleteLine(line.id)} className="text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Bedrag</label><input type="number" step="0.01" value={line.cost} onChange={(e) => updateLine(line.id, { cost: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold" /></div>
                <div><label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Marge %</label><div className="flex items-center gap-2"><input type="checkbox" checked={line.marginEnabled} onChange={(e) => updateLine(line.id, { marginEnabled: e.target.checked })} className="w-5 h-5 rounded bg-slate-800 text-blue-500" /><input disabled={!line.marginEnabled} type="number" value={line.marginPct} onChange={(e) => updateLine(line.id, { marginPct: Number(e.target.value) })} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold disabled:opacity-30" /></div></div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Totaal Verkoop</span>
                <span className="text-base font-black text-blue-400">{formatCurrency(sales)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 border-t border-slate-800 bg-slate-900/80">
        <button onClick={addLine} className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-4 bg-blue-600 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Nieuwe Onkostenregel
        </button>
      </div>
    </div>
  );
};

export default ExtrasTab;
