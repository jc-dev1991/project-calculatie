
import React, { useState, useEffect } from 'react';
import { LibraryMaterial, MaterialCategory, MaterialUnit } from '../types';
import { formatCurrency } from '../utils/calculations';

interface LibraryTabProps {
  library: LibraryMaterial[];
  onAdd: (item: Omit<LibraryMaterial, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<LibraryMaterial>) => void;
  onDelete: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: MaterialCategory }) => {
  switch (category) {
    case MaterialCategory.PLAATMATERIAAL:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM4 9h16M4 13h16M4 17h16" /></svg>;
    case MaterialCategory.MASSIEF:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18M19 3v18M5 10h14M5 14h14M5 18h14M5 6h14" /></svg>;
    case MaterialCategory.BESLAG:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
    case MaterialCategory.SPUITWERK:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" /></svg>;
    default:
      return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  }
};

const LibraryTab: React.FC<LibraryTabProps> = ({ library, onAdd, onUpdate, onDelete }) => {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pricePerM2, setPricePerM2] = useState<number>(0);
  const [editForm, setEditForm] = useState<Omit<LibraryMaterial, 'id'>>({
    category: MaterialCategory.PLAATMATERIAAL,
    description: '',
    unit: MaterialUnit.M2,
    unitCost: 0,
    length: 0,
    width: 0,
    thickness: 0
  });

  useEffect(() => {
    const usesAutoM2 = editForm.category === MaterialCategory.PLAATMATERIAAL || 
                        editForm.category === MaterialCategory.MASSIEF;

    if (usesAutoM2 && editForm.length && editForm.width && pricePerM2 > 0 && editForm.unit === MaterialUnit.M2) {
      const area = (editForm.length / 1000) * (editForm.width / 1000);
      const calculatedCost = area * pricePerM2;
      setEditForm(prev => ({ ...prev, unitCost: Number(calculatedCost.toFixed(2)) }));
    }
  }, [editForm.category, editForm.length, editForm.width, editForm.unit, pricePerM2]);

  const handleOpenAdd = () => {
    const category = activeCategory !== 'ALL' ? activeCategory : MaterialCategory.PLAATMATERIAAL;
    
    // Bepaal de meest logische eenheid voor de geselecteerde categorie
    let defaultUnit = MaterialUnit.PCS;
    if (category === MaterialCategory.PLAATMATERIAAL || category === MaterialCategory.SPUITWERK) {
      defaultUnit = MaterialUnit.M2;
    } else if (category === MaterialCategory.AFWERKING) {
      defaultUnit = MaterialUnit.M1; // Standaard m1 voor kantenband/fineer
    }

    setEditForm({
      category,
      description: '',
      unit: defaultUnit,
      unitCost: 0,
      length: 0,
      width: 0,
      thickness: 0
    });
    setPricePerM2(0);
    setIsAdding(true);
    setEditingId(null);
  };

  const handleDoubleClick = (item: LibraryMaterial) => {
    setEditForm({
      category: item.category,
      description: item.description,
      unit: item.unit,
      unitCost: item.unitCost,
      length: item.length || 0,
      width: item.width || 0,
      thickness: item.thickness || 0
    });
    
    if (item.length && item.width && item.unitCost > 0 && item.category !== MaterialCategory.SPUITWERK) {
        const area = (item.length / 1000) * (item.width / 1000);
        setPricePerM2(Number((item.unitCost / area).toFixed(2)));
    } else {
        setPricePerM2(0);
    }
    setEditingId(item.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.description.trim()) return;
    
    const finalForm = editForm.category === MaterialCategory.SPUITWERK 
      ? { ...editForm, length: 0, width: 0, thickness: 0, unit: MaterialUnit.M2 }
      : editForm;

    if (editingId) {
      onUpdate(editingId, finalForm);
    } else {
      onAdd(finalForm);
    }
    
    setIsAdding(false);
    setEditingId(null);
  };

  const executeDelete = () => {
    if (editingId) {
      onDelete(editingId);
      setEditingId(null);
      setShowConfirmDelete(false);
    }
  };

  const filteredLibrary = activeCategory === 'ALL' 
    ? library 
    : library.filter(item => item.category === activeCategory);

  const isDimensionable = editForm.category === MaterialCategory.PLAATMATERIAAL || 
                           editForm.category === MaterialCategory.MASSIEF;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fadeIn pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Materialen Bibliotheek</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Centrale catalogus. Filter op categorie voor snel overzicht.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/30 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          <span className="uppercase tracking-[0.1em] text-sm">Nieuw Product</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveCategory('ALL')}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
        >
          Alles
        </button>
        {Object.values(MaterialCategory).map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-6 overflow-y-auto">
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full space-y-6">
                <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Item Verwijderen?</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Dit product wordt definitief uit de bibliotheek verwijderd.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowConfirmDelete(false)} className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-[9px] rounded-xl">Annuleren</button>
                  <button onClick={executeDelete} className="flex-1 px-4 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl">Verwijderen</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border-2 border-slate-800 w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 animate-fadeIn my-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${editingId ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-500'}`}>
                   <CategoryIcon category={editForm.category} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">{editingId ? 'Product Bewerken' : 'Nieuw Product'}</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {editForm.category === MaterialCategory.SPUITWERK ? 'Prijsopgave per m²' : 'Slimme Calculatie Actief'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setEditingId(null); setIsAdding(false); }} className="text-slate-500 hover:text-white transition-colors p-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-[0.2em]">Omschrijving</label>
                  <input 
                    type="text" autoFocus
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-5 text-white focus:border-blue-500 outline-none font-bold text-lg"
                    placeholder="Beschrijving..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-[0.2em]">Categorie</label>
                  <select 
                    value={editForm.category}
                    onChange={(e) => {
                      const newCat = e.target.value as MaterialCategory;
                      let newUnit = editForm.unit;
                      if (newCat === MaterialCategory.PLAATMATERIAAL || newCat === MaterialCategory.SPUITWERK) {
                        newUnit = MaterialUnit.M2;
                      } else if (newCat === MaterialCategory.AFWERKING) {
                        newUnit = MaterialUnit.M1;
                      }
                      setEditForm({
                        ...editForm, 
                        category: newCat,
                        unit: newUnit
                      });
                    }}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-5 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
                  >
                    {Object.values(MaterialCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-[0.2em]">Eenheid</label>
                  <select 
                    value={editForm.unit}
                    onChange={(e) => setEditForm({...editForm, unit: e.target.value as MaterialUnit})}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-5 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
                  >
                    {Object.values(MaterialUnit).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {isDimensionable && (
                <div className="pt-10 border-t border-slate-800 space-y-10">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Afmeting & Slimme Prijs</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase block mb-2">Lengte (mm)</label>
                      <input 
                        type="number" 
                        value={editForm.length} 
                        onChange={e => setEditForm({...editForm, length: Number(e.target.value)})} 
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase block mb-2">Breedte (mm)</label>
                      <input 
                        type="number" 
                        value={editForm.width} 
                        onChange={e => setEditForm({...editForm, width: Number(e.target.value)})} 
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-600 uppercase block mb-2">Dikte (mm)</label>
                      <input 
                        type="number" 
                        value={editForm.thickness} 
                        onChange={e => setEditForm({...editForm, thickness: Number(e.target.value)})} 
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 bg-blue-900/10 p-8 rounded-3xl border border-blue-900/20">
                    <div>
                      <label className="text-[10px] font-black text-blue-400 uppercase block mb-3 tracking-[0.2em]">Prijs per m²</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50 font-black text-lg">€</span>
                        <input 
                          type="number" step="0.01"
                          value={pricePerM2}
                          onChange={(e) => setPricePerM2(Number(e.target.value))}
                          className="w-full bg-slate-800 border-2 border-blue-500/30 rounded-2xl pl-10 pr-6 py-4 text-white focus:border-blue-500 outline-none font-black text-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-emerald-400 uppercase block mb-3 tracking-[0.2em]">Inkoopbedrag ex BTW</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 font-black text-lg">€</span>
                        <input 
                          type="number" step="0.01"
                          readOnly
                          value={editForm.unitCost}
                          className="w-full bg-slate-800/50 border-2 border-emerald-500/20 rounded-2xl pl-10 pr-6 py-4 text-emerald-400 outline-none font-black text-xl cursor-default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(!isDimensionable || editForm.category === MaterialCategory.SPUITWERK) && (
                <div className="pt-10 border-t border-slate-800">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-[0.2em]">
                    {editForm.category === MaterialCategory.SPUITWERK || editForm.unit === MaterialUnit.M1 ? 'Prijs per eenheid (ex BTW)' : 'Inkoopbedrag ex BTW'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">€</span>
                    <input 
                      type="number" step="0.01"
                      value={editForm.unitCost}
                      onChange={(e) => setEditForm({...editForm, unitCost: Number(e.target.value)})}
                      className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-12 pr-6 py-5 text-white focus:border-blue-500 outline-none font-bold text-lg"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40">
                  {editingId ? 'Wijzigingen Opslaan' : 'Product Toevoegen'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-10 bg-red-900/20 text-red-500 border-2 border-red-900/30 hover:bg-red-900/40 font-black uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Verwijder
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredLibrary.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
            Geen producten in deze categorie
          </div>
        )}
        {filteredLibrary.map(item => (
          <div 
            key={item.id}
            onDoubleClick={() => handleDoubleClick(item)}
            className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-800 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <CategoryIcon category={item.category} />
                </div>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-800/50 px-2 py-1 rounded">ID: {item.id.slice(0,5)}</span>
              </div>
              
              <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-2">{item.description}</h4>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.category}</p>
              
              <div className="mt-8 space-y-3">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Inkoop / {item.unit}</span>
                  <span className="text-lg font-black text-white">{formatCurrency(item.unitCost)}</span>
                </div>
                {item.length && item.width && item.category !== MaterialCategory.SPUITWERK ? (
                   <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Afmeting</span>
                    <span className="text-xs font-bold text-slate-400">{item.length} x {item.width} x {item.thickness} mm</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Double-click to edit</span>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleDoubleClick(item); }} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryTab;
