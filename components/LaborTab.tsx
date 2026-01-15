import React from 'react';
import { Project, LaborLine, LaborType } from '../types';
import { calculateLaborLine, formatCurrency } from '../utils/calculations';
import { useProjectStore } from '../store/useProjectStore';

interface LaborTabProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
}

const LaborTab: React.FC<LaborTabProps> = ({ project, onUpdate }) => {
  const { settings } = useProjectStore();

  const getStandardSellRate = (type: LaborType) => {
    if (type === LaborType.PRODUCTION) return settings.standardProductionSellRate;
    if (type === LaborType.ASSEMBLY) return settings.standardAssemblySellRate;
    return 50; // Fallback waarde, nooit 0
  };

  const updateLine = (id: string, updates: Partial<LaborLine>) => {
    const labor = project.labor.map(l => {
      if (l.id !== id) return l;
      
      const newLine = { ...l, ...updates };
      
      // FIX: Als we wisselen van type, pak het nieuwe standaardtarief
      if (updates.type) {
        newLine.sellRate = getStandardSellRate(newLine.type);
      }
      
      // FIX: Als we het vinkje AAN zetten, pak standaardtarief
      if (updates.sellRateEnabled === true) {
        newLine.sellRate = getStandardSellRate(newLine.type);
      } 
      
      // FIX: Als we het vinkje UIT zetten, DOE NIKS met de sellRate (laat de oude waarde staan).
      // Hier stond eerst 'sellRate = 0', dat veroorzaakte de fout in de database!
      
      return newLine;
    });
    
    onUpdate({ labor });
  };

  const addLine = () => {
    onUpdate({ 
      labor: [
        ...project.labor, 
        { 
          id: crypto.randomUUID(), 
          type: LaborType.PRODUCTION, 
          hours: 0, 
          costRate: 45, 
          sellRateEnabled: true, // Standaard AAN
          sellRate: settings.standardProductionSellRate || 65, // Nooit 0 of undefined
          travelBillable: true 
        }
      ] 
    });
  };

  const deleteLine = (id: string) => onUpdate({ labor: project.labor.filter(l => l.id !== id) });

  // Haal de project marge op voor de weergave
  const projectMargin = (project as any).generalMargin || 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Desktop View */}
      <div className="hidden md:block bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/20">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Urenregistratie & Calculatie</h3>
        </div>
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-800/30 border-b border-slate-800">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Werkzaamheid</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Uren</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-36">Inkoop / u</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-64 text-center">Vast Verkooptarief</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right text-blue-400">Verkoop Totaal</th>
              <th className="px-8 py-5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {project.labor.map(line => {
              // Berekening voor weergave
              const { laborSales } = calculateLaborLine(line, projectMargin, false);
              
              return (
                <tr key={line.id} className="hover:bg-slate-800/30 group transition-all">
                  <td className="px-8 py-6">
                    <select 
                      value={line.type} 
                      onChange={(e) => updateLine(line.id, { type: e.target.value as LaborType })} 
                      className="block w-full text-sm font-black text-white bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      {Object.values(LaborType).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <input type="number" value={line.hours} onChange={(e) => updateLine(line.id, { hours: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-xl text-sm font-black text-white text-center" />
                  </td>
                  <td className="px-8 py-6">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">€</span>
                      <input type="number" value={line.costRate} onChange={(e) => updateLine(line.id, { costRate: Number(e.target.value) })} className="w-full pl-7 pr-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-xl text-sm font-black text-white" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center justify-center gap-4 p-2 rounded-2xl border transition-colors ${line.sellRateEnabled ? 'bg-slate-950/50 border-slate-800/50' : 'bg-slate-900/30 border-transparent opacity-75'}`}>
                      <input type="checkbox" checked={line.sellRateEnabled} onChange={(e) => updateLine(line.id, { sellRateEnabled: e.target.checked })} className="w-6 h-6 rounded-lg border-slate-700 bg-slate-800 text-blue-500 cursor-pointer" />
                      <div className="relative flex-1">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs ${line.sellRateEnabled ? 'text-slate-600' : 'text-slate-700'}`}>€</span>
                        <input 
                          disabled={!line.sellRateEnabled} 
                          type="number" 
                          value={line.sellRate} 
                          onChange={(e) => updateLine(line.id, { sellRate: Number(e.target.value) })} 
                          className="w-full pl-7 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-sm font-black text-white disabled:text-slate-500 disabled:border-slate-800 disabled:bg-slate-800/50 transition-colors" 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-blue-400 text-lg">{formatCurrency(laborSales)}</td>
                  <td className="px-8 py-6 text-right"><button onClick={() => deleteLine(line.id)} className="p-3 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {project.labor.length === 0 && <div className="py-12 text-center text-slate-600 font-black uppercase text-[10px]">Geen urenregels</div>}
        {project.labor.map(line => {
          const { laborSales } = calculateLaborLine(line, projectMargin, false);
          return (
            <div key={line.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <select value={line.type} onChange={(e) => updateLine(line.id, { type: e.target.value as LaborType })} className="bg-transparent text-[10px] font-black text-blue-400 uppercase tracking-widest outline-none border-b border-blue-500/30 pb-1">
                  {Object.values(LaborType).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
                <button onClick={() => deleteLine(line.id)} className="p-2 bg-red-900/20 text-red-500 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Uren</label><input type="number" value={line.hours} onChange={(e) => updateLine(line.id, { hours: Number(e.target.value) })} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-black text-sm outline-none" /></div>
                <div><label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Inkoop p/u</label><input type="number" value={line.costRate} onChange={(e) => updateLine(line.id, { costRate: Number(e.target.value) })} className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-black text-sm outline-none" /></div>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" checked={line.sellRateEnabled} onChange={(e) => updateLine(line.id, { sellRateEnabled: e.target.checked })} className="w-5 h-5 rounded bg-slate-800 text-blue-500" />
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vast Verkooptarief</label>
                </div>
                <input disabled={!line.sellRateEnabled} type="number" value={line.sellRate} onChange={(e) => updateLine(line.id, { sellRate: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-black text-sm disabled:opacity-20" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verkoop</span>
                <span className="text-lg font-black text-blue-400">{formatCurrency(laborSales)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 md:p-10 border-t border-slate-800 bg-slate-900/40 md:rounded-[2.5rem] flex justify-center">
        <button onClick={addLine} className="w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-blue-900/30 transition-all active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Uren Toevoegen
        </button>
      </div>
    </div>
  );
};

export default LaborTab;