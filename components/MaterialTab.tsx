
import React, { useState, useMemo } from 'react';
import { Project, MaterialLine, MaterialCategory, MaterialUnit, LibraryMaterial } from '../types';
import { calculateMaterialLine, formatCurrency } from '../utils/calculations';

interface MaterialTabProps {
  project: Project;
  library: LibraryMaterial[];
  onUpdate: (updates: Partial<Project>) => void;
}

const MaterialTab: React.FC<MaterialTabProps> = ({ project, library, onUpdate }) => {
  const [showLibPicker, setShowLibPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [targetIsDirect, setTargetIsDirect] = useState(false);

  const materials = project.materials || [];

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
      marginOverridePct: isDirect ? 0 : 0, 
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
    updateMaterials([...materials, newLine]);
    setShowLibPicker(false);
  };

  const handleUpdateLine = (id: string, updates: Partial<MaterialLine>) => {
    const updated = materials.map(m => m.id === id ? { ...m, ...updates } : m);
    updateMaterials(updated);
  };

  const handleDeleteLine = (id: string) => updateMaterials(materials.filter(m => m.id !== id));
  const handleDuplicateLine = (line: MaterialLine) => updateMaterials([...materials, { ...line, id: crypto.randomUUID() }]);

  const renderMobileCard = (line: MaterialLine, isDirect: boolean) => {
    const { totalCost, salesPrice } = calculateMaterialLine(line, project.materialMarginPct, project.materialMarginEnabled);
    const isDimensionable = line.category === MaterialCategory.PLAATMATERIAAL || line.category === MaterialCategory.MASSIEF || line.category === MaterialCategory.SPUITWERK;
    const isFixed = !!line.libraryItemId;
    
    const isMarginInputDisabled = !isDirect && !line.marginOverrideEnabled;
    const marginValueToShow = isMarginInputDisabled 
      ? (project.materialMarginPct ?? 0) 
      : (line.marginOverridePct ?? 0);

    return (
      <div key={line.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg animate-fadeIn">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <select 
              disabled={isFixed} 
              value={line.category} 
              onChange={(e) => handleUpdateLine(line.id, { category: e.target.value as MaterialCategory })} 
              className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-transparent outline-none mb-1"
            >
              {Object.values(MaterialCategory).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
            <input 
              disabled={isFixed} 
              type="text" 
              value={line.description} 
              onChange={(e) => handleUpdateLine(line.id, { description: e.target.value })}
              className="w-full bg-transparent text-white font-bold placeholder-slate-600 outline-none border-b border-slate-800 focus:border-blue-500 py-1"
              placeholder="Omschrijving..."
            />
            {isDimensionable && line.length && line.width ? (
              <div className="mt-1 text-[9px] font-bold text-slate-500">
                Afmeting: <span className="text-slate-300">{line.length} x {line.width} {line.thickness ? `x ${line.thickness}` : ''} mm</span>
              </div>
            ) : null}
          </div>
          <div className="flex gap-1">
            <button onClick={() => handleDuplicateLine(line)} className="p-2 text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button>
            <button onClick={() => handleDeleteLine(line.id)} className="p-2 text-red-500/50 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        </div>

        {isDimensionable && (
          <div className="grid grid-cols-3 gap-2">
            {['length', 'width', 'thickness'].map(dim => (
              <div key={dim}>
                <label className="text-[8px] font-black text-slate-500 uppercase">{dim === 'length' ? 'L' : dim === 'width' ? 'B' : 'D'}</label>
                <input 
                  disabled={isFixed} 
                  type="number" 
                  value={line[dim as keyof MaterialLine] as number || 0} 
                  onChange={(e) => handleUpdateLine(line.id, { [dim]: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs font-black text-white"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase">Aantal / Eenheid</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.01" 
                value={line.quantity} 
                onChange={(e) => handleUpdateLine(line.id, { quantity: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white"
              />
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{line.unit}</span>
            </div>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-500 uppercase">Inkoop / Unit</label>
            <input 
              disabled={isFixed} 
              type="number" 
              step="0.01" 
              value={line.unitCost} 
              onChange={(e) => handleUpdateLine(line.id, { unitCost: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {!isDirect && (
              <input 
                type="checkbox" 
                checked={line.marginOverrideEnabled} 
                onChange={(e) => handleUpdateLine(line.id, { marginOverrideEnabled: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 text-blue-500"
              />
            )}
            <div className="relative">
              <input 
                disabled={isMarginInputDisabled}
                type="number" 
                value={marginValueToShow}
                onChange={(e) => handleUpdateLine(line.id, { marginOverridePct: Number(e.target.value) })}
                className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-black text-white text-right pr-4"
              />
              <span className="absolute right-1 top-1 text-[8px] font-bold text-slate-500">%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black text-slate-500 uppercase">Verkoop</div>
            <div className="text-sm font-black text-blue-400">{formatCurrency(salesPrice)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = (lines: MaterialLine[], title: string, isDirect: boolean) => (
    <div className="bg-slate-900 md:rounded-[2rem] border-y md:border border-slate-800 shadow-2xl overflow-hidden mb-8 md:mb-12 rounded-none -mx-4 md:mx-0">
      <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-400">
          {title}
        </h3>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-slate-800/30 border-b border-slate-800">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[450px]">Product & Categorie</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40">Afmetingen (mm)</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40">Units</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Inkoop</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-44">{isDirect ? 'MARGE (%)' : 'EXTRA MARGE'}</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right">TOTAAL INK.</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right text-blue-400">VERKOOP</th>
              <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-24 text-center">ACTIES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {lines.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">Geen items</td></tr>
            ) : (
              lines.map(line => {
                const { totalCost, salesPrice } = calculateMaterialLine(line, project.materialMarginPct, project.materialMarginEnabled);
                const isDimensionable = line.category === MaterialCategory.PLAATMATERIAAL || line.category === MaterialCategory.MASSIEF || line.category === MaterialCategory.SPUITWERK;
                const isFixed = !!line.libraryItemId;
                const isSpuitwerk = line.category === MaterialCategory.SPUITWERK;
                
                const isMarginInputDisabled = !isDirect && !line.marginOverrideEnabled;
                const marginValueToShow = isMarginInputDisabled 
                  ? (project.materialMarginPct ?? 0) 
                  : (line.marginOverridePct ?? 0);

                return (
                  <tr key={line.id} className="hover:bg-slate-800/30 group transition-all animate-fadeIn">
                    <td className="px-6 py-6 align-top">
                      <select disabled={isFixed} value={line.category} onChange={(e) => handleUpdateLine(line.id, { category: e.target.value as MaterialCategory })} className={`block w-full text-[10px] font-black bg-transparent mb-2 outline-none uppercase tracking-widest cursor-pointer ${isFixed ? 'text-slate-600' : 'text-blue-400'}`}>
                        {Object.values(MaterialCategory).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                      </select>
                      <input disabled={isFixed} type="text" value={line.description} placeholder="Omschrijving..." onChange={(e) => handleUpdateLine(line.id, { description: e.target.value })} className={`block w-full text-base font-bold bg-slate-950/50 border-2 rounded-xl px-4 py-3.5 transition-all outline-none ${isFixed ? 'border-transparent text-slate-400' : 'border-slate-800 focus:border-blue-500 text-white'}`} />
                      
                      {/* Weergave afmetingen onder beschrijving */}
                      {isDimensionable && line.length && line.width ? (
                        <div className="mt-2 pl-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full"></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            {line.length} x {line.width} {line.thickness ? `x ${line.thickness}` : ''} mm
                          </span>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-6 align-top">
                      {isDimensionable && !isSpuitwerk ? (
                        <div className="flex items-center gap-3">
                          {['L', 'B', 'D'].map(dim => (
                            <div key={dim} className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase">{dim}</label>
                              <input disabled={isFixed} type="number" value={line[dim === 'L' ? 'length' : dim === 'B' ? 'width' : 'thickness'] || 0} onChange={(e) => handleUpdateLine(line.id, { [dim === 'L' ? 'length' : dim === 'B' ? 'width' : 'thickness']: Number(e.target.value) })} className="w-16 px-2 py-2 text-xs font-black bg-slate-950 border border-slate-800 rounded-lg focus:border-blue-500 outline-none transition-all text-white" />
                            </div>
                          ))}
                        </div>
                      ) : <span className="text-slate-700 text-[10px] font-black italic uppercase tracking-widest mt-8 block">N/B</span>}
                    </td>
                    <td className="px-6 py-6 align-top">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">{isSpuitwerk ? 'm²' : 'Units'}</label>
                        <div className="flex items-center gap-2">
                          <input type="number" step="0.01" value={line.quantity} onChange={(e) => handleUpdateLine(line.id, { quantity: Number(e.target.value) })} className="w-20 px-3 py-3 text-sm font-black bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 outline-none text-white transition-all" />
                          <span className="text-xs font-bold text-slate-500">{line.unit === MaterialUnit.PCS ? 'stuks' : line.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top"><div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Inkoop</label><input disabled={isFixed} type="number" step="0.01" value={line.unitCost} onChange={(e) => handleUpdateLine(line.id, { unitCost: Number(e.target.value) })} className="w-24 px-3 py-3 text-sm font-black bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 outline-none text-white" /></div></td>
                    <td className="px-6 py-6 align-top">
                      <div className="flex items-center gap-3 mt-7">
                        {!isDirect && (
                          <input
                            type="checkbox"
                            checked={line.marginOverrideEnabled ?? false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              handleUpdateLine(line.id, { 
                                marginOverrideEnabled: isChecked,
                                marginOverridePct: isChecked ? (line.marginOverridePct || project.materialMarginPct || 0) : 0
                              });
                            }}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0 cursor-pointer"
                          />
                        )}
                        <div className="relative">
                           <input
                            type="number"
                            disabled={isMarginInputDisabled}
                            value={marginValueToShow}
                            onChange={(e) => handleUpdateLine(line.id, { marginOverridePct: Number(e.target.value) })}
                            className={`w-20 px-3 py-2 text-sm font-black border rounded-lg outline-none transition-all ${isMarginInputDisabled ? 'bg-slate-900 border-slate-800 text-slate-500 opacity-60' : 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'}`}
                          />
                          <span className="absolute right-3 top-2 text-xs font-bold text-slate-500">%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 align-top text-right"><div className="text-sm font-bold text-slate-400 mt-7">{formatCurrency(totalCost)}</div></td>
                    <td className="px-6 py-6 align-top text-right"><div className="text-sm font-black text-blue-400 mt-7">{formatCurrency(salesPrice)}</div></td>
                    <td className="px-6 py-6 align-top"><div className="flex justify-center gap-2 mt-5"><button onClick={() => handleDuplicateLine(line)} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg></button><button onClick={() => handleDeleteLine(line.id)} className="p-2.5 bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden p-4 space-y-4">
        {lines.length === 0 ? (
          <div className="py-12 text-center text-slate-600 font-black uppercase text-[10px]">Geen items</div>
        ) : (
          lines.map(line => renderMobileCard(line, isDirect))
        )}
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

  const standardMaterials = materials.filter(m => !m.isDirectPurchase);
  const directPurchaseItems = materials.filter(m => m.isDirectPurchase);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-slate-950 p-6 md:p-8 rounded-[2rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-6 md:gap-12 group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80"></div>
        <div className="flex items-center gap-4 z-10 w-full md:w-auto">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
             <input type="checkbox" checked={project.materialMarginEnabled} onChange={(e) => onUpdate({ materialMarginEnabled: e.target.checked })} className="w-6 h-6 rounded bg-slate-800 text-blue-500 border-slate-600 focus:ring-0 cursor-pointer" />
          </div>
          <label className="text-[10px] md:text-sm font-black text-white uppercase tracking-[0.2em]">STANDAARD MARGE</label>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto z-10">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">MARGE % :</span>
          <input 
            type="number" 
            value={project.materialMarginPct ?? 0} 
            disabled={!project.materialMarginEnabled} 
            onChange={(e) => onUpdate({ materialMarginPct: Number(e.target.value) })} 
            className="flex-1 md:w-32 px-6 py-4 bg-slate-900 border-2 border-slate-800 rounded-2xl text-2xl font-black text-white focus:border-blue-500 outline-none disabled:opacity-50" 
          />
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
            <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setPickerCategory('ALL')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${pickerCategory === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>Alles</button>
              {Object.values(MaterialCategory).map(c => (
                <button key={c} onClick={() => setPickerCategory(c)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${pickerCategory === c ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>{c}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 custom-scrollbar">
              {filteredLibrary.map(item => (
                <div key={item.id} onClick={() => addLine(targetIsDirect, item)} className="bg-slate-800/40 border-2 border-slate-700 p-6 rounded-3xl hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between group">
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white line-clamp-2 leading-tight">{item.description}</h4>
                    {item.length && item.width ? (
                      <p className="text-[10px] text-slate-500 font-bold mt-2">
                        {item.length} x {item.width} {item.thickness ? `x ${item.thickness}` : ''} mm
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs md:text-sm font-black text-blue-400">{formatCurrency(item.unitCost)} <span className="text-[9px] text-slate-600 ml-1">/ {item.unit}</span></span>
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
