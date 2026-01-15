import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase'; 
import Login from './components/Login';

import Layout from './components/Layout';
import ProjectList from './components/ProjectList';
import MaterialTab from './components/MaterialTab';
import LaborTab from './components/LaborTab';
import ExtrasTab from './components/ExtrasTab';
import OverviewTab from './components/OverviewTab';
import LibraryTab from './components/LibraryTab';
import CalculationsView from './components/CalculationsView';
import SettingsView from './components/SettingsView';
// --- NIEUWE IMPORTS ---
import OrderListTab from './components/OrderListTab';
import QuoteTab from './components/QuoteTab';
// ---------------------
import { useProjectStore } from './store/useProjectStore';
import { Project, ProjectStatus } from './types';
import { useT, Language } from './utils/translations';
import { calculateProjectTotals } from './utils/calculations';

enum View {
  DASHBOARD = 'Dashboard',
  PROJECT_DETAIL = 'Project Detail',
  LIBRARY = 'Bibliotheek',
  CALCULATIONS = 'Calculaties',
  ARCHIVE = 'Archief',
  SETTINGS = 'Instellingen'
}

interface PlannerProject {
  id: string;
  clientName: string;
  title: string;
  status?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Database State
  const [plannerProjects, setPlannerProjects] = useState<PlannerProject[]>([]);
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>(''); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 1. DATA OPHALEN UIT PROJECT MANAGER ---
  useEffect(() => {
    if (!user) return;

    const qProjects = query(collection(db, 'projects'), orderBy('updatedAt', 'desc')); 
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const projs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          clientName: data.clientName || 'Onbekend',
          title: data.title || 'Naamloos project',
          status: data.status
        };
      }) as PlannerProject[];
      setPlannerProjects(projs);
    });

    return () => {
      unsubProjects();
    };
  }, [user]);

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

  useEffect(() => {
    if (selectedProject?.externalProjectId) {
      setLinkedProjectId(selectedProject.externalProjectId);
      
      const linkedName = plannerProjects.find(p => p.id === selectedProject.externalProjectId)?.title;
      if (linkedName) {
        setSyncStatus(`Gekoppeld: ${linkedName}`);
      } else {
        setSyncStatus('Gekoppeld aan project (laden...)');
      }
    } else {
      setLinkedProjectId(null);
      setSyncStatus('');
    }
  }, [selectedProject?.id, selectedProject?.externalProjectId, plannerProjects]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Fout bij uitloggen:", error);
    }
  };

  // --- 2. DE SYNC FUNCTIE ---
  const syncToPlanner = async (externalProjectId: string, projectData: Project | undefined) => {
    if (!projectData) return;

    try {
      const projectRef = doc(db, 'projects', externalProjectId);
      
      // Gebruik de centrale rekenmachine
      const totals = calculateProjectTotals(projectData);

      // Tel de uren voor de planning
      const laborList = projectData.labor || [];
      let prodHours = 0;
      let installHours = 0;
      let travelHours = 0;
      let hiredHours = 0;

      laborList.forEach((item) => {
        const hrs = Number(item.hours || 0);
        
        switch (item.type) {
          case 'Productie': prodHours += hrs; break;
          case 'Montage':   installHours += hrs; break;
          case 'Reis':      travelHours += hrs; break;
          case 'Inhuur':    hiredHours += hrs; break;
          default:          prodHours += hrs; 
        }
      });

      const totalHours = prodHours + installHours + travelHours + hiredHours;

      // Update Database
      await updateDoc(projectRef, {
        calculationData: {
          lastUpdated: new Date(),
          totalPrice: totals.totalIncVat,
          subTotal: totals.subtotalSales,
          materialCost: totals.materialsSalesTotal, 
          laborCost: totals.laborSalesTotal, 
          
          hoursProduction: prodHours,
          hoursInstallation: installHours,
          hoursTravel: travelHours,
          hoursHired: hiredHours,
          totalHours: totalHours,
          
          status: projectData.status
        },
      });
      
      console.log(`Sync Geslaagd! Prijs: €${totals.totalIncVat}, Arbeid Verkoop: €${totals.laborSalesTotal}`);
    } catch (error) {
      console.error("Fout bij syncen naar planner:", error);
    }
  };

  // --- 3. PROJECT KOPPELEN ---
  const handleProjectLink = (localProjectId: string, externalProjectId: string) => {
    const targetProject = plannerProjects.find(p => p.id === externalProjectId);
    
    if (targetProject) {
      setLinkedProjectId(externalProjectId);
      setSyncStatus(`Gekoppeld aan: ${targetProject.title}`);
      
      updateProject(localProjectId, { 
        clientName: targetProject.clientName,
        externalProjectId: externalProjectId 
      });

      syncToPlanner(externalProjectId, selectedProject);
    }
  };

  const navigateToPlanning = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const localUrl = 'http://localhost:3001'; 
    const liveUrl = 'https://jouw-live-app.vercel.app'; 
    const targetUrl = isLocal ? localUrl : liveUrl;
    window.open(targetUrl, '_blank');
  };

  const getOfferNumber = (p: Project) => {
    const dateStr = p.createdAt || new Date().toISOString();
    const year = new Date(dateStr).getFullYear();
    const index = (p.documentNumber || 0).toString().padStart(3, '0');
    return `${year}-${index}`;
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest">Verbinding controleren...</div>;
  if (!user) return <Login />;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest">Systeem Laden...</div>;

  const navigateToProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView(View.PROJECT_DETAIL);
    setActiveTab(t('general'));
  };

  const handleAddProject = () => {
    const p = addProject('Nieuwe Calculatie');
    navigateToProject(p.id);
  };

  const navigateHome = () => {
    setSelectedProjectId(null);
    setCurrentView(View.DASHBOARD);
  };

  // --- NIEUW: TABS UITGEBREID MET BESTELLIJST EN OFFERTE ---
  const tabs = [t('general'), t('materials'), t('labor'), t('extras'), 'Bestellijst', 'Offerte', t('overview')];
  
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.ARCHIVED);
  const archivedProjects = projects.filter(p => p.status === ProjectStatus.ARCHIVED);

  const activePlannerProjects = plannerProjects.filter(p => p.status !== 'afgerond' && !p.status?.includes('archief'));

  return (
    <Layout 
      activeProjectTitle={selectedProject?.title} 
      onBack={currentView !== View.DASHBOARD ? navigateHome : undefined}
      onNavigateLibrary={() => setCurrentView(View.LIBRARY)}
      onNavigateHome={navigateHome}
      onNavigateCalculations={() => setCurrentView(View.CALCULATIONS)}
      onNavigateArchive={() => setCurrentView(View.ARCHIVE)}
      onNavigateSettings={() => setCurrentView(View.SETTINGS)}
      onNavigateToPlanning={navigateToPlanning}
      onLogout={handleLogout}
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
          <LibraryTab library={library} onAdd={addLibraryItem} onUpdate={updateLibraryItem} onDelete={deleteLibraryItem} />
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
          <SettingsView settings={settings} onSave={saveSettings} />
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
                    activeTab === tab ? 'border-blue-500 text-blue-400 bg-blue-900/10' : 'border-transparent text-slate-500 hover:text-slate-300'
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

                  {syncStatus && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">{syncStatus}</span>
                    </div>
                  )}

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
                      <label className="block text-[8px] md:text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Koppel aan Project</label>
                      <div className="relative">
                        <select 
                          value={linkedProjectId || ''} 
                          onChange={(e) => handleProjectLink(selectedProject.id, e.target.value)} 
                          className="w-full px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl font-bold text-white focus:border-blue-500 focus:bg-slate-700/30 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Selecteer een project uit de Planner...</option>
                          {activePlannerProjects.length === 0 && <option disabled>Geen actieve projecten gevonden</option>}
                          {activePlannerProjects.map(proj => (
                            <option key={proj.id} value={proj.id} className="bg-slate-900">
                              {proj.title} ({proj.clientName})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <p className="mt-2 text-[9px] text-slate-500">
                        * Selecteer het project waar de uren en kosten naar verzonden moeten worden.
                      </p>
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

            {activeTab === t('materials') && (
              <MaterialTab 
                project={selectedProject} 
                library={library} 
                onUpdate={(updates) => {
                  updateProject(selectedProject.id, updates);
                  if (linkedProjectId) {
                    const updatedProj = { ...selectedProject, ...updates };
                    syncToPlanner(linkedProjectId, updatedProj);
                  }
                }} 
              />
            )}
            
            {activeTab === t('labor') && (
              <LaborTab 
                project={selectedProject} 
                onUpdate={(updates) => {
                  updateProject(selectedProject.id, updates);
                  if (linkedProjectId) {
                    const updatedProj = { ...selectedProject, ...updates };
                    syncToPlanner(linkedProjectId, updatedProj);
                  }
                }} 
              />
            )}
            
            {activeTab === t('extras') && <ExtrasTab project={selectedProject} onUpdate={(updates) => updateProject(selectedProject.id, updates)} />}
            
            {/* --- NIEUW: BESTELLIJST EN OFFERTE TABS --- */}
            {activeTab === 'Bestellijst' && (
              <OrderListTab project={selectedProject} />
            )}

            {activeTab === 'Offerte' && (
              <QuoteTab 
                project={selectedProject} 
                onUpdate={(updates) => updateProject(selectedProject.id, updates)} 
              />
            )}
            
            {activeTab === t('overview') && <OverviewTab project={selectedProject} />}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;