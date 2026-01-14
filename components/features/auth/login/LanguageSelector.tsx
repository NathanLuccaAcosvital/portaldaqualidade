
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
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/50 p-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
      <div className="px-2 text-slate-400">
        <Globe size={10} />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all duration-300 ${
            i18n.language.startsWith(lang.code) 
              ? 'bg-[#081437] text-white' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
