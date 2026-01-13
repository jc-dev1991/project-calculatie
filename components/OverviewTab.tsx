
import React from 'react';
import { Project } from '../types';
import { calculateProjectTotals, formatCurrency, formatNumber } from '../utils/calculations';
import { useProjectStore } from '../store/useProjectStore';

interface OverviewTabProps {
  project: Project;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  const { settings } = useProjectStore();
  const totals = calculateProjectTotals(project);

  const getOfferNumber = (p: Project) => {
    const year = new Date(p.createdAt).getFullYear();
    const index = p.documentNumber.toString().padStart(3, '0');
    return `${year}-${index}`;
  };

  const handleExportPdf = (mode: 'customer' | 'internal' | 'invoice') => {
    const element = document.getElementById('report-container');
    if (!element) return;
    
    const docNum = getOfferNumber(project);
    let filename = '';
    
    if (mode === 'invoice') {
      filename = `Factuur_${docNum}_${project.title.replace(/\s+/g, '_')}.pdf`;
    } else if (mode === 'customer') {
      filename = `Offerte_${docNum}_${project.title.replace(/\s+/g, '_')}.pdf`;
    } else {
      filename = `Intern_Rapport_${docNum}_${project.title.replace(/\s+/g, '_')}.pdf`;
    }

    // Reset classes
    element.classList.remove('customer-mode', 'invoice-mode');

    // Activeer export-modus voor CSS
    document.body.classList.add('pdf-render-active');
    
    if (mode === 'customer') {
      element.classList.add('customer-mode');
    } else if (mode === 'invoice') {
      element.classList.add('invoice-mode');
    }
    
    const opt = {
      margin: [10, 10, 10, 10], // Marges in mm
      filename: filename,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 4, // Hoge resolutie
        useCORS: true, 
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-summary-container', '.pdf-notes-box'] }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
      document.body.classList.remove('pdf-render-active');
      // Cleanup classes after render (optional, but keeps UI clean if we were to show the container)
      element.classList.remove('customer-mode', 'invoice-mode');
    });
  };

  const categories = [
    { name: 'Materialen & Beslag', cost: totals.materialsCostTotal, sales: totals.materialsSalesTotal, desc: 'Hout, plaat, beslag en afwerking' },
    { name: 'Vakmanschap & Uren', cost: totals.laborCostTotal, sales: totals.laborSalesTotal, desc: 'Productie, montage en werkvoorbereiding' },
    ...(totals.extrasSalesTotal > 0 ? [{ name: 'Onkosten & Services', cost: totals.extrasCostTotal, sales: totals.extrasSalesTotal, desc: 'Overige projectkosten' }] : []),
  ];

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      
      {/* Browser UI Dashboards - Enkel zichtbaar in de app */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Omzet</p>
          <div className="text-3xl font-black text-white">{formatCurrency(totals.subtotalSales)}</div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl ring-1 ring-emerald-500/20">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Bruto Winst</p>
          <div className="text-3xl font-black text-emerald-400">{formatCurrency(totals.grossProfit)}</div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Marge %</p>
          <div className="text-3xl font-black text-white">{formatNumber(totals.grossMarginPct)}%</div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">BTW ({project.vatRate}%)</p>
          <div className="text-3xl font-black text-slate-400">{formatCurrency(totals.vatAmount)}</div>
        </div>
      </div>

      {/* PDF Export Hub - Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-center print:hidden bg-blue-600/10 p-6 rounded-[2rem] border border-blue-500/20 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">PDF</div>
          <div>
            <span className="text-sm font-black text-white uppercase tracking-widest block">Document Genereren</span>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Kies gewenste weergave voor de PDF</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => handleExportPdf('customer')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] transition-all shadow-lg">Klant Offerte</button>
          <button onClick={() => handleExportPdf('internal')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-[10px] transition-all shadow-lg">Intern Rapport</button>
          <button onClick={() => handleExportPdf('invoice')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black uppercase text-[10px] transition-all shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Factuur
          </button>
        </div>
      </div>

      {/* DIT IS DE CONTAINER DIE WORDT GEËXPORTEERD - GEOPTIMALISEERD VOOR A4 */}
      <div id="report-container" className="pdf-export-container bg-white text-black mx-auto">
        <div className="pdf-wrapper">
          
          {/* Header met Bedrijfsnaam en Badge */}
          <div className="pdf-header-row">
            <div className="pdf-header-left">
              <h1 className="pdf-brand">{settings.companyName}</h1>
              <div className="pdf-brand-sub">
                {settings.companyStreet} {settings.companyHouseNumber}<br/>
                {settings.companyZipCode} {settings.companyCity}<br/>
                {settings.companyPhone} • {settings.companyEmail}
              </div>
            </div>
            <div className="pdf-header-right">
              <div className="pdf-badge-box">
                <div className="pdf-badge-header-text">
                  <span className="invoice-hide customer-hide">INTERN CALCULATIE DOSSIER</span>
                  <span className="invoice-hide customer-only">{settings.headerTitle}</span>
                  <span className="invoice-only">FACTUUR</span>
                </div>
                <div className="pdf-badge-data">
                  <div className="pdf-data-row"><span>NUMMER:</span> <span className="pdf-strong">{getOfferNumber(project)}</span></div>
                  <div className="pdf-data-row"><span>DATUM:</span> <span className="pdf-strong">{new Date().toLocaleDateString('nl-NL')}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Adressering / Betreft */}
          <div className="pdf-client-section">
            <div className="pdf-salutation">{settings.salutation},</div>
            <div className="pdf-client-name">{project.clientName || 'RELATIE'}</div>
            <div className="pdf-subject">BETREFT: {project.title}</div>
          </div>

          {/* 1. CALCULATIE TABEL (Standaard weergave) */}
          <div className="pdf-table-container invoice-hide">
            <div className="pdf-table-title">CALCULATIE OVERZICHT</div>
            <table className="pdf-a4-table">
              <thead>
                <tr>
                  <th style={{ width: '50%', textAlign: 'left' }}>OMSCHRIJVING</th>
                  <th className="internal-only" style={{ width: '15%', textAlign: 'right' }}>INKOOP</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>VERKOOP</th>
                  <th className="internal-only" style={{ width: '15%', textAlign: 'right' }}>MARGE %</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="pdf-item-title">{cat.name}</div>
                      <div className="pdf-item-desc">{cat.desc}</div>
                    </td>
                    <td className="internal-only pdf-text-right pdf-price-cell">{formatCurrency(cat.cost)}</td>
                    <td className="pdf-text-right pdf-price-cell pdf-strong">{formatCurrency(cat.sales)}</td>
                    <td className="internal-only pdf-text-right pdf-margin-cell">{formatNumber(((cat.sales - cat.cost) / (cat.sales || 1)) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="pdf-table-footer">
                <tr>
                  <td>TOTAAL NETTO PROJECT</td>
                  <td className="internal-only pdf-text-right pdf-price-cell">{formatCurrency(totals.subtotalCost)}</td>
                  <td className="pdf-text-right pdf-total-price-cell">{formatCurrency(totals.subtotalSales)}</td>
                  <td className="internal-only pdf-text-right pdf-margin-cell">{formatNumber(totals.grossMarginPct)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. FACTUUR TABEL (Enkel zichtbaar in invoice-mode) */}
          <div className="pdf-table-container invoice-only">
             <div className="pdf-table-title">FACTUUR SPECIFICATIE</div>
             <table className="pdf-a4-table">
              <thead>
                <tr>
                  <th style={{ width: '70%', textAlign: 'left' }}>OMSCHRIJVING</th>
                  <th style={{ width: '30%', textAlign: 'right' }}>TOTAAL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="pdf-item-title">{project.title}</div>
                    <div className="pdf-item-desc">Conform afspraak en specificatie.</div>
                  </td>
                  <td className="pdf-text-right pdf-total-price-cell">{formatCurrency(totals.subtotalSales)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notities / Bijzonderheden */}
          {project.notes && (
            <div className="pdf-notes-box">
              <div className="pdf-notes-title">BIJZONDERHEDEN</div>
              <div className="pdf-notes-text">{project.notes}</div>
            </div>
          )}

          {/* Financiële Afsluiting / Samenvatting */}
          <div className="pdf-summary-container">
            <div className="pdf-dark-summary">
              <div className="pdf-sum-row">
                <span>SUBTOTAAL EXCL. BTW</span>
                <span className="pdf-strong">{formatCurrency(totals.subtotalSales)}</span>
              </div>
              <div className="pdf-sum-row">
                <span>BTW BEDRAG ({project.vatRate}%)</span>
                <span className="pdf-strong">{formatCurrency(totals.vatAmount)}</span>
              </div>
              <div className="pdf-sum-total">
                <span>TOTAAL INCL. BTW</span>
                <span className="pdf-grand-total">{formatCurrency(totals.totalIncVat)}</span>
              </div>
            </div>
          </div>

          {/* Footer van het document */}
          <div className="pdf-footer-section">
            <div className="pdf-footer-left">
              <strong>{settings.companyName}</strong><br/>
              KVK: {settings.companyKvK} • BTW: {settings.companyVat} • IBAN: {settings.companyIban}
            </div>
            <div className="pdf-footer-right">
              {getOfferNumber(project)}
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* --- PDF EXPORT ENGINE CSS --- */
        .pdf-export-container {
          width: 210mm;
          min-height: 297mm;
          background: #ffffff !important;
          color: #000000 !important;
          padding: 20mm 30mm;
          font-family: 'Inter', Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          position: relative;
        }

        .pdf-render-active .pdf-export-container {
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          transform: scale(1);
        }

        .pdf-wrapper { width: 100%; display: flex; flex-direction: column; gap: 30px; }

        /* Header */
        .pdf-header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .pdf-brand { font-size: 32px; font-weight: 900; color: #000000 !important; margin: 0; text-transform: uppercase; letter-spacing: -1px; }
        .pdf-brand-sub { font-size: 10px; font-weight: 700; color: #333333 !important; margin-top: 5px; line-height: 1.4; text-transform: uppercase; }
        
        .pdf-badge-box { background: #f8fafc !important; border: 1.5px solid #000000; border-radius: 10px; padding: 15px; min-width: 200px; }
        .pdf-badge-header-text { font-size: 11px; font-weight: 900; color: #000000 !important; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; text-transform: uppercase; }
        .pdf-badge-data { font-size: 10px; color: #000000 !important; }
        .pdf-data-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-weight: 700; }
        .pdf-strong { font-weight: 900 !important; color: #000000 !important; }

        /* Client */
        .pdf-client-section { margin-top: 10px; }
        .pdf-salutation { font-size: 12px; font-weight: 800; color: #2563eb !important; text-transform: uppercase; margin-bottom: 4px; }
        .pdf-client-name { font-size: 26px; font-weight: 900; color: #000000 !important; text-transform: uppercase; letter-spacing: -0.5px; }
        .pdf-subject { font-size: 12px; font-weight: 800; color: #444444 !important; margin-top: 4px; text-transform: uppercase; }

        /* Table */
        .pdf-table-title { font-size: 10px; font-weight: 900; background: #000000 !important; color: #ffffff !important; padding: 6px 12px; display: inline-block; margin-bottom: 10px; letter-spacing: 1px; }
        .pdf-a4-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .pdf-a4-table th { border-bottom: 2px solid #000; padding: 10px 12px; font-size: 10px; font-weight: 900; color: #000000 !important; }
        .pdf-a4-table td { padding: 14px 12px; border-bottom: 1px solid #eeeeee; vertical-align: top; color: #000000 !important; }
        
        .pdf-item-title { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #000000 !important; }
        .pdf-item-desc { font-size: 9px; color: #555555 !important; font-weight: 600; margin-top: 2px; }
        .pdf-price-cell { font-size: 13px; font-weight: 700; color: #000000 !important; }
        .pdf-total-price-cell { font-size: 16px; font-weight: 900; color: #000000 !important; }
        .pdf-margin-cell { font-size: 12px; font-weight: 800; color: #059669 !important; }
        .pdf-text-right { text-align: right; }

        .pdf-table-footer td { background: #fafafa !important; border-top: 2px solid #000; padding: 20px 12px; font-weight: 900; font-size: 11px; color: #000000 !important; }

        /* Notes */
        .pdf-notes-box { background: #fffbeb !important; border: 1px solid #fde68a; padding: 20px; border-radius: 12px; margin-top: 10px; page-break-inside: avoid; break-inside: avoid; }
        .pdf-notes-title { font-size: 10px; font-weight: 900; color: #92400e !important; margin-bottom: 8px; letter-spacing: 1px; border-left: 3px solid #b45309; padding-left: 8px; }
        .pdf-notes-text { font-size: 11px; line-height: 1.5; color: #78350f !important; font-weight: 600; white-space: pre-wrap; }

        /* Summary */
        .pdf-summary-container { display: flex; justify-content: flex-end; margin-top: 20px; page-break-inside: avoid; break-inside: avoid; }
        .pdf-dark-summary { background: #0f172a !important; color: #ffffff !important; padding: 30px; border-radius: 20px; width: 320px; display: flex; flex-direction: column; gap: 10px; }
        .pdf-sum-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #cbd5e1 !important; }
        .pdf-sum-row .pdf-strong { color: #ffffff !important; }
        .pdf-sum-total { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #334155; padding-top: 12px; margin-top: 5px; }
        .pdf-grand-total { font-size: 22px; font-weight: 900; color: #60a5fa !important; }

        /* Footer */
        .pdf-footer-section { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #000000; padding-top: 15px; margin-top: 40px; }
        .pdf-footer-left { font-size: 8px; font-weight: 800; color: #000000 !important; line-height: 1.5; text-transform: uppercase; }
        .pdf-footer-right { font-size: 8px; font-weight: 900; color: #cccccc !important; letter-spacing: 2px; }

        /* MODES */
        .customer-mode .internal-only { display: none !important; }
        .customer-only { display: none; }
        .customer-mode .customer-only { display: block; }
        .customer-mode .customer-hide { display: none; }

        .invoice-only { display: none; }
        .invoice-mode .invoice-only { display: block; }
        .invoice-mode .invoice-hide { display: none; }
      `}} />
    </div>
  );
};

export default OverviewTab;
