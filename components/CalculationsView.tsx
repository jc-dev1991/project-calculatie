
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { calculateProjectTotals, formatCurrency, formatNumber } from '../utils/calculations';
import OverviewTab from './OverviewTab';

interface CalculationsViewProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  title?: string;
  subtitle?: string;
}

const CalculationsView: React.FC<CalculationsViewProps> = ({ 
  projects, 
  onSelectProject, 
  onDeleteProject,
  title = "Calculatie Overzicht",
  subtitle = "Beheer alle actieve projecten en offertes"
}) => {
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, title: string } | null>(null);

  const previewProject = projects.find(p => p.id === previewProjectId);

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACCEPTED: return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
      case ProjectStatus.COMPLETED: return 'bg-indigo-900/30 text-indigo-400 border-indigo-800/50';
      case ProjectStatus.SENT: return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
      case ProjectStatus.ARCHIVED: return 'bg-slate-800 text-slate-500 border-slate-700';
      default: return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
    }
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">{subtitle}</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Project Verwijderen?</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Weet u zeker dat u <span className="text-white font-bold">"{projectToDelete.title}"</span> definitief wilt wissen? Deze actie kan niet ongedaan worden gemaakt.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
              >
                Annuleren
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-red-900/20"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project / Klant</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Totaal (Ex. BTW)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Marge %</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">Geen projecten gevonden</p>
                </td>
              </tr>
            ) : (
              projects.map(project => {
                const totals = calculateProjectTotals(project);
                return (
                  <tr key={project.id} className="hover:bg-slate-800/30 group transition-all">
                    <td className="px-8 py-6">
                      <div className="font-black text-white group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onSelectProject(project.id)}>
                        {project.title}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {project.clientName || 'Geen klantnaam'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-white">
                      {formatCurrency(totals.subtotalSales)}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-emerald-400">
                      {formatNumber(totals.grossMarginPct)}%
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => setPreviewProjectId(project.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          PDF
                        </button>
                        <button 
                          onClick={() => onSelectProject(project.id)}
                          className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all"
                          title="Openen"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setProjectToDelete({ id: project.id, title: project.title }); }}
                          className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"
                          title="Definitief Verwijderen"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.3em]">Geen projecten</p>
          </div>
        ) : (
          projects.map(project => {
            const totals = calculateProjectTotals(project);
            return (
              <div 
                key={project.id} 
                className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-4 shadow-xl flex flex-col justify-between aspect-square active:scale-[0.98] transition-all relative overflow-hidden"
                onClick={() => onSelectProject(project.id)}
              >
                <div className="flex justify-between items-start">
                   <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">
                    {new Date(project.updatedAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>

                <div className="my-auto py-2">
                  <h3 className="font-black text-white text-xs line-clamp-2 leading-tight mb-1">
                    {project.title}
                  </h3>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">
                    {project.clientName || 'Geen klant'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                    <div>
                      <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Verkoop</span>
                      <span className="text-[10px] font-black text-white leading-none whitespace-nowrap">{formatCurrency(totals.subtotalSales)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Marge</span>
                      <span className="text-[10px] font-black text-emerald-400 leading-none">{formatNumber(totals.grossMarginPct)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPreviewProjectId(project.id); }}
                      className="flex-1 flex items-center justify-center p-2 bg-slate-800 text-slate-400 rounded-lg border border-slate-700 active:bg-blue-600 active:text-white transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelectProject(project.id); }}
                      className="flex-[2] flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg transition-all font-black uppercase text-[8px] tracking-widest"
                    >
                      Open
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setProjectToDelete({ id: project.id, title: project.title }); }}
                      className="flex-1 flex items-center justify-center p-2 bg-red-900/20 text-red-500 rounded-lg border border-red-900/30 active:bg-red-600 active:text-white transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Viewer Interface */}
      {previewProjectId && previewProject && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-fadeIn">
          <div className="px-4 md:px-8 h-16 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setPreviewProjectId(null)} 
                className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all border border-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div className="h-4 w-[1px] bg-slate-800 hidden xs:block"></div>
              <div className="min-w-0 max-w-[120px] sm:max-w-none">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] truncate block">{previewProject.title}</span>
                <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest hidden sm:inline">• Voorvertoning Rapport</span>
              </div>
            </div>
            
            <button 
              onClick={() => setPreviewProjectId(null)} 
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg font-black uppercase tracking-widest text-[9px] hover:bg-blue-500 transition-all shadow-lg active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="hidden xs:inline">Sluiten</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
            <div className="w-full bg-slate-900 min-h-full py-8 md:py-12 px-4 md:px-0 flex justify-center">
               <div className="w-full max-w-5xl">
                  <OverviewTab project={previewProject} />
               </div>
            </div>
          </div>

          <div className="px-4 md:px-8 h-10 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
             <div className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] truncate">
               CALCCRAFT PRO DIGITAL ARCHIVE INTERFACE
             </div>
             <div className="text-[7px] md:text-[8px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">
               LAT: {new Date(previewProject.updatedAt).toLocaleTimeString('nl-NL')}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationsView;
