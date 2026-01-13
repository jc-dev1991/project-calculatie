
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { calculateProjectTotals, formatCurrency, formatNumber } from '../utils/calculations';
import OverviewTab from './OverviewTab';

interface CalculationsViewProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  title?: string;
  subtitle?: string;
  allowDelete?: boolean;
}

const CalculationsView: React.FC<CalculationsViewProps> = ({ 
  projects, 
  onSelectProject, 
  onDeleteProject,
  title = "Calculatie Overzicht",
  subtitle = "Beheer alle actieve projecten en offertes",
  allowDelete = false
}) => {
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, title: string } | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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

  const getOfferNumber = (project: Project) => {
    const year = new Date(project.createdAt).getFullYear();
    const index = project.documentNumber.toString().padStart(3, '0');
    return `${year}-${index}`;
  };

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const searchLower = searchTerm.toLowerCase();
      const offerNumber = getOfferNumber(project);
      
      const matchesSearch = 
        project.title.toLowerCase().includes(searchLower) ||
        (project.clientName || '').toLowerCase().includes(searchLower) ||
        offerNumber.includes(searchLower);

      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <div className="w-full py-6 md:py-12 space-y-6 md:space-y-8 animate-fadeIn px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">{title}</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">{subtitle}</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Zoeken..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-sm font-bold rounded-xl pl-12 pr-4 py-3 outline-none focus:border-blue-500 transition-all placeholder-slate-600"
            />
          </div>
          <div className="relative sm:w-48">
             <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Alle Statussen</option>
              {Object.values(ProjectStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Project Verwijderen?</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Weet u zeker dat u wilt wissen?</p>
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={() => setProjectToDelete(null)} className="flex-1 px-6 py-4 bg-slate-800 text-slate-300 font-black uppercase text-[10px] rounded-2xl">Annuleren</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-4 bg-red-600 text-white font-black uppercase text-[10px] rounded-2xl">Wissen</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 md:px-10 py-6 md:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Index</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project / Klant</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Totaal</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Marge %</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-800 rounded-full text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Geen resultaten gevonden</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => {
                  const totals = calculateProjectTotals(project);
                  return (
                    <tr key={project.id} className="hover:bg-slate-800/30 group transition-all">
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                          {getOfferNumber(project)}
                        </span>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="text-base md:text-lg font-black text-white group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onSelectProject(project.id)}>{project.title}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{project.clientName || 'Geen klantnaam'}</div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)}`}>{project.status}</span>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-right font-black text-white text-base md:text-lg">{formatCurrency(totals.subtotalSales)}</td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-right font-black text-emerald-400 text-base md:text-lg">{formatNumber(totals.grossMarginPct)}%</td>
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex justify-center items-center gap-3">
                          <button onClick={() => setPreviewProjectId(project.id)} className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl border border-slate-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                          <button onClick={() => onSelectProject(project.id)} className="p-3 bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl border border-slate-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                          {allowDelete && (
                            <button onClick={(e) => { e.stopPropagation(); setProjectToDelete({ id: project.id, title: project.title }); }} className="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl border border-slate-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewProjectId && previewProject && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-fadeIn">
          <div className="px-4 md:px-10 h-20 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0 shadow-2xl">
            <div className="flex items-center gap-4 md:gap-8">
              <button onClick={() => setPreviewProjectId(null)} className="p-2.5 md:p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
              <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
              <div className="min-w-0">
                <h3 className="text-xs md:text-lg font-black text-white uppercase tracking-[0.1em] truncate">{previewProject.title}</h3>
                <span className="text-[8px] md:text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] flex items-center gap-2">Live Preview - {getOfferNumber(previewProject)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={() => onSelectProject(previewProject.id)} className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-200 rounded-xl font-black uppercase text-[10px] border border-slate-700">Dossier Openen</button>
              <button onClick={() => setPreviewProjectId(null)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] shadow-xl">Sluiten</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-950 px-2 md:px-10 py-6 md:py-10 custom-scrollbar">
            <div className="max-w-[98vw] mx-auto pb-24"><OverviewTab project={previewProject} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationsView;
