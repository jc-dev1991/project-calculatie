import React, { useState, useEffect } from 'react';
import { OfferSettings } from '../types';
import { useT, Language } from '../utils/translations';

interface SettingsViewProps {
  settings: OfferSettings;
  onSave: (settings: OfferSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  // Zorg dat we altijd een geldige taal hebben voor de vertaalfunctie
  const currentLang = (['nl', 'en'].includes(settings.language) ? settings.language : 'nl') as Language;
  const t = useT(currentLang);

  const [localSettings, setLocalSettings] = useState<OfferSettings>(settings);
  const [isCustomSalutation, setIsCustomSalutation] = useState(!['Geachte', 'Beste', 'T.a.v.'].includes(settings.salutation));
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync state als props veranderen (bijv. na harde refresh)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    
    // Visuele feedback knop
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const salutationOptions = ['Geachte', 'Beste', 'T.a.v.'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-fadeIn pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase">{t('settings')}</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Beheer uw bedrijfsgegevens en offerte layout</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. Systeemvoorkeuren & Taal */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">{t('systemPrefs')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('targetMargin')}</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={localSettings.targetMarginPct}
                  onChange={e => setLocalSettings({...localSettings, targetMarginPct: Number(e.target.value)})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-500">%</span>
              </div>
            </div>

            {/* NIEUW: Taalselector */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Systeemtaal / Language</label>
              <select 
                value={localSettings.language}
                onChange={e => setLocalSettings({...localSettings, language: e.target.value as 'nl' | 'en'})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer transition-all"
              >
                <option value="nl">🇳🇱 Nederlands</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Tarieven Sectie */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Standaard Tarieven (Verkoop)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Productie Tarief (€/u)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-500">€</span>
                <input 
                  type="number" 
                  value={localSettings.standardProductionSellRate}
                  onChange={e => setLocalSettings({...localSettings, standardProductionSellRate: Number(e.target.value)})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Montage Tarief (€/u)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-500">€</span>
                <input 
                  type="number" 
                  value={localSettings.standardAssemblySellRate}
                  onChange={e => setLocalSettings({...localSettings, standardAssemblySellRate: Number(e.target.value)})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                />
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">
            * Deze tarieven worden automatisch gebruikt als u "Vast Verkooptarief" aanvinkt in de uren-tab.
          </p>
        </div>

        {/* 3. Bedrijfsgegevens */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">{t('companyDetails')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('companyName')}</label>
              <input 
                type="text" 
                value={localSettings.companyName}
                onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})}
                placeholder="Uw Bedrijfsnaam B.V."
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
            
            {/* Adres Grid */}
            <div className="grid grid-cols-4 gap-4 md:col-span-2">
              <div className="col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Straat</label>
                <input 
                  type="text" 
                  value={localSettings.companyStreet}
                  onChange={e => setLocalSettings({...localSettings, companyStreet: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                  placeholder="Straatnaam"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Nr</label>
                <input 
                  type="text" 
                  value={localSettings.companyHouseNumber}
                  onChange={e => setLocalSettings({...localSettings, companyHouseNumber: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                  placeholder="12"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 md:col-span-2">
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Postcode</label>
                <input 
                  type="text" 
                  value={localSettings.companyZipCode}
                  onChange={e => setLocalSettings({...localSettings, companyZipCode: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                  placeholder="1234 AB"
                />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Plaats</label>
                <input 
                  type="text" 
                  value={localSettings.companyCity}
                  onChange={e => setLocalSettings({...localSettings, companyCity: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                  placeholder="Amsterdam"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('phone')}</label>
              <input 
                type="text" 
                value={localSettings.companyPhone}
                onChange={e => setLocalSettings({...localSettings, companyPhone: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('email')}</label>
              <input 
                type="email" 
                value={localSettings.companyEmail}
                onChange={e => setLocalSettings({...localSettings, companyEmail: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('kvk')}</label>
              <input 
                type="text" 
                value={localSettings.companyKvK}
                onChange={e => setLocalSettings({...localSettings, companyKvK: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('vatNumber')}</label>
              <input 
                type="text" 
                value={localSettings.companyVat}
                onChange={e => setLocalSettings({...localSettings, companyVat: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('iban')}</label>
              <input 
                type="text" 
                value={localSettings.companyIban}
                onChange={e => setLocalSettings({...localSettings, companyIban: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
          </div>
        </div>

        {/* 4. Offerte Layout */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-amber-500 rounded-full"></div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">{t('layout')}</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Koptekst Document (Offerte)</label>
              <input 
                type="text" 
                value={localSettings.headerTitle}
                onChange={e => setLocalSettings({...localSettings, headerTitle: e.target.value})}
                placeholder="Offerte / Prijsopgave"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('salutation')} (Prefix)</label>
                <select 
                  value={isCustomSalutation ? 'CUSTOM' : localSettings.salutation}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomSalutation(true);
                      setLocalSettings({...localSettings, salutation: ''}); // Reset bij custom
                    } else {
                      setIsCustomSalutation(false);
                      setLocalSettings({...localSettings, salutation: e.target.value});
                    }
                  }}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer transition-all"
                >
                  {salutationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  <option value="CUSTOM">Andere...</option>
                </select>
              </div>
              {isCustomSalutation && (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Custom {t('salutation')}</label>
                  <input 
                    type="text" 
                    value={localSettings.salutation}
                    onChange={e => setLocalSettings({...localSettings, salutation: e.target.value})}
                    placeholder="Bijv. Hoi, Aan, etc."
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold transition-all"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('footerText')}</label>
              <textarea 
                value={localSettings.footerText}
                onChange={e => setLocalSettings({...localSettings, footerText: e.target.value})}
                placeholder="Tekst onderaan elke pagina (bijv. kvk nummer klein)"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold h-32 resize-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('terms')}</label>
              <textarea 
                value={localSettings.termsNotice}
                onChange={e => setLocalSettings({...localSettings, termsNotice: e.target.value})}
                placeholder="Verwijzing naar algemene voorwaarden..."
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold h-32 resize-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className={`px-12 py-5 text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl transition-all active:scale-95 ${
              showSuccess 
                ? 'bg-emerald-500 shadow-emerald-900/40' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
            }`}
          >
            {showSuccess ? (localSettings.language === 'en' ? 'Saved!' : 'Opgeslagen!') : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;