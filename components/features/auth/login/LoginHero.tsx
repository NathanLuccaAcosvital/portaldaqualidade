import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col justify-between w-full h-full text-white overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 2xl:p-24">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: 'clamp(20px, 4vw, 50px) clamp(20px, 4vw, 50px)' 
        }}
      />

      <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
        <img 
          src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
          alt="Aços Vital" 
          className="h-7 sm:h-9 md:h-10 lg:h-12 xl:h-14 2xl:h-24 object-contain filter brightness-0 invert drop-shadow-xl" 
        />
      </div>

      <div className="relative z-10 my-4 lg:my-0 space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-[1.5px] sm:h-[2px] w-6 sm:w-10 bg-[#b23c0e] rounded-full shadow-[0_0_10px_rgba(178,60,14,0.3)]"></div>
            <span className="text-[#b23c0e] text-[8px] sm:text-[9px] md:text-[10px] xl:text-[12px] font-black uppercase tracking-[3px] sm:tracking-[6px]">
              {t('login.subtitle')}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-7xl font-black leading-[1.1] sm:leading-[0.95] tracking-tighter uppercase">
            ESTRUTURAS<br/>
            <span className="text-slate-400">DE CONFIANÇA.</span><br/>
            <span className="text-white/25">DADOS DE PRECISÃO.</span>
          </h1>
        </div>
        
        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl text-slate-300 font-medium leading-relaxed max-w-xs sm:max-w-md md:max-w-lg xl:max-w-xl">
          Convergência entre metalurgia avançada e governança digital de alta performance para a indústria moderna.
        </p>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
           <StatusTag icon={CheckCircle2} label={t('login.certification')} />
           <StatusTag icon={ShieldCheck} label={t('login.secureData')} />
           <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl transition-all hover:bg-white/10 group cursor-default">
              <Cpu size={14} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700 sm:w-4 sm:h-4" />
              <span className="text-[7px] sm:text-[8px] xl:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px]">Real-Time Data</span>
           </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-12 border-t border-white/10 pt-8 text-[8px] sm:text-[9px] md:text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[15px] font-black uppercase tracking-[2px] sm:tracking-[4px]">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
            </div>
            <span>{t('login.monitoring')}</span>
          </div>

          <div className="flex items-center gap-8 sm:gap-12 ml-auto">
            <button className="text-slate-400 hover:text-white transition-all whitespace-nowrap">
              POLÍTICA DE DADOS
            </button>
            <span className="text-white font-black drop-shadow-sm whitespace-nowrap">
              © 2026 AÇOS VITAL S.A.
            </span>
          </div>
      </div>
      
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img 
          src={BACKGROUND_URL}
          alt=""
          className="w-full h-full object-cover opacity-50 mix-blend-overlay animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#081437] via-[#081437]/95 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
      </div>
    </div>
  );
};

const StatusTag = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-2 text-[7px] sm:text-[8px] md:text-[9px] xl:text-[11px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-white bg-white/5 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-white/10 shadow-lg hover:border-[#b23c0e]/40 transition-colors">
    <Icon size={14} className="text-blue-500 sm:w-4 sm:h-4" /> 
    {label}
  </div>
);