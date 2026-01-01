
import React, { useState, useMemo } from 'react';
import { Project, MaterialLine, MaterialCategory, MaterialUnit, LibraryMaterial } from '../types';
import { calculateMaterialLine, formatCurrency, formatNumber } from '../utils/calculations';

interface MaterialTabProps {
  project: Project;
  library: LibraryMaterial[];
  onUpdate: (updates: Partial<Project>) => void;
}

const CategoryIcon = ({ category }: { category: MaterialCategory }) => {
  switch (category) {
    case MaterialCategory.PLAATMATERIAAL:
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM4 9h16M4 13h16M4 17h16" /></svg>;
    case MaterialCategory.MASSIEF:
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18M19 3v18M5 10h14M5 14h14M5 18h14M5 6h14" /></svg>;
    case MaterialCategory.BESLAG:
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
    case MaterialCategory.SPUITWERK:
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" /></svg>;
    default:
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  }
};

const MaterialTab: React.FC<MaterialTabProps> = ({ project, library, onUpdate }) => {
  const [showLibPicker, setShowLibPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [targetIsDirect, setTargetIsDirect] = useState(false);

  const filteredLibrary = useMemo(() => {
    return pickerCategory === 'ALL' ? library : library.filter(item => item.category === pickerCategory);
  }, [library, pickerCategory]);

  const updateMaterials = (newMaterials: MaterialLine[]) => onUpdate({ materials: newMaterials });

  const addLine = (isDirect = false, libItem?: LibraryMaterial) => {
    const newLine: MaterialLine = libItem ? {
      id: crypto.randomUUID(),
      category: libItem.category,
      description: libItem.description,
      unit: libItem.unit,
      quantity: 1,
      unitCost: libItem.unitCost,
      marginOverrideEnabled: isDirect,
      marginOverridePct: 0,
      length: libItem.length || 0,
      width: libItem.width || 0,
      thickness: libItem.thickness || 0,
      libraryItemId: libItem.id,
      isDirectPurchase: isDirect
    } : {
      id: crypto.randomUUID(),
      category: MaterialCategory.PLAATMATERIAAL,
      description: '',
      unit: MaterialUnit.M2,
      quantity: 1,
      unitCost: 0,
      marginOverrideEnabled: isDirect,
      marginOverridePct: 0,
      length: 0,
      width: 0,
      thickness: 0,
      isDirectPurchase: isDirect
    };
    updateMaterials([...project.materials, newLine]);
    setShowLibPicker(false);
  };

  const handleUpdateLine = (id: string, updates: Partial<MaterialLine>) => {
    const updated = project.materials.map(m => m.id === id ? { ...m, ...updates } : m);
    updateMaterials(updated);
  };

  const handleDeleteLine = (id: string) => updateMaterials(project.materials.filter(m => m.id !== id));
  const handleDuplicateLine = (line: MaterialLine) => updateMaterials([...project.materials, { ...line, id: crypto.randomUUID() }]);

  const renderTable = (lines: MaterialLine[], title: string, isDirect: boolean) => (
    <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden mb-8 md:mb-12">
      <div className={`px-6 md:px-10 py-4 md:py-6 border-b border-slate-800 flex justify-between items-center ${isDirect ? 'bg-indigo-950/20' : 'bg-slate-800/20'}`}>
        <div>
           <h3 className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] ${isDirect ? 'text-indigo-400' : 'text-slate-400'}`}>
            {title}
          </h3>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[400px]">Product & Categorie</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[300px]">Afmetingen (mm)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40">Units</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Inkoop</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-44">{isDirect ? 'Marge (%)' : 'Extra Marge'}</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right">Totaal Ink.</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right text-blue-400">Verkoop</th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-24 text-center">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {lines.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">Geen items</td></tr>
            )}
            {lines.map(line => {
              const { totalCost, salesPrice } = calculateMaterialLine(line, project.materialMarginPct, project.materialMarginEnabled);
              const isDimensionable = line.category === MaterialCategory.PLAATMATERIAAL || line.category === MaterialCategory.MASSIEF || line.category === MaterialCategory.SPUITWERK;
              const isFixed = !!line.libraryItemId;
              const isSpuitwerk = line.category === MaterialCategory.SPUITWERK;
              return (
                <tr key={line.id} className="hover:bg-slate-800/30 group transition-all animate-fadeIn">
                  <td className="px-6 py-6 align-top">
                    <select disabled={isFixed} value={line.category} onChange={(e) => handleUpdateLine(line.id, { category: e.target.value as MaterialCategory })} className={`block w-full text-[10px] font-black bg-transparent mb-2 outline-none uppercase tracking-widest cursor-pointer ${isFixed ? 'text-slate-600' : 'text-blue-400'}`}>
                      {Object.values(MaterialCategory).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                    <input disabled={isFixed} type="text" value={line.description} placeholder="Omschrijving..." onChange={(e) => handleUpdateLine(line.id, { description: e.target.value })} className={`block w-full text-base font-bold bg-slate-800/50 border-2 rounded-xl px-4 py-3 transition-all outline-none ${isFixed ? 'border-transparent text-slate-400' : 'border-slate-700 focus:border-blue-500 text-white'}`} />
                  </td>
                  <td className="px-6 py-6 align-top">
                    {isDimensionable && !isSpuitwerk ? (
                      <div className="flex items-center gap-3">
                        {['L', 'B', 'D'].map(dim => (
                          <div key={dim} className="space-y-1">
                            <label className="text-[8px] font-black text-slate-500 uppercase">{dim}</label>
                            <input disabled={isFixed} type="number" value={line[dim === 'L' ? 'length' : dim === 'B' ? 'width' : 'thickness'] || 0} onChange={(e) => handleUpdateLine(line.id, { [dim === 'L' ? 'length' : dim === 'B' ? 'width' : 'thickness']: Number(e.target.value) })} className="w-16 px-2 py-2 text-xs font-black bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 outline-none transition-all text-white" />
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-slate-700 text-[10px] font-black italic uppercase tracking-widest mt-6 block">N/B</span>}
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-500 uppercase">{isSpuitwerk ? 'm²' : 'Units'}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" value={line.quantity} onChange={(e) => handleUpdateLine(line.id, { quantity: Number(e.target.value) })} className="w-24 px-4 py-3 text-sm font-black bg-slate-800 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white transition-all" />
                        <select disabled={isFixed} value={line.unit} onChange={(e) => handleUpdateLine(line.id, { unit: e.target.value as MaterialUnit })} className={`text-[10px] font-black bg-transparent border-none outline-none cursor-pointer ${isFixed ? 'text-slate-600' : 'text-slate-400'}`}>
                          {Object.values(MaterialUnit).map(u => <option key={u} value={u} className="bg-slate-900">{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 align-top"><div className="space-y-1"><label className="text-[8px] font-black text-slate-500 uppercase">Inkoop</label><input disabled={isFixed} type="number" value={line.unitCost} onChange={(e) => handleUpdateLine(line.id, { unitCost: Number(e.target.value) })} className="w-24 px-3 py-3 text-sm font-black bg-slate-800 border border-slate-700 rounded-xl focus:border-blue-500 outline-none text-white" /></div></td>
                  <td className="px-6 py-6 align-top"><div className="flex items-center gap-2 mt-5">{!isDirect && <input type="checkbox" checked={line.marginOverrideEnabled} onChange={(e) => handleUpdateLine(line.id, { marginOverrideEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500" />}{(isDirect || line.marginOverrideEnabled) && <input type="number" value={line.marginOverridePct} onChange={(e) => handleUpdateLine(line.id, { marginOverridePct: Number(e.target.value) })} className="w-16 px-2 py-2 text-[10px] font-black bg-slate-800 border border-slate-700 rounded-lg text-white" />}</div></td>
                  <td className="px-6 py-6 align-top text-right"><div className="text-sm font-bold text-slate-400 mt-5">{formatCurrency(totalCost)}</div></td>
                  <td className="px-6 py-6 align-top text-right"><div className="text-sm font-black text-blue-400 mt-5">{formatCurrency(salesPrice)}</div></td>
                  <td className="px-6 py-6 align-top"><div className="flex justify-center gap-2 mt-4"><button onClick={() => handleDuplicateLine(line)} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button><button onClick={() => handleDeleteLine(line.id)} className="p-2.5 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {lines.length === 0 && <p className="text-center py-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Geen items</p>}
        {lines.map(line => {
          const { totalCost, salesPrice } = calculateMaterialLine(line, project.materialMarginPct, project.materialMarginEnabled);
          const isFixed = !!line.libraryItemId;
          return (
            <div key={line.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-2">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1">{line.category}</span>
                  <input disabled={isFixed} value={line.description} onChange={(e) => handleUpdateLine(line.id, { description: e.target.value })} className="w-full bg-transparent border-b border-slate-700 text-sm font-black text-white focus:border-blue-500 outline-none pb-1" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDuplicateLine(line)} className="p-1.5 text-slate-400 hover:text-blue-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button>
                  <button onClick={() => handleDeleteLine(line.id)} className="p-1.5 text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Aantal ({line.unit})</label>
                  <input type="number" step="0.01" value={line.quantity} onChange={(e) => handleUpdateLine(line.id, { quantity: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Inkoop p/u</label>
                  <input type="number" step="0.01" value={line.unitCost} onChange={(e) => handleUpdateLine(line.id, { unitCost: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Totaal Verkoop</span>
                <span className="text-sm font-black text-blue-400">{formatCurrency(salesPrice)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 md:p-10 border-t border-slate-800 bg-slate-900/80 flex flex-wrap gap-4 md:gap-6">
        <button onClick={() => addLine(isDirect)} className={`flex-1 md:flex-none flex items-center justify-center gap-3 md:gap-4 px-6 md:px-10 py-4 md:py-5 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl ${isDirect ? 'bg-indigo-600' : 'bg-blue-600'}`}>
          <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Nieuw
        </button>
        <button onClick={() => { setShowLibPicker(true); setTargetIsDirect(isDirect); }} className="flex-1 md:flex-none flex items-center justify-center gap-3 md:gap-4 px-6 md:px-10 py-4 md:py-5 bg-slate-800 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl">
          <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          Bieb
        </button>
      </div>
    </div>
  );

  const standardMaterials = project.materials.filter(m => !m.isDirectPurchase);
  const directPurchaseItems = project.materials.filter(m => m.isDirectPurchase);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
        <div className="flex items-center gap-4">
          <input type="checkbox" checked={project.materialMarginEnabled} onChange={(e) => onUpdate({ materialMarginEnabled: e.target.checked })} className="w-6 h-6 rounded bg-slate-800 text-blue-500" />
          <label className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest">Standaard Marge</label>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">%:</span>
          <input type="number" value={project.materialMarginPct} disabled={!project.materialMarginEnabled} onChange={(e) => onUpdate({ materialMarginPct: Number(e.target.value) })} className="flex-1 md:w-32 px-5 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white font-black" />
        </div>
      </div>

      {renderTable(standardMaterials, "Materialen", false)}
      {renderTable(directPurchaseItems, "Directe Inkoop", true)}

      {showLibPicker && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-full md:h-[85vh] rounded-3xl md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.2em]">Bibliotheek</h3>
              <button onClick={() => setShowLibPicker(false)} className="text-slate-500 p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 md:px-8 py-3 bg-slate-800/30 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 shrink-0">
              <button onClick={() => setPickerCategory('ALL')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${pickerCategory === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Alles</button>
              {Object.values(MaterialCategory).map(cat => <button key={cat} onClick={() => setPickerCategory(cat)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${pickerCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{cat}</button>)}
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 custom-scrollbar">
              {filteredLibrary.map(item => (
                <div key={item.id} onClick={() => addLine(targetIsDirect, item)} className="bg-slate-800/40 border border-slate-700 p-5 rounded-3xl hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">{item.category}</span>
                       <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{item.unit}</span>
                    </div>
                    <h4 className="text-xs font-black text-white line-clamp-2">{item.description}</h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-400">{formatCurrency(item.unitCost)}</span>
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialTab;
