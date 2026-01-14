
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 xl:p-16 2xl:p-24 w-full h-full text-white">
      <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
        <img src={LOGO_URL} alt="Aços Vital" className="h-8 lg:h-10 xl:h-12 2xl:h-20 object-contain" />
      </div>

      <div className="space-y-4 lg:space-y-6 xl:space-y-8 2xl:space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="space-y-3 lg:space-y-4 xl:space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-[1.5px] w-8 lg:w-12 bg-[#B23C0E]"></div>
            <span className="text-[#B23C0E] text-[9px] lg:text-[10px] xl:text-xs font-bold uppercase tracking-[4px] lg:tracking-[6px]">
              {t('login.subtitle')}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-7xl font-bold leading-[1.1] tracking-tighter max-w-xl">
            {t('login.slogan').split(',')[0]},<br/>
            <span className="text-[#62A5FA] block mt-1 xl:mt-2">{t('login.slogan').split(',')[1]}</span>
          </h1>
        </div>
        
        <p className="text-xs lg:text-sm xl:text-base 2xl:text-xl text-slate-300 font-medium leading-relaxed max-w-lg opacity-90">
          {t('login.heroSubtitle')}
        </p>
        
        <div className="flex flex-wrap gap-2 lg:gap-3 pt-2">
           <div className="flex items-center gap-2 xl:gap-3 text-[8px] lg:text-[9px] xl:text-[10px] font-bold uppercase tracking-[1px] lg:tracking-[2px] text-white bg-white/5 backdrop-blur-md px-3 py-2.5 lg:px-5 lg:py-3.5 xl:px-6 xl:py-4 rounded-xl border border-white/10 shadow-xl transition-transform hover:scale-105">
              <CheckCircle2 size={12} className="text-[#B23C0E] lg:size-4" /> {t('login.certification')}
           </div>
           <div className="flex items-center gap-2 xl:gap-3 text-[8px] lg:text-[9px] xl:text-[10px] font-bold uppercase tracking-[1px] lg:tracking-[2px] text-white bg-white/5 backdrop-blur-md px-3 py-2.5 lg:px-5 lg:py-3.5 xl:px-6 xl:py-4 rounded-xl border border-white/10 shadow-xl transition-transform hover:scale-105">
              <ShieldCheck size={12} className="text-[#B23C0E] lg:size-4" /> {t('login.secureData')}
           </div>
        </div>
      </div>

      <div className="text-[9px] lg:text-[10px] 2xl:text-[12px] text-slate-400 font-black flex items-center justify-start gap-8 lg:gap-12 uppercase tracking-[3px] lg:tracking-[5px] 2xl:tracking-[8px]">
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            <span>{t('login.monitoring')}</span>
          </div>
          <div className="hover:text-white cursor-pointer transition-colors">
            {t('common.privacy')}
          </div>
      </div>
      
      {/* Background Decor */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-40 mix-blend-luminosity scale-110 animate-slow-zoom" 
        style={{ backgroundImage: `url("${BACKGROUND_URL}")` }} 
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#081437] via-[#081437]/85 to-transparent" />
    </div>
  );
};
