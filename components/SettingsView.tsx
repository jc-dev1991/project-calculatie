
import React, { useState } from 'react';
import { OfferSettings } from '../types';
import { useT } from '../utils/translations';

interface SettingsViewProps {
  settings: OfferSettings;
  onSave: (settings: OfferSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const t = useT(settings.language);
  const [localSettings, setLocalSettings] = useState<OfferSettings>(settings);
  const [isCustomSalutation, setIsCustomSalutation] = useState(!['Geachte', 'Beste', 'T.a.v.'].includes(settings.salutation));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    alert(settings.language === 'nl' ? 'Instellingen succesvol opgeslagen!' : 'Settings successfully saved!');
  };

  const salutationOptions = ['Geachte', 'Beste', 'T.a.v.'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tight">{t('settings')}</h2>
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Beheer uw bedrijfsgegevens en offerte layout</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Systeemvoorkeuren */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
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
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tarieven Sectie */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
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
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
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
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
                />
              </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">
            Deze tarieven worden automatisch ingevuld wanneer u kiest voor "Vast Verkooptarief" in de uren-tab.
          </p>
        </div>

        {/* Bedrijfsgegevens */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
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
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
            
            {/* Adres Grid - Gesplitst */}
            <div className="grid grid-cols-4 gap-4 md:col-span-2">
              <div className="col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Straat</label>
                <input 
                  type="text" 
                  value={localSettings.companyStreet}
                  onChange={e => setLocalSettings({...localSettings, companyStreet: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
                  placeholder="Straatnaam"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Nr</label>
                <input 
                  type="text" 
                  value={localSettings.companyHouseNumber}
                  onChange={e => setLocalSettings({...localSettings, companyHouseNumber: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
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
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
                  placeholder="1234 AB"
                />
              </div>
              <div className="col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Plaats</label>
                <input 
                  type="text" 
                  value={localSettings.companyCity}
                  onChange={e => setLocalSettings({...localSettings, companyCity: e.target.value})}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
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
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('email')}</label>
              <input 
                type="email" 
                value={localSettings.companyEmail}
                onChange={e => setLocalSettings({...localSettings, companyEmail: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('kvk')}</label>
              <input 
                type="text" 
                value={localSettings.companyKvK}
                onChange={e => setLocalSettings({...localSettings, companyKvK: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('vatNumber')}</label>
              <input 
                type="text" 
                value={localSettings.companyVat}
                onChange={e => setLocalSettings({...localSettings, companyVat: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('iban')}</label>
              <input 
                type="text" 
                value={localSettings.companyIban}
                onChange={e => setLocalSettings({...localSettings, companyIban: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Offerte Layout */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
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
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
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
                    } else {
                      setIsCustomSalutation(false);
                      setLocalSettings({...localSettings, salutation: e.target.value});
                    }
                  }}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
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
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('footerText')}</label>
              <textarea 
                value={localSettings.footerText}
                onChange={e => setLocalSettings({...localSettings, footerText: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold h-32 resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('terms')}</label>
              <textarea 
                value={localSettings.termsNotice}
                onChange={e => setLocalSettings({...localSettings, termsNotice: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold h-32 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-blue-900/40 transition-all active:scale-95"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
