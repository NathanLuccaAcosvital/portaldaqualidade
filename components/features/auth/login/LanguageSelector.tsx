
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'pt', label: 'PT', name: 'Português' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-300 p-1 rounded-xl shadow-lg flex items-center gap-1">
      <div className="px-2 text-slate-500">
        <Globe size={13} aria-hidden="true" />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          aria-label={t('common.language.' + lang.code, lang.name)}
          className={`px-3 py-1.5 text-[10px] xl:text-[10px] font-black uppercase rounded-lg transition-all duration-300 ${
            i18n.language.startsWith(lang.code) 
              ? 'bg-[#081437] text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#081437]'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
