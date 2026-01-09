
import React, { useState, useRef, useEffect } from 'react';
import { Project, TodoItem } from '../types';
import { useT, Language } from '../utils/translations';

interface LayoutProps {
  children: React.ReactNode;
  activeProjectTitle?: string;
  onBack?: () => void;
  onNavigateLibrary?: () => void;
  onNavigateHome?: () => void;
  onNavigateCalculations?: () => void;
  onNavigateArchive?: () => void;
  onNavigateSettings?: () => void;
  onAddProject?: () => void;
  onSelectProject?: (id: string) => void;
  projects?: Project[];
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  language?: Language;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeProjectTitle, 
  onBack, 
  onNavigateLibrary, 
  onNavigateHome,
  onNavigateCalculations,
  onNavigateArchive,
  onNavigateSettings,
  onAddProject,
  onSelectProject,
  projects = [],
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  language = 'nl'
}) => {
  // Use explicit cast for the language parameter to satisfy TypeScript
  const t = useT(language as Language);
  const [showTodo, setShowTodo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  
  const todoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (todoRef.current && !todoRef.current.contains(event.target as Node)) {
        setShowTodo(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    onAddTodo(newTodo);
    setNewTodo('');
  };

  const menuItems = [
    { label: t('dashboard'), icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, action: onNavigateHome },
    { label: t('calculations'), icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, action: onNavigateCalculations },
    { label: t('archiveMenu'), icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, action: onNavigateArchive },
    { label: t('library'), icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>, action: onNavigateLibrary },
    { label: t('settings'), icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, action: onNavigateSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 print:hidden shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showMenu ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={showMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{language === 'nl' ? 'Navigatie' : 'Navigation'}</span>
              </button>

              {showMenu && (
                <div className="absolute left-0 mt-4 w-64 bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl p-4 z-[60] animate-fadeIn">
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action?.();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
                      >
                        <span className="text-blue-500">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div className="h-[1px] bg-slate-800 my-2"></div>
                    <button 
                      onClick={() => {
                        onAddProject?.();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white hover:bg-blue-600 rounded-2xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      {t('newProject')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(onBack || onNavigateHome) && (
              <button 
                onClick={onBack || onNavigateHome}
                className="hidden md:flex p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}

            <div className="cursor-pointer group flex flex-col ml-2" onClick={onNavigateHome}>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors truncate max-w-[120px] sm:max-w-none">
                {activeProjectTitle || 'CalcCraft Pro'}
              </h1>
              <p className="text-[8px] text-blue-400 uppercase tracking-widest font-black">{language === 'nl' ? 'Interne Calculatie' : 'Internal Calculation'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={onAddProject}
              className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 text-[9px] uppercase tracking-widest"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              {t('projects')}
            </button>

            <div className="relative" ref={todoRef}>
              <button 
                onClick={() => setShowTodo(!showTodo)}
                className={`p-3 rounded-xl border border-slate-700 transition-all relative ${showTodo ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 0 -2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {todos.filter(t => !t.completed).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-pulse">
                    {todos.filter(t => !t.completed).length}
                  </span>
                )}
              </button>

              {showTodo && (
                <div className="absolute right-0 mt-4 w-72 sm:w-80 bg-slate-900 border-2 border-slate-800 rounded-[2rem] shadow-2xl p-6 sm:p-8 z-[60] animate-fadeIn">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6">{t('todo')}</h3>
                  <form onSubmit={handleAdd} className="mb-6">
                    <input 
                      type="text" 
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder={language === 'nl' ? "Nieuwe taak..." : "New task..."}
                      className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </form>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                    {todos.length === 0 && <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-6">Geen actieve taken</p>}
                    {todos.map(todo => (
                      <div key={todo.id} className="group flex items-center justify-between gap-3 p-3 bg-slate-800/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <input 
                            type="checkbox" 
                            checked={todo.completed}
                            onChange={() => onToggleTodo(todo.id)}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0"
                          />
                          <span className={`text-sm font-bold truncate transition-all ${todo.completed ? 'line-through text-slate-600 opacity-50' : 'text-slate-200'}`}>{todo.text}</span>
                        </div>
                        <button onClick={() => onDeleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm border-2 border-blue-500 shadow-lg shadow-blue-900/20">
              CP
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="py-10 bg-slate-900 border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
          <div>&copy; {new Date().getFullYear()} CALCCRAFT PRO SYSTEMS</div>
          <div className="flex gap-6">
            <span className="text-slate-400">MANAGEMENT INTERFACE</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">SECURE CALCULATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
