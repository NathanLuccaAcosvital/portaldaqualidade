
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 xl:p-14 2xl:p-24 w-full h-full text-white">
      <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
        <img src={LOGO_URL} alt="Aços Vital" className="h-8 lg:h-10 xl:h-11 2xl:h-20 object-contain" />
      </div>

      <div className="space-y-4 lg:space-y-6 xl:space-y-7 2xl:space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="space-y-3 lg:space-y-4 xl:space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-8 lg:w-12 bg-[#FF5722]"></div>
            <span className="text-[#FF5722] text-[9px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-[4px] lg:tracking-[6px]">
              {t('login.subtitle')}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-7xl font-bold leading-[1.1] tracking-tighter max-w-xl 2xl:max-w-2xl">
            {t('login.slogan').split(',')[0]},<br/>
            <span className="text-[#93C5FD] block mt-1 xl:mt-2 whitespace-nowrap">
              {t('login.slogan').split(',')[1]}
            </span>
          </h1>
        </div>
        
        <p className="text-sm lg:text-base xl:text-base 2xl:text-2xl text-slate-100 font-medium leading-relaxed max-w-xl 2xl:max-w-2xl">
          Repositório central de documentos técnicos 
          <br className="hidden xl:block 2xl:hidden" /> 
          e certificados. Precisão industrial em cada dado.
        </p>
        
        <div className="flex flex-wrap gap-2 lg:gap-3 pt-2">
           <div className="flex items-center gap-2 xl:gap-3 text-[8px] lg:text-[9px] xl:text-[9px] 2xl:text-[11px] font-black uppercase tracking-[1px] lg:tracking-[2px] text-white bg-white/10 backdrop-blur-md px-3 py-2.5 lg:px-5 lg:py-3.5 xl:px-5 xl:py-3 rounded-xl border border-white/20 shadow-xl transition-transform hover:scale-105">
              <CheckCircle2 size={12} className="text-[#FF5722] lg:size-4" aria-hidden="true" /> {t('login.certification')}
           </div>
           <div className="flex items-center gap-2 xl:gap-3 text-[8px] lg:text-[9px] xl:text-[9px] 2xl:text-[11px] font-black uppercase tracking-[1px] lg:tracking-[2px] text-white bg-white/10 backdrop-blur-md px-3 py-2.5 lg:px-5 lg:py-3.5 xl:px-5 xl:py-3 rounded-xl border border-white/20 shadow-xl transition-transform hover:scale-105">
              <ShieldCheck size={12} className="text-[#FF5722] lg:size-4" aria-hidden="true" /> {t('login.secureData')}
           </div>
        </div>
      </div>

      <div className="text-[9px] lg:text-[10px] xl:text-[10px] 2xl:text-[14px] text-slate-200 font-black flex items-center justify-start gap-8 lg:gap-12 uppercase tracking-[3px] lg:tracking-[5px] 2xl:tracking-[8px]">
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"></span>
            <span>{t('login.monitoring')}</span>
          </div>
          <button onClick={() => {}} className="hover:text-white transition-colors uppercase">
            {t('common.privacy')}
          </button>
      </div>
      
      {/* Background Decor: Optimizado para LCP usando <img> em vez de CSS background */}
      <img 
        src={BACKGROUND_URL}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-10 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-110 animate-slow-zoom pointer-events-none"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#081437] via-[#081437]/90 to-transparent" />
    </div>
  );
};