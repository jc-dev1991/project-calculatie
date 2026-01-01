
import React from 'react';
import { Project, LaborLine, LaborType } from '../types';
import { calculateLaborLine, formatCurrency } from '../utils/calculations';

interface LaborTabProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
}

const LaborTab: React.FC<LaborTabProps> = ({ project, onUpdate }) => {
  const updateLine = (id: string, updates: Partial<LaborLine>) => {
    const labor = project.labor.map(l => l.id === id ? { ...l, ...updates } : l);
    onUpdate({ labor });
  };

  const addLine = () => {
    onUpdate({ labor: [...project.labor, { id: crypto.randomUUID(), type: LaborType.PRODUCTION, hours: 0, costRate: 45, sellRateEnabled: false, sellRate: 0, travelBillable: true }] });
  };

  const deleteLine = (id: string) => onUpdate({ labor: project.labor.filter(l => l.id !== id) });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-[1.5rem] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
        <div className="flex items-center gap-3">
          <input type="checkbox" id="labor-margin-toggle" checked={project.laborMarginEnabled} onChange={(e) => onUpdate({ laborMarginEnabled: e.target.checked })} className="w-6 h-6 rounded border-slate-600 bg-slate-800 text-blue-500 cursor-pointer" />
          <label htmlFor="labor-margin-toggle" className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest cursor-pointer">Urenmarge Toepassen</label>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">%:</span>
          <input type="number" value={project.laborMarginPct} disabled={!project.laborMarginEnabled} onChange={(e) => onUpdate({ laborMarginPct: Number(e.target.value) })} className="flex-1 md:w-28 px-4 py-2 bg-slate-800 border-2 border-slate-700 rounded-xl text-sm font-black text-white disabled:opacity-30 transition-all" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Werkzaamheid</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Uren</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-36">Inkoop / u</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-64">Verkooptarief</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right text-blue-400">Verkoop Totaal</th>
              <th className="px-5 py-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {project.labor.map(line => {
              const { laborCost, laborSales } = calculateLaborLine(line, project.laborMarginPct, project.laborMarginEnabled);
              return (
                <tr key={line.id} className="hover:bg-slate-800/30 group transition-all">
                  <td className="px-5 py-5">
                    <select value={line.type} onChange={(e) => updateLine(line.id, { type: e.target.value as LaborType })} className="block w-full text-sm font-black text-white bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all">
                      {Object.values(LaborType).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-5"><input type="number" value={line.hours} onChange={(e) => updateLine(line.id, { hours: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white focus:border-blue-500 outline-none" /></td>
                  <td className="px-5 py-5"><input type="number" value={line.costRate} onChange={(e) => updateLine(line.id, { costRate: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white focus:border-blue-500 outline-none" /></td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={line.sellRateEnabled} onChange={(e) => updateLine(line.id, { sellRateEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500" />
                      {line.sellRateEnabled && <input type="number" value={line.sellRate} onChange={(e) => updateLine(line.id, { sellRate: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-bold text-white" />}
                    </div>
                  </td>
                  <td className="px-5 py-5 text-right font-black text-blue-400">{formatCurrency(laborSales)}</td>
                  <td className="px-5 py-5"><button onClick={() => deleteLine(line.id)} className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Labor Cards */}
      <div className="md:hidden space-y-4">
        {project.labor.map(line => {
          const { laborSales } = calculateLaborLine(line, project.laborMarginPct, project.laborMarginEnabled);
          return (
            <div key={line.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] space-y-4">
              <div className="flex justify-between items-center">
                <select value={line.type} onChange={(e) => updateLine(line.id, { type: e.target.value as LaborType })} className="bg-transparent text-sm font-black text-blue-400 uppercase tracking-widest outline-none">
                  {Object.values(LaborType).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
                <button onClick={() => deleteLine(line.id)} className="text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Aantal Uren</label>
                  <input type="number" value={line.hours} onChange={(e) => updateLine(line.id, { hours: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Inkoop p/u</label>
                  <input type="number" value={line.costRate} onChange={(e) => updateLine(line.id, { costRate: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                 <input type="checkbox" checked={line.sellRateEnabled} onChange={(e) => updateLine(line.id, { sellRateEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-500" />
                 <div className="flex-1">
                   <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Vast Verkooptarief</label>
                   <input disabled={!line.sellRateEnabled} type="number" value={line.sellRate} onChange={(e) => updateLine(line.id, { sellRate: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold disabled:opacity-30" />
                 </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verkoop Totaal</span>
                <span className="text-base font-black text-blue-400">{formatCurrency(laborSales)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 border-t border-slate-800 bg-slate-900/80">
        <button onClick={addLine} className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-4 bg-blue-600 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Urenregel Toevoegen
        </button>
      </div>
    </div>
  );
};

export default LaborTab;
