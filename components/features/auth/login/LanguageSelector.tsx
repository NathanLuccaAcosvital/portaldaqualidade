
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
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];

  return (
    <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-200">
      <div className="px-3 text-slate-400">
        <Globe size={14} />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all duration-300 ${
            i18n.language.startsWith(lang.code) 
              ? 'bg-[#081437] text-white shadow-lg scale-105' 
              : 'text-slate-500 hover:text-[#081437] hover:bg-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
