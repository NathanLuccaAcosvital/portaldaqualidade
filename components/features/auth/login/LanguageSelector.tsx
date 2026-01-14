
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 p-1 rounded-xl shadow-md flex items-center gap-1">
      <div className="px-2 text-slate-400">
        <Globe size={14} />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 text-[10px] xl:text-[11px] font-black uppercase rounded-lg transition-all duration-300 ${
            i18n.language.startsWith(lang.code) 
              ? 'bg-[#081437] text-white shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
