
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
  const [activeTab, setActiveTab] = useState<string>(t('materials'));

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
    setActiveTab(t('materials'));
  };

  const handleAddProject = () => {
    const p = addProject('Nieuw Meubel Project');
    navigateToProject(p.id);
    setActiveTab(t('general'));
  };

  const navigateHome = () => {
    setSelectedProjectId(null);
    setCurrentView(View.DASHBOARD);
  };

  const tabs = [t('general'), t('materials'), t('labor'), t('extras'), t('overview')];

  // Filter projects for the dashboard and active calculation view (exclude archived)
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.ARCHIVED);
  
  // Filter projects for the archive view (only archived)
  const archivedProjects = projects.filter(p => p.status === ProjectStatus.ARCHIVED);

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
        <ProjectList 
          projects={activeProjects} 
          onSelect={(p) => navigateToProject(p.id)}
          onAdd={handleAddProject}
          onDuplicate={duplicateProject}
          onDelete={deleteProject}
          language={settings.language as Language}
        />
      )}

      {currentView === View.LIBRARY && (
        <LibraryTab 
          library={library}
          onAdd={addLibraryItem}
          onUpdate={updateLibraryItem}
          onDelete={deleteLibraryItem}
        />
      )}

      {currentView === View.CALCULATIONS && (
        <CalculationsView 
          projects={activeProjects}
          onSelectProject={navigateToProject}
          onDeleteProject={deleteProject}
          title="Calculatie Overzicht"
          subtitle="Beheer alle actieve projecten en offertes"
        />
      )}

      {currentView === View.ARCHIVE && (
        <CalculationsView 
          projects={archivedProjects}
          onSelectProject={navigateToProject}
          onDeleteProject={deleteProject}
          title="Calculatie Archief"
          subtitle="Overzicht van gearchiveerde projecten"
        />
      )}

      {currentView === View.SETTINGS && (
        <SettingsView 
          settings={settings}
          onSave={saveSettings}
        />
      )}

      {currentView === View.PROJECT_DETAIL && selectedProject && (
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="bg-slate-900 border-b border-slate-800 sticky top-20 z-20 print:hidden shadow-md overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-2 flex whitespace-nowrap">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 md:px-8 py-4 md:py-5 text-[10px] md:text-sm font-black uppercase tracking-widest border-b-4 transition-all ${
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

          <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-10">
            {activeTab === t('general') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 animate-fadeIn">
                <div className="bg-slate-900 p-6 md:p-10 rounded-[1.5rem] md:rounded-3xl border border-slate-800 shadow-2xl space-y-6 md:space-y-8">
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    Project Basis
                  </h3>
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">{t('title')}</label>
                      <input type="text" value={selectedProject.title} onChange={(e) => updateProject(selectedProject.id, { title: e.target.value })} className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">{t('client')}</label>
                      <input type="text" value={selectedProject.clientName || ''} placeholder="Klantnaam..." onChange={(e) => updateProject(selectedProject.id, { clientName: e.target.value })} className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">{t('status')}</label>
                        <select value={selectedProject.status} onChange={(e) => updateProject(selectedProject.id, { status: e.target.value as ProjectStatus })} className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold text-white focus:border-blue-500 outline-none">
                          {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">{t('vat')} (%)</label>
                        <input type="number" value={selectedProject.vatRate} onChange={(e) => updateProject(selectedProject.id, { vatRate: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl font-bold text-white focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 md:p-10 rounded-[1.5rem] md:rounded-3xl border border-slate-800 shadow-2xl space-y-6 md:space-y-8">
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    {t('notes')}
                  </h3>
                  <textarea value={selectedProject.notes} onChange={(e) => updateProject(selectedProject.id, { notes: e.target.value })} placeholder="Interne details..." className="w-full h-48 md:h-[320px] px-4 md:px-6 py-4 md:py-5 bg-slate-800 border-2 border-slate-700 rounded-xl md:rounded-2xl font-medium text-slate-200 focus:border-amber-500 outline-none resize-none leading-relaxed" />
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
