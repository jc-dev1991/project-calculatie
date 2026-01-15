import React, { useState, useMemo } from 'react';
import { Project, MaterialLine } from '../types';

interface OrderListTabProps {
  project: Project;
}

const OrderListTab: React.FC<OrderListTabProps> = ({ project }) => {
  const [wastePercentage] = useState(0); 
  const [isPrinting, setIsPrinting] = useState(false);

  const groupedMaterials = useMemo(() => {
    const groups: Record<string, MaterialLine & { totalQuantity: number }> = {};
    (project.materials || []).forEach(mat => {
      const nameKey = mat.name || mat.description || 'Onbekend materiaal';
      const thickKey = mat.thickness ? `-${mat.thickness}mm` : '';
      const key = `${mat.category}-${nameKey}${thickKey}`;
      
      if (!groups[key]) groups[key] = { ...mat, name: nameKey, totalQuantity: 0 };
      groups[key].totalQuantity += (Number(mat.quantity) || 0);
    });
    return Object.values(groups).sort((a, b) => a.category.localeCompare(b.category));
  }, [project.materials]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 50);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl print:hidden flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-widest">Inkoop & Bestellijst</h3>
          <p className="text-slate-500 text-xs mt-1">Groepeert materialen op omschrijving en dikte.</p>
        </div>
        <button 
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-wait"
        >
          {isPrinting ? 'Maken...' : 'Print Lijst'}
        </button>
      </div>

      {/* Aangepast met 'print-section' */}
      <div className="print-section bg-white text-slate-900 p-10 rounded-[2rem] shadow-2xl overflow-hidden max-w-4xl mx-auto">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Bestellijst</h1>
            <h2 className="text-lg font-bold text-slate-500">{project.title}</h2>
          </div>
          <div className="text-right text-sm font-medium text-slate-600">
            <p>Ref: {project.documentNumber}</p>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-300 text-xs font-black uppercase tracking-widest text-slate-500">
              <th className="py-3 pl-2">Product / Omschrijving</th>
              <th className="py-3">Details</th>
              <th className="py-3 text-right">Aantal</th>
              <th className="py-3 pr-2 text-right w-24">Eenh.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {groupedMaterials.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 break-inside-avoid">
                <td className="py-3 pl-2 font-bold text-slate-800">{item.name}</td>
                <td className="py-3 text-slate-500 text-xs">
                  <span className="uppercase tracking-wide">{item.category}</span>
                  {item.thickness ? <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.thickness}mm</span> : ''}
                </td>
                <td className="py-3 text-right font-black text-slate-800">{Math.ceil(item.totalQuantity * 10) / 10}</td>
                <td className="py-3 pr-2 text-right text-slate-500">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderListTab;