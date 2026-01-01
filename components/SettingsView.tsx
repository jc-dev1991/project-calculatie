
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
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('language')}</label>
              <select 
                value={localSettings.language}
                onChange={e => setLocalSettings({...localSettings, language: e.target.value as 'nl' | 'en'})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('targetMargin')}</label>
              <input 
                type="number" 
                value={localSettings.targetMarginPct}
                onChange={e => setLocalSettings({...localSettings, targetMarginPct: Number(e.target.value)})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
          </div>
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
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">{t('address')}</label>
              <input 
                type="text" 
                value={localSettings.companyAddress}
                onChange={e => setLocalSettings({...localSettings, companyAddress: e.target.value})}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold"
              />
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
