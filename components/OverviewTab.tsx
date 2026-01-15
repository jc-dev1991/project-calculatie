import React from 'react';
import { Project } from '../types';
import { calculateProjectTotals, formatCurrency, formatNumber } from '../utils/calculations';
import { useProjectStore } from '../store/useProjectStore';

interface OverviewTabProps {
  project: Project;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  const { settings } = useProjectStore(); // Nodig voor valuta tekens e.d.
  const totals = calculateProjectTotals(project);

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      
      {/* 1. Header met Titel */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Financieel Overzicht</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            Realtime winst- en margeberekening
          </p>
        </div>
        {/* Hier kunnen later nog actieknoppen komen als dat nodig is */}
      </div>

      {/* 2. De KPI Dashboards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Project Omzet */}
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between h-40 group hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Omzet</p>
            <div className="w-8 h-8 rounded-full bg-blue-900/20 text-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">
              {formatCurrency(totals.subtotalSales)}
            </div>
            <div className="text-[10px] font-bold text-slate-600 mt-1">Exclusief BTW</div>
          </div>
        </div>

        {/* Bruto Winst */}
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between h-40 ring-1 ring-emerald-500/10 group hover:ring-emerald-500/30 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Bruto Winst</p>
            <div className="w-8 h-8 rounded-full bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 group-hover:scale-105 origin-left transition-transform">
              {formatCurrency(totals.grossProfit)}
            </div>
            <div className="text-[10px] font-bold text-emerald-500/40 mt-1">Netto Winstmarge</div>
          </div>
        </div>

        {/* Marge % */}
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between h-40 group hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Winstmarge %</p>
            <div className="w-8 h-8 rounded-full bg-amber-900/20 text-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white group-hover:text-amber-400 transition-colors">
              {formatNumber(totals.grossMarginPct)}%
            </div>
             <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
               <div 
                 className="h-full bg-amber-500 rounded-full" 
                 style={{ width: `${Math.min(totals.grossMarginPct, 100)}%` }}
               ></div>
             </div>
          </div>
        </div>

        {/* BTW Bedrag */}
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BTW ({project.vatRate}%)</p>
             <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-400">
              {formatCurrency(totals.vatAmount)}
            </div>
            <div className="text-[10px] font-bold text-slate-600 mt-1">Af te dragen belasting</div>
          </div>
        </div>
      </div>

      {/* 3. Detail Tabel (Optioneel, geeft mooi overzicht van de verdeling) */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/30">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Kostenverdeling</h3>
         </div>
         <table className="w-full text-left">
           <thead>
             <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
               <th className="px-8 py-4">Categorie</th>
               <th className="px-8 py-4 text-right">Inkoop</th>
               <th className="px-8 py-4 text-right">Verkoop</th>
               <th className="px-8 py-4 text-right">Winst</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-800/50 text-sm font-bold text-slate-300">
             <tr className="hover:bg-slate-800/20">
               <td className="px-8 py-4">Materialen</td>
               <td className="px-8 py-4 text-right">{formatCurrency(totals.materialsCostTotal)}</td>
               <td className="px-8 py-4 text-right text-white">{formatCurrency(totals.materialsSalesTotal)}</td>
               <td className="px-8 py-4 text-right text-emerald-500">{formatCurrency(totals.materialsSalesTotal - totals.materialsCostTotal)}</td>
             </tr>
             <tr className="hover:bg-slate-800/20">
               <td className="px-8 py-4">Arbeid & Uren</td>
               <td className="px-8 py-4 text-right">{formatCurrency(totals.laborCostTotal)}</td>
               <td className="px-8 py-4 text-right text-white">{formatCurrency(totals.laborSalesTotal)}</td>
               <td className="px-8 py-4 text-right text-emerald-500">{formatCurrency(totals.laborSalesTotal - totals.laborCostTotal)}</td>
             </tr>
             <tr className="hover:bg-slate-800/20">
               <td className="px-8 py-4">Overige Kosten</td>
               <td className="px-8 py-4 text-right">{formatCurrency(totals.extrasCostTotal)}</td>
               <td className="px-8 py-4 text-right text-white">{formatCurrency(totals.extrasSalesTotal)}</td>
               <td className="px-8 py-4 text-right text-emerald-500">{formatCurrency(totals.extrasSalesTotal - totals.extrasCostTotal)}</td>
             </tr>
           </tbody>
         </table>
      </div>

    </div>
  );
};

export default OverviewTab;