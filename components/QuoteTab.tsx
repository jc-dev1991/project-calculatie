import React, { useEffect, useState } from 'react';
import { Project, ProjectTotals } from '../types';
import { calculateProjectTotals, formatCurrency } from '../utils/calculations';
import { useProjectStore } from '../store/useProjectStore';

interface QuoteTabProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
}

const QuoteTab: React.FC<QuoteTabProps> = ({ project, onUpdate }) => {
  const [totals, setTotals] = useState<ProjectTotals | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const { settings } = useProjectStore();

  useEffect(() => {
    if (!project.quoteIntro) onUpdate({ quoteIntro: "Hierbij ontvangt u de offerte voor de besproken werkzaamheden." });
    if (!project.quoteClosing) onUpdate({ quoteClosing: "Wij hopen u hiermee een passende aanbieding te hebben gedaan." });
    setTotals(calculateProjectTotals(project));
  }, [project.id]);

  useEffect(() => {
    setTotals(calculateProjectTotals(project));
  }, [project]);

  const handlePrint = () => {
    setIsPrinting(true);
    // Korte timeout is prima, de vertraging zat in de CSS shadows
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 50);
  };

  if (!totals) return <div>Laden...</div>;

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* CONTROLS */}
      <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl print:hidden flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-widest">Offerte</h3>
          <p className="text-slate-500 text-xs mt-1">
            Tip: Zet 'Kop- en voetteksten' UIT in het printmenu.
          </p>
        </div>
        <button 
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-wait"
        >
          {isPrinting ? 'Maken...' : 'PDF Downloaden'}
        </button>
      </div>

      {/* HET A4 PAPIER - Met 'print-section' */}
      <div className="print-section bg-white text-black w-full max-w-[210mm] min-h-[297mm] mx-auto p-[15mm] md:p-[20mm] pb-[60px] shadow-2xl rounded-none md:rounded-lg relative flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-sm text-black leading-relaxed font-bold">
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black" contentEditable suppressContentEditableWarning>
              {settings.companyName || 'Uw Bedrijfsnaam'}
            </h1>
            <p contentEditable suppressContentEditableWarning className="text-black">
              {settings.companyStreet || 'Straatnaam'} {settings.companyHouseNumber || ''}
            </p>
            <p contentEditable suppressContentEditableWarning className="text-black">{settings.companyZipCode || '1234 AB'} {settings.companyCity || 'Plaats'}</p>
            <p contentEditable suppressContentEditableWarning className="mt-2 text-black">{settings.companyEmail || 'email@bedrijf.nl'}</p>
            <p contentEditable suppressContentEditableWarning className="text-black">{settings.companyPhone || '06-12345678'}</p>
          </div>
          
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest mb-4">Offerte</h2>
            <div className="text-sm font-bold text-black">
              <p>Datum: <span className="font-bold text-black">{new Date().toLocaleDateString('nl-NL')}</span></p>
              <p>Ref: <span className="font-bold text-black">{new Date().getFullYear()}-{String(project.documentNumber || 0).padStart(3, '0')}</span></p>
            </div>
          </div>
        </div>

        {/* Klant */}
        <div className="mb-8 pl-4 border-l-4 border-slate-900">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Aan</p>
          <p className="font-black text-lg text-black uppercase">{project.clientName || 'Klantnaam'}</p>
          <p className="text-black font-bold">{project.title}</p>
        </div>

        {/* Intro */}
        <div className="mb-6">
          <textarea 
            value={project.quoteIntro} 
            onChange={(e) => onUpdate({ quoteIntro: e.target.value })}
            className="w-full resize-none outline-none !text-black !font-bold leading-relaxed !bg-white border-2 border-slate-300 focus:border-blue-500 rounded-lg p-3 transition-colors placeholder:text-slate-400"
            rows={3}
          />
        </div>

        {/* Tabel */}
        <table className="w-full mb-6">
          <thead className="border-b-2 border-slate-900">
            <tr>
              <th className="text-left py-2 font-black uppercase text-xs tracking-widest text-black">Omschrijving</th>
              <th className="text-right py-2 font-black uppercase text-xs tracking-widest text-black">Bedrag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-3 font-bold text-black">Materialen</td>
              <td className="py-3 text-right font-bold text-black">{formatCurrency(totals.materialsSalesTotal)}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-black">Arbeid & Montage</td>
              <td className="py-3 text-right font-bold text-black">{formatCurrency(totals.laborSalesTotal)}</td>
            </tr>
            {totals.extrasSalesTotal > 0 && (
              <tr>
                <td className="py-3 font-bold text-black">Overige Kosten</td>
                <td className="py-3 text-right font-bold text-black">{formatCurrency(totals.extrasSalesTotal)}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-slate-900">
            <tr>
              <td className="py-3 text-right font-bold text-slate-600">Subtotaal</td>
              <td className="py-3 text-right font-bold text-black">{formatCurrency(totals.subtotalSales)}</td>
            </tr>
            <tr>
              <td className="py-1 text-right text-sm text-slate-600 font-bold">BTW ({project.vatRate}%)</td>
              <td className="py-1 text-right text-sm text-slate-600 font-bold">{formatCurrency(totals.vatAmount)}</td>
            </tr>
            <tr className="text-xl">
              <td className="py-3 text-right font-black text-black">Totaal</td>
              <td className="py-3 text-right font-black text-black">{formatCurrency(totals.totalIncVat)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Slotwoord */}
        <div className="mb-8">
          <textarea 
            value={project.quoteClosing} 
            onChange={(e) => onUpdate({ quoteClosing: e.target.value })}
            className="w-full resize-none outline-none !text-black !font-bold leading-relaxed !bg-white border-2 border-slate-300 focus:border-blue-500 rounded-lg p-3 transition-colors placeholder:text-slate-400"
            rows={2}
          />
        </div>

        {/* Ondertekening */}
        <div className="flex justify-between mt-auto break-inside-avoid pb-8">
          <div className="w-56 border-t-2 border-slate-900 pt-2">
            <p className="text-xs font-black uppercase text-slate-500">Voor akkoord,</p>
            <p className="font-bold mt-8 text-black">{project.clientName}</p>
            <p className="text-xs text-slate-500 mt-1 font-bold">Datum: ___/___/______</p>
          </div>
          <div className="w-56 border-t-2 border-slate-900 pt-2 text-right">
             <p className="text-xs font-black uppercase text-slate-500">{settings.companyName || 'Opdrachtnemer'}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full px-[20mm] pb-[15mm] text-center">
            <div className="border-t border-slate-200 pt-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mx-2">{settings.companyName}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mx-2">•</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mx-2">KVK: {settings.companyKvK}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mx-2">•</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mx-2">IBAN: {settings.companyIban}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTab;