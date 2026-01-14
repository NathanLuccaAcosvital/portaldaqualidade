
import React, { useState, useEffect, useCallback } from 'react';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Hook customizado para gerenciar o consentimento da LGPD.
 * (S) Responsabilidade única: Persistência e estado do consentimento.
 */
const useCookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptConsent = useCallback(() => {
    localStorage.setItem('lgpd_consent', 'true');
    localStorage.setItem('lgpd_consent_date', new Date().toISOString());
    setIsVisible(false);
  }, []);

  const closeBanner = useCallback(() => setIsVisible(false), []);

  return { isVisible, acceptConsent, closeBanner };
};

export const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isVisible, acceptConsent, closeBanner } = useCookieConsent();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6 flex justify-center animate-in slide-in-from-bottom-10 duration-500"
      role="complementary"
      aria-labelledby="cookie-title"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-700/50">
        
        <div className="bg-slate-800 p-3 rounded-xl shrink-0 hidden md:block">
            <Cookie className="text-blue-400" size={32} />
        </div>

        <div className="flex-1">
            <h4 id="cookie-title" className="text-lg font-bold mb-2 flex items-center gap-2">
                <Cookie className="text-blue-400 md:hidden" size={20} />
                {t('cookie.title')}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
                {t('cookie.text')}
            </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button 
                onClick={acceptConsent}
                className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 whitespace-nowrap active:scale-95"
            >
                {t('cookie.accept')}
            </button>
            <button 
                onClick={closeBanner}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors md:hidden"
                aria-label={t('common.close')}
            >
                <X size={20} />
            </button>
        </div>

      </div>
    </div>
  );
};
