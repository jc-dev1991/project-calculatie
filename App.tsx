
import React, { useState } from 'react';
import Layout from './components/Layout';
import ProjectList from './components/ProjectList';
import MaterialTab from './components/MaterialTab';
import LaborTab from './components/LaborTab';
import ExtrasTab from './components/ExtrasTab';
import OverviewTab from './components/OverviewTab';
import LibraryTab from './components/LibraryTab';
import CalculationsView from './components/CalculationsView';
import SettingsView from './components/SettingsView';
import { useProjectStore } from './store/useProjectStore';
import { Project, ProjectStatus } from './types';
import { useT, Language } from './utils/translations';

enum View {
  DASHBOARD = 'Dashboard',
  PROJECT_DETAIL = 'Project Detail',
  LIBRARY = 'Bibliotheek',
  CALCULATIONS = 'Calculaties',
  ARCHIVE = 'Archief',
  SETTINGS = 'Instellingen'
}

const App: React.FC = () => {
  const { 
    projects, library, todos, settings, loading, 
    addProject, updateProject, deleteProject, duplicateProject,
    addLibraryItem, updateLibraryItem, deleteLibraryItem,
    addTodo, toggleTodo, deleteTodo, saveSettings
  } = useProjectStore();

  const t = useT(settings.language as Language);

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(t('general'));

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Systeem Starten...</p>
        </div>
      </div>
    );
  }

  const navigateToProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView(View.PROJECT_DETAIL);
    setActiveTab(t('general'));
  };

  const handleAddProject = () => {
    const p = addProject('Nieuw Meubel Project');
    navigateToProject(p.id);
  };

  const navigateHome = () => {
    setSelectedProjectId(null);
    setCurrentView(View.DASHBOARD);
  };

  const tabs = [t('general'), t('materials'), t('labor'), t('extras'), t('overview')];

  const activeProjects = projects.filter(p => p.status !== ProjectStatus.ARCHIVED);
  const archivedProjects = projects.filter(p => p.status === ProjectStatus.ARCHIVED);

  // Verkrijg unieke klantnamen uit alle projecten voor de dropdown
  const allClients = Array.from(new Set(projects.map(p => p.clientName).filter(Boolean))) as string[];
  const availableClients = allClients.length > 0 ? allClients : ['Nieuwe Klant'];

  const getOfferNumber = (p: Project) => {
    const year = new Date(p.createdAt).getFullYear();
    const index = (p.documentNumber || 0).toString().padStart(3, '0');
    return `${year}-${index}`;
  };

  return (
    <Layout 
      activeProjectTitle={selectedProject?.title} 
      onBack={currentView !== View.DASHBOARD ? navigateHome : undefined}
      onNavigateLibrary={() => setCurrentView(View.LIBRARY)}
      onNavigateHome={navigateHome}
      onNavigateCalculations={() => setCurrentView(View.CALCULATIONS)}
      onNavigateArchive={() => setCurrentView(View.ARCHIVE)}
      onNavigateSettings={() => setCurrentView(View.SETTINGS)}
      onAddProject={handleAddProject}
      onSelectProject={navigateToProject}
      projects={projects}
      todos={todos}
      onAddTodo={addTodo}
      onToggleTodo={toggleTodo}
      onDeleteTodo={deleteTodo}
      language={settings.language as Language}
    >
      {currentView === View.DASHBOARD && (
        <div className="max-w-[98vw] mx-auto w-full">
          <ProjectList 
            projects={activeProjects} 
            onSelect={(p) => navigateToProject(p.id)}
            onAdd={handleAddProject}
            onDuplicate={duplicateProject}
            onUpdateStatus={(id, status) => updateProject(id, { status })}
            language={settings.language as Language}
          />
        </div>
      )}

      {currentView === View.LIBRARY && (
        <div className="max-w-[98vw] mx-auto w-full">
          <LibraryTab 
            library={library}
            onAdd={addLibraryItem}
            onUpdate={updateLibraryItem}
            onDelete={deleteLibraryItem}
          />
        </div>
      )}

      {(currentView === View.CALCULATIONS || currentView === View.ARCHIVE) && (
        <div className="max-w-[98vw] mx-auto w-full">
          <CalculationsView 
            projects={currentView === View.CALCULATIONS ? activeProjects : archivedProjects}
            onSelectProject={navigateToProject}
            onDeleteProject={deleteProject}
            title={currentView === View.CALCULATIONS ? "Calculatie Overzicht" : "Calculatie Archief"}
            subtitle={currentView === View.CALCULATIONS ? "Beheer alle actieve projecten en offertes" : "Overzicht van gearchiveerde projecten"}
            allowDelete={currentView === View.ARCHIVE}
          />
        </div>
      )}

      {currentView === View.SETTINGS && (
        <div className="max-w-5xl mx-auto w-full">
          <SettingsView 
            settings={settings}
            onSave={saveSettings}
          />
        </div>
      )}

      {currentView === View.PROJECT_DETAIL && selectedProject && (
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="bg-slate-900 border-b border-slate-800 sticky top-20 z-20 print:hidden shadow-md overflow-x-auto no-scrollbar">
            <div className="max-w-[98vw] mx-auto px-4 flex whitespace-nowrap">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 md:px-10 py-4 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all ${
                    activeTab === tab 
                      ? 'border-blue-500 text-blue-400 bg-blue-900/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-[98vw] mx-auto w-full px-4 py-6 md:py-10">
            {activeTab === t('general') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 animate-fadeIn">
                <div className="bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                      Project Basis
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Dossier Nr.</span>
                      <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700/50">
                        <span className="text-xs font-black text-blue-400 tracking-wider">
                          {getOfferNumber(selectedProject)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">{t('title')}</label>
                      <input 
                        type="text" 
                        value={selectedProject.title} 
                        onChange={(e) => updateProject(selectedProject.id, { title: e.target.value })} 
                        className="w-full px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white focus:border-blue-500 focus:bg-slate-700/30 outline-none transition-all shadow-inner placeholder-slate-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">{t('client')}</label>
                      <div className="relative">
                        <select 
                          value={selectedProject.clientName || ''} 
                          onChange={(e) => updateProject(selectedProject.id, { clientName: e.target.value })} 
                          className="w-full px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white focus:border-blue-500 focus:bg-slate-700/30 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Selecteer een klant...</option>
                          {availableClients.map(client => (
                            <option key={client} value={client} className="bg-slate-900">{client}</option>
                          ))}
                          <option value="NEW" className="bg-slate-900 text-blue-400">+ Nieuwe klant toevoegen</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">{t('status')}</label>
                        <select 
                          value={selectedProject.status} 
                          onChange={(e) => updateProject(selectedProject.id, { status: e.target.value as ProjectStatus })} 
                          className="w-full px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white focus:border-blue-500 focus:bg-slate-700/30 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                        >
                          {Object.values(ProjectStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">{t('vat')} (%)</label>
                        <input 
                          type="number" 
                          value={selectedProject.vatRate} 
                          onChange={(e) => updateProject(selectedProject.id, { vatRate: Number(e.target.value) })} 
                          className="w-full px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white focus:border-blue-500 focus:bg-slate-700/30 outline-none transition-all shadow-inner" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6 md:space-y-8">
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    {t('notes')}
                  </h3>
                  <textarea 
                    value={selectedProject.notes} 
                    onChange={(e) => updateProject(selectedProject.id, { notes: e.target.value })} 
                    placeholder="Interne details, afspraken of specifieke wensen van de klant..." 
                    className="w-full h-48 md:h-[400px] px-8 py-6 bg-slate-800 border-2 border-slate-700 rounded-[2rem] font-medium text-slate-200 focus:border-amber-500 focus:bg-slate-700/30 outline-none transition-all resize-none leading-relaxed shadow-inner placeholder-slate-600" 
                  />
                </div>
              </div>
            )}

            {activeTab === t('materials') && <MaterialTab project={selectedProject} library={library} onUpdate={(updates) => updateProject(selectedProject.id, updates)} />}
            {activeTab === t('labor') && <LaborTab project={selectedProject} onUpdate={(updates) => updateProject(selectedProject.id, updates)} />}
            {activeTab === t('extras') && <ExtrasTab project={selectedProject} onUpdate={(updates) => updateProject(selectedProject.id, updates)} />}
            {activeTab === t('overview') && <OverviewTab project={selectedProject} />}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
