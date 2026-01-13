
import React, { useState } from 'react';
import { Project, ProjectStatus, OfferSettings } from '../types';
import { formatCurrency, calculateProjectTotals } from '../utils/calculations';
import { useT, Language } from '../utils/translations';
import { useProjectStore } from '../store/useProjectStore';

interface ProjectListProps {
  projects: Project[];
  onSelect: (p: Project) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onUpdateStatus?: (id: string, status: ProjectStatus) => void;
  language?: Language;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelect, onAdd, onDuplicate, onUpdateStatus, language = 'nl' }) => {
  const { settings } = useProjectStore();
  const t = useT(language as Language);
  
  const wonProjects = projects.filter(p => p.status === ProjectStatus.ACCEPTED || p.status === ProjectStatus.COMPLETED);
  
  let totalWonSales = 0;
  let totalWonProfit = 0;
  let totalLaborValue = 0;
  let totalMaterialCost = 0;
  let totalPotentialProfit = 0; // Som van winst van ALLE projecten

  projects.forEach(p => {
    const totals = calculateProjectTotals(p);
    totalPotentialProfit += totals.grossProfit;
  });

  wonProjects.forEach(p => {
    const totals = calculateProjectTotals(p);
    totalWonSales += totals.subtotalSales;
    totalWonProfit += totals.grossProfit;
    totalLaborValue += totals.laborSalesTotal;
    totalMaterialCost += totals.materialsCostTotal;
  });

  const realizedMarginPct = totalWonSales > 0 ? (totalWonProfit / totalWonSales) * 100 : 0;
  
  const target = settings.targetMarginPct || 35;
  const diff = realizedMarginPct - target;
  
  let healthStatus = t('healthOnTrack');
  let healthColor = 'text-emerald-400';
  let healthBg = 'bg-emerald-500/10';
  let healthRing = 'ring-emerald-500/20';

  if (diff > 5) {
    healthStatus = t('healthExcellent');
    healthColor = 'text-blue-400';
    healthBg = 'bg-blue-500/10';
    healthRing = 'ring-blue-500/30';
  } else if (diff < -15) {
    healthStatus = t('healthCritical');
    healthColor = 'text-red-400';
    healthBg = 'bg-red-500/10';
    healthRing = 'ring-red-500/40';
  } else if (diff < -5) {
    healthStatus = t('healthWarning');
    healthColor = 'text-amber-400';
    healthBg = 'bg-amber-500/10';
    healthRing = 'ring-amber-500/30';
  }

  const efficiencyIndex = totalMaterialCost > 0 ? (totalLaborValue / totalMaterialCost).toFixed(1) : '0.0';

  const stats = {
    total: projects.length,
    drafts: projects.filter(p => p.status === ProjectStatus.DRAFT).length,
    sent: projects.filter(p => p.status === ProjectStatus.SENT).length,
    totalWins: wonProjects.length,
    acceptedValue: totalWonSales,
    totalValue: projects.reduce((acc, p) => acc + calculateProjectTotals(p).subtotalSales, 0),
  };

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.DRAFT: return 'bg-amber-900/40 text-amber-400 border-amber-800/50';
      case ProjectStatus.ACCEPTED: return 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50';
      case ProjectStatus.COMPLETED: return 'bg-indigo-900/40 text-indigo-400 border-indigo-800/50';
      case ProjectStatus.SENT: return 'bg-blue-900/40 text-blue-400 border-blue-800/50';
      case ProjectStatus.ARCHIVED: return 'bg-slate-800 text-slate-500 border-slate-700';
      default: return 'bg-slate-800 text-slate-500 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase">Management Overview</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">{language === 'nl' ? 'Status rapportage van lopende calculaties en projecten' : 'Status reporting of ongoing calculations and projects'}</p>
        </div>
        <button onClick={onAdd} className="flex lg:hidden items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/30 active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          <span className="uppercase tracking-[0.1em] text-sm">{t('newProject')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Totaal Dossiers */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('total')}</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">{stats.total}</div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('activeDossiers')}</p>
        </div>

        {/* 2. Concepten */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" /></svg>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('drafts')}</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">{stats.drafts}</div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{language === 'nl' ? 'In Voorbereiding' : 'In Preparation'}</p>
        </div>

        {/* 3. Verzonden (NIEUW) */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verzonden</span>
          </div>
          <div className="text-4xl font-black text-white mb-1">{stats.sent}</div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{language === 'nl' ? 'Wacht op goedkeuring' : 'Awaiting Approval'}</p>
        </div>

        {/* 4. Omzet */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === 'nl' ? 'Omzet' : 'Revenue'}</span>
          </div>
          <div className="text-2xl font-black text-white mb-1 leading-none pt-1">{formatCurrency(stats.acceptedValue)}</div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t('acceptedValue')}</p>
        </div>

        {/* 5. Totaal Bruto Winst (NIEUW) */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('grossProfit')}</span>
          </div>
          <div className="text-2xl font-black text-white mb-1 leading-none pt-1">{formatCurrency(totalPotentialProfit)}</div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{language === 'nl' ? 'Totaal Gecalculeerde Winst' : 'Total Calculated Profit'}</p>
        </div>

        {/* 6. Marge Health */}
        <div className={`bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group transition-all relative overflow-hidden ring-1 ${healthRing}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${healthBg} ${healthColor}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${healthBg} ${healthColor}`}>
               {healthStatus}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-black text-white mb-1">{realizedMarginPct.toFixed(1)}%</div>
            <span className="text-[9px] font-black text-slate-500 uppercase">{t('avgMargin')}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('targetMargin')}</span>
              <span className="text-xs font-black text-slate-400">{target}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Labor/Material Ratio</span>
              <span className="text-xs font-black text-slate-400">{efficiencyIndex}x</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">{language === 'nl' ? 'Recente Dossiers' : 'Recent Files'}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => {
            const totals = calculateProjectTotals(project);
            
            return (
              <div 
                key={project.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group cursor-pointer flex flex-col justify-between min-h-[240px]"
                onClick={() => onSelect(project)}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <select 
                      onClick={(e) => e.stopPropagation()}
                      value={project.status}
                      onChange={(e) => onUpdateStatus?.(project.id, e.target.value as ProjectStatus)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border outline-none appearance-none cursor-pointer text-center min-w-[100px] transition-all ${getStatusStyle(project.status)}`}
                    >
                      {Object.values(ProjectStatus).map(s => (
                        <option key={s} value={s} className="bg-slate-900 text-slate-100">{s}</option>
                      ))}
                    </select>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => onDuplicate(project.id)} className="p-2 text-slate-400 hover:text-blue-400 rounded-xl" title="Dupliceren">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1 leading-tight">{project.title}</h3>
                  <p className="text-sm text-slate-500 font-bold mt-2">{project.clientName || 'Zonder klantnaam'}</p>
                  <div className="mt-8 flex items-end gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest mb-1">{t('sales')}</span>
                      <span className="font-black text-white text-lg leading-none">{formatCurrency(totals.subtotalSales)}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800 pl-6">
                      <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest mb-1">{t('margin')}</span>
                      <span className="font-black text-emerald-400 text-lg leading-none">{totals.grossMarginPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                  <span>V: {new Date(project.updatedAt).toLocaleDateString('nl-NL')}</span>
                  <span className="flex items-center gap-2 text-blue-500 group-hover:gap-3 transition-all">
                    {t('open')} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
              </div>
            );
          })}
          <div onClick={onAdd} className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-10 hover:border-blue-600 hover:bg-blue-900/10 transition-all cursor-pointer text-slate-600 hover:text-blue-400 group min-h-[240px]">
            <div className="bg-slate-800 p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-blue-900/50 transition-all">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-xs">{t('newProject')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
