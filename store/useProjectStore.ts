
import { useState, useEffect } from 'react';
import { Project, ProjectStatus, LaborType, MaterialCategory, MaterialUnit, LibraryMaterial, TodoItem, OfferSettings } from '../types';

const PROJECTS_KEY = 'calccraft_projects';
const LIBRARY_KEY = 'calccraft_library';
const TODOS_KEY = 'calccraft_todos';
const SETTINGS_KEY = 'calccraft_settings';

const DEFAULT_SETTINGS: OfferSettings = {
  companyName: 'Mijn Meubelmakerij',
  companyAddress: 'Werkplaatsstraat 1, 1000 AB Amsterdam',
  companyPhone: '020-1234567',
  companyEmail: 'info@meubelmakerij.nl',
  companyIban: 'NL99 BANK 0123 4567 89',
  companyKvK: '12345678',
  companyVat: 'NL123456789B01',
  headerTitle: 'MAATWERK OFFERTE',
  footerText: 'Bedankt voor uw vertrouwen in ons vakmanschap.',
  termsNotice: 'Op al onze offertes zijn de algemene voorwaarden van toepassing. Geldigheid: 30 dagen.',
  salutation: 'Beste',
  language: 'nl',
  targetMarginPct: 35
};

const SEED_LIBRARY: LibraryMaterial[] = [
  { id: 'lib-1', category: MaterialCategory.PLAATMATERIAAL, description: 'Eiken Fineer 18mm', unit: MaterialUnit.PCS, unitCost: 148.84, length: 2440, width: 1220, thickness: 18 },
  { id: 'lib-2', category: MaterialCategory.PLAATMATERIAAL, description: 'MDF Lakdraag 18mm', unit: MaterialUnit.PCS, unitCost: 55.07, length: 2440, width: 1220, thickness: 18 },
  { id: 'lib-3', category: MaterialCategory.BESLAG, description: 'Blum Scharnier 110 graden', unit: MaterialUnit.PCS, unitCost: 4.20 },
  { id: 'lib-4', category: MaterialCategory.AFWERKING, description: 'Kantfineer Eiken 24mm', unit: MaterialUnit.M1, unitCost: 2.15 },
];

const SEED_DATA: Project[] = [
  {
    id: 'demo-1',
    title: 'Eiken Keukenkast Maatwerk',
    clientName: 'Familie Jansen',
    status: ProjectStatus.DRAFT,
    currency: 'EUR',
    vatRate: 21,
    notes: 'Inclusief eiken fineer en Blum beslag.',
    materialMarginEnabled: true,
    materialMarginPct: 20,
    laborMarginEnabled: true,
    laborMarginPct: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    materials: [
      {
        id: 'm1',
        category: MaterialCategory.PLAATMATERIAAL,
        description: 'Eiken Fineer 18mm',
        unit: MaterialUnit.PCS,
        quantity: 2,
        unitCost: 148.84,
        marginOverrideEnabled: false,
        marginOverridePct: 0,
        length: 2440,
        width: 1220,
        thickness: 18,
        libraryItemId: 'lib-1'
      }
    ],
    labor: [
      { id: 'l1', type: LaborType.PRODUCTION, hours: 40, costRate: 35, sellRateEnabled: true, sellRate: 65, travelBillable: true }
    ],
    extras: []
  }
];

export const useProjectStore = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [library, setLibrary] = useState<LibraryMaterial[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [settings, setSettings] = useState<OfferSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_KEY);
    const storedLibrary = localStorage.getItem(LIBRARY_KEY);
    const storedTodos = localStorage.getItem(TODOS_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_KEY);

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    else setProjects(SEED_DATA);

    if (storedLibrary) setLibrary(JSON.parse(storedLibrary));
    else setLibrary(SEED_LIBRARY);

    if (storedTodos) setTodos(JSON.parse(storedTodos));
    
    if (storedSettings) setSettings(JSON.parse(storedSettings));

    setLoading(false);
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
  };

  const saveLibrary = (newLib: LibraryMaterial[]) => {
    setLibrary(newLib);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLib));
  };

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    localStorage.setItem(TODOS_KEY, JSON.stringify(newTodos));
  };

  const saveSettings = (newSettings: OfferSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  // Projects CRUD
  const addProject = (title: string, clientName?: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title, clientName,
      status: ProjectStatus.DRAFT, currency: 'EUR', vatRate: 21, notes: '',
      materialMarginEnabled: true, materialMarginPct: 20,
      laborMarginEnabled: true, laborMarginPct: 20,
      materials: [], extras: [],
      labor: [
        { id: crypto.randomUUID(), type: LaborType.PRODUCTION, hours: 0, costRate: 45, sellRateEnabled: false, sellRate: 0, travelBillable: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProjects([newProject, ...projects]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProject = (id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
      return filtered;
    });
  };

  const duplicateProject = (id: string) => {
    const source = projects.find(p => p.id === id);
    if (!source) return;
    saveProjects([{ ...source, id: crypto.randomUUID(), title: `${source.title} (v2)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...projects]);
  };

  // Library CRUD
  const addLibraryItem = (item: Omit<LibraryMaterial, 'id'>) => {
    saveLibrary([...library, { ...item, id: crypto.randomUUID() }]);
  };

  const updateLibraryItem = (id: string, updates: Partial<LibraryMaterial>) => {
    saveLibrary(library.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteLibraryItem = (id: string) => saveLibrary(library.filter(i => i.id !== id));

  // Todos CRUD
  const addTodo = (text: string) => {
    saveTodos([...todos, { id: crypto.randomUUID(), text, completed: false }]);
  };

  const toggleTodo = (id: string) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => saveTodos(todos.filter(t => t.id !== id));

  return { 
    projects, library, todos, settings, loading, 
    addProject, updateProject, deleteProject, duplicateProject,
    addLibraryItem, updateLibraryItem, deleteLibraryItem,
    addTodo, toggleTodo, deleteTodo, saveSettings
  };
};
