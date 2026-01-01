
import React from 'react';
import { Project, ProjectTotals, MaterialCategory, LaborType, OfferSettings } from '../types';
import { calculateProjectTotals, formatCurrency, formatNumber, calculateMaterialLine } from '../utils/calculations';
import { useProjectStore } from '../store/useProjectStore';

interface OverviewTabProps {
  project: Project;
}

const InfoBadge = ({ title, text }: { title: string; text: string }) => (
  <div className="group relative inline-block ml-2 align-middle print:hidden">
    <svg className="w-4 h-4 text-slate-500 cursor-help hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-slate-800 text-slate-200 text-xs leading-relaxed rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] border border-slate-700">
      <div className="font-black text-blue-400 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">{title}</div>
      {text}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  const totals = calculateProjectTotals(project);
  const { settings } = useProjectStore();

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = (isCustomer: boolean = false) => {
    const element = document.getElementById('report-container');
    if (!element) return;

    const filename = isCustomer 
      ? `Offerte_${project.title.replace(/\s+/g, '_')}.pdf`
      : `Financieel_Rapport_${project.title.replace(/\s+/g, '_')}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    element.classList.add('pdf-mode');
    if (isCustomer) element.classList.add('customer-mode');
    
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('pdf-mode');
      element.classList.remove('customer-mode');
    });
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-24">
      {/* Top Action Bar - Hidden on print */}
      <div className="flex flex-wrap justify-between items-center print:hidden bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Financieel Overzicht</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mt-1">Beheer exports en rapportages</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => handleExportPdf(true)}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-lg active:scale-95 shadow-emerald-900/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Klant Offerte (PDF)
          </button>
          <button 
            onClick={() => handleExportPdf(false)}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-lg active:scale-95 shadow-indigo-900/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Intern Overzicht (PDF)
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Printen
          </button>
        </div>
      </div>

      {/* KPI Dashboard - Internal Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-lg">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Omzet</p>
          <div className="text-3xl font-black text-white">{formatCurrency(totals.subtotalSales)}</div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-lg">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Verwachte Winst</p>
          <div className="text-3xl font-black text-emerald-400">{formatCurrency(totals.grossProfit)}</div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-lg">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bruto Marge</p>
          <div className="text-3xl font-black text-white">{formatNumber(totals.grossMarginPct)}%</div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-lg">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">BTW ({project.vatRate}%)</p>
          <div className="text-3xl font-black text-slate-400">{formatCurrency(totals.vatAmount)}</div>
        </div>
      </div>

      {/* Main Financial Report Container */}
      <div id="report-container" className="report-root">
        <div className="report-content space-y-10">
          
          {/* Professional Header Section */}
          <div className="flex justify-between items-start border-b-4 border-slate-800 pb-8 report-border-dark">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase report-text-dark leading-none">
                {settings.companyName}
              </h1>
              <div className="text-[10px] text-slate-500 font-bold uppercase report-text-muted space-y-1 leading-relaxed">
                 <p className="flex items-center gap-2">
                   <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                   {settings.companyAddress}
                 </p>
                 <p className="flex items-center gap-2">
                   <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                   {settings.companyPhone}
                 </p>
                 <p className="flex items-center gap-2">
                   <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                   {settings.companyEmail}
                 </p>
              </div>

              {/* Recipient Details */}
              <div className="pt-6 border-t border-slate-800/30 report-border-muted mt-6">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 block">{settings.salutation}</span>
                <p className="text-xl font-black text-white report-text-dark uppercase">{project.clientName || 'Gewaardeerde Klant'}</p>
              </div>
            </div>

            <div className="text-right space-y-6">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 report-bg-highlight report-border">
                <h2 className="text-2xl font-black text-white report-text-dark uppercase tracking-tighter mb-1">
                  <span className="customer-hide">FINANCIEEL RAPPORT</span>
                  <span className="customer-only hidden">{settings.headerTitle}</span>
                </h2>
                <div className="space-y-1 mt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase report-text-muted">
                    Offertenummer: <span className="text-white report-text-dark ml-2">#Q-{project.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase report-text-muted">
                    Datum: <span className="text-white report-text-dark ml-2">{new Date().toLocaleDateString('nl-NL')}</span>
                  </p>
                </div>
              </div>
              <div className="internal-only pt-2">
                <span className="bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                  Status: {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Resultatenoverzicht - INTERNAL ONLY */}
          <section className="space-y-4 internal-only">
            <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4 py-1">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] report-text-dark">I. Exploitatie & Resultaat</h3>
            </div>

            <div className="bg-slate-900/50 rounded-[1.5rem] border border-slate-800 p-6 report-bg-light report-border">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50 report-border-muted">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest report-text-muted">Verkoop Omzet (Excl. BTW)</span>
                  <span className="text-lg font-black text-white report-text-dark">{formatCurrency(totals.subtotalSales)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50 report-border-muted">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest report-text-muted">Inkoopwaarde (COGS)</span>
                  <span className="text-lg font-black text-red-400 report-text-danger">({formatCurrency(totals.subtotalCost)})</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-slate-800/30 -mx-6 px-6 mt-2 report-bg-highlight">
                  <span className="text-sm font-black text-white uppercase tracking-[0.2em] report-text-dark">Bruto Resultaat</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 report-text-success">{formatCurrency(totals.grossProfit)}</span>
                    <div className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest report-text-success">Marge: {formatNumber(totals.grossMarginPct)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Kosten Opbouw / Specificatie */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4 py-1">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] report-text-dark">
                <span className="customer-hide">II. Gedetailleerde Kostenanalyse</span>
                <span className="customer-only hidden">Project Specificatie</span>
              </h3>
            </div>

            <div className="bg-slate-900/50 rounded-[1.5rem] border border-slate-800 overflow-hidden report-bg-light report-border">
              {/* Project Title Subheader */}
              <div className="px-6 py-5 border-b border-slate-800 report-border-muted bg-slate-800/20 report-bg-header">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Project omschrijving</span>
                <h4 className="text-lg font-black text-white report-text-dark uppercase">{project.title}</h4>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/80 report-bg-header">
                    <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest report-text-muted">Omschrijving</th>
                    <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right report-text-muted internal-only">Kostprijs</th>
                    <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right report-text-muted">Bedrag (Ex. BTW)</th>
                    <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right report-text-muted internal-only">Marge (€)</th>
                    <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right report-text-muted internal-only">Marge (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 report-divide">
                  <tr>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-white uppercase tracking-widest report-text-dark">Materiaalkosten</div>
                      <div className="text-[8px] text-slate-500 uppercase font-bold report-text-muted">Hout, Plaat, Beslag & Afwerking</div>
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] text-slate-400 font-bold report-text-muted internal-only">{formatCurrency(totals.materialsCostTotal)}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-white font-black report-text-dark">{formatCurrency(totals.materialsSalesTotal)}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-emerald-500 font-bold report-text-success internal-only">{formatCurrency(totals.materialsSalesTotal - totals.materialsCostTotal)}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-emerald-400 font-black report-text-success internal-only">
                      {totals.materialsSalesTotal > 0 ? formatNumber(((totals.materialsSalesTotal - totals.materialsCostTotal) / totals.materialsSalesTotal) * 100) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-white uppercase tracking-widest report-text-dark">Arbeid & Uren</div>
                      <div className="text-[8px] text-slate-500 uppercase font-bold report-text-muted">Productie, Montage & Voorbereiding</div>
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] text-slate-400 font-bold report-text-muted internal-only">{formatCurrency(0)}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-white font-black report-text-dark">{formatCurrency(totals.laborSalesTotal)}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-emerald-500 font-bold report-text-success internal-only">{formatCurrency(totals.laborSalesTotal)}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-emerald-400 font-black report-text-success internal-only">
                      100,00%
                    </td>
                  </tr>
                  {totals.extrasSalesTotal > 0 && (
                    <tr>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest report-text-dark">Bijkomende Kosten</div>
                        <div className="text-[8px] text-slate-500 uppercase font-bold report-text-muted">Transport, Stelposten & Extras</div>
                      </td>
                      <td className="px-6 py-4 text-right text-[10px] text-slate-400 font-bold report-text-muted internal-only">{formatCurrency(totals.extrasCostTotal)}</td>
                      <td className="px-6 py-4 text-right text-[10px] text-white font-black report-text-dark">{formatCurrency(totals.extrasSalesTotal)}</td>
                      <td className="px-6 py-4 text-right text-[10px] text-emerald-500 font-bold report-text-success internal-only">{formatCurrency(totals.extrasSalesTotal - totals.extrasCostTotal)}</td>
                      <td className="px-6 py-4 text-right text-[10px] text-emerald-400 font-black report-text-success internal-only">
                        {totals.extrasSalesTotal > 0 ? formatNumber(((totals.extrasSalesTotal - totals.extrasCostTotal) / totals.extrasSalesTotal) * 100) : 0}%
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-800/50 report-bg-footer">
                  <tr className="font-black text-white report-text-dark border-t border-slate-700 report-border">
                    <td className="px-6 py-5 uppercase text-[10px] tracking-widest">Totaal Project (Netto)</td>
                    <td className="px-6 py-5 text-right text-[10px] text-slate-400 report-text-muted internal-only">{formatCurrency(totals.subtotalCost)}</td>
                    <td className="px-6 py-5 text-right text-base">{formatCurrency(totals.subtotalSales)}</td>
                    <td className="px-6 py-5 text-right text-emerald-400 report-text-success internal-only">{formatCurrency(totals.grossProfit)}</td>
                    <td className="px-6 py-5 text-right text-emerald-400 report-text-success internal-only">{formatNumber(totals.grossMarginPct)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Section 3: Project Notities */}
          {project.notes && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 py-1">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] report-text-dark">III. Project Notities & Details</h3>
              </div>
              <div className="bg-slate-900/50 rounded-[1.5rem] border border-slate-800 p-8 report-bg-light report-border">
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed whitespace-pre-wrap report-text-dark">
                  {project.notes}
                </p>
              </div>
            </section>
          )}

          {/* Section 4: Fiscale Specificatie */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 py-1">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] report-text-dark">IV. Specificatie Eindbedrag</h3>
            </div>

            <div className="bg-slate-900/50 rounded-[1.5rem] border border-slate-800 p-6 report-bg-light report-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800 report-border-muted">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest report-text-muted">Subtotaal (Ex. BTW)</span>
                    <span className="text-sm font-black text-white report-text-dark">{formatCurrency(totals.subtotalSales)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800 report-border-muted">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest report-text-muted">BTW Bedrag ({project.vatRate}%)</span>
                    <span className="text-sm font-black text-slate-400 report-text-dark">{formatCurrency(totals.vatAmount)}</span>
                  </div>
                </div>
                
                <div className="bg-blue-600 px-8 py-6 rounded-[1.5rem] shadow-xl text-center md:text-right min-w-[240px] report-bg-main shadow-blue-900/20">
                  <div className="text-[8px] font-black text-blue-100 uppercase tracking-[0.3em] mb-1">Totaalbedrag (Inclusief BTW)</div>
                  <div className="text-3xl font-black text-white leading-none">{formatCurrency(totals.totalIncVat)}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer only Terms Notice */}
          <div className="customer-only hidden p-8 border-t border-slate-800 report-border">
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 report-text-dark">Aanvullende Voorwaarden</h5>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed report-text-muted whitespace-pre-wrap">
              {settings.termsNotice}
            </p>
          </div>

          {/* Footer for Report */}
          <div className="pt-8 border-t border-slate-800 flex justify-between items-end report-border">
            <div className="space-y-2">
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] report-text-muted">
                {settings.companyName} - <span className="customer-hide">MANAGEMENT REPORT</span><span className="customer-only hidden">{settings.footerText}</span>
              </div>
              <div className="text-[8px] font-bold text-slate-500 report-text-muted uppercase tracking-widest">
                 KvK: {settings.companyKvK} | BTW: {settings.companyVat} | IBAN: {settings.companyIban}
              </div>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] report-text-muted">CALCCRAFT PRO SYSTEMS</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .pdf-mode {
            background-color: white !important;
            color: #0f172a !important;
            padding: 40px !important;
            max-width: 794px !important;
            margin: 0 auto !important;
            border: none !important;
          }
          .pdf-mode .report-text-dark { color: #0f172a !important; }
          .pdf-mode .report-text-muted { color: #64748b !important; }
          .pdf-mode .report-text-success { color: #059669 !important; }
          .pdf-mode .report-text-danger { color: #dc2626 !important; }
          .pdf-mode .report-bg-light { background-color: #f8fafc !important; }
          .pdf-mode .report-bg-header { background-color: #f1f5f9 !important; }
          .pdf-mode .report-bg-footer { background-color: #e2e8f0 !important; }
          .pdf-mode .report-bg-highlight { background-color: #f8fafc !important; }
          .pdf-mode .report-bg-main { background-color: #1e40af !important; }
          .pdf-mode .report-border { border-color: #e2e8f0 !important; }
          .pdf-mode .report-border-muted { border-color: #f1f5f9 !important; }
          .pdf-mode .report-border-dark { border-color: #0f172a !important; }
          .pdf-mode .report-divide > * { border-color: #f1f5f9 !important; }
          
          .pdf-mode.customer-mode .internal-only {
            display: none !important;
          }
          .pdf-mode.customer-mode .customer-hide {
            display: none !important;
          }
          .pdf-mode.customer-mode .customer-only {
            display: block !important;
          }
        }

        #report-container.pdf-mode {
          width: 794px;
          min-height: 1120px;
          padding: 40px;
          margin: 0 auto;
        }
      `}} />
    </div>
  );
};

export default OverviewTab;
