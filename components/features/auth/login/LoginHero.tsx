import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col w-full h-full text-white overflow-hidden p-8 sm:p-10 lg:p-12 xl:p-16 2xl:p-24">
      {/* Grid Industrial de Fundo */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: 'clamp(20px, 4vw, 50px) clamp(20px, 4vw, 50px)' 
        }}
      />

      {/* Header: Logo */}
      <div className="relative z-10 shrink-0 animate-in fade-in slide-in-from-left-8 duration-1000">
        <img 
          src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
          alt="Aços Vital" 
          className="h-7 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-16 object-contain filter brightness-0 invert drop-shadow-xl" 
        />
      </div>

      {/* Main Content: Centralizado naturalmente */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1.5px] sm:h-[2px] w-6 sm:w-10 bg-[#b23c0e] rounded-full shadow-[0_0_10px_rgba(178,60,14,0.3)]"></div>
              <span className="text-[#b23c0e] text-[7.5px] sm:text-[8.5px] md:text-[9.5px] xl:text-[11.5px] font-black uppercase tracking-[3px] sm:tracking-[5px]">
                {t('login.subtitle')}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-6xl font-black leading-[1.1] sm:leading-[0.95] tracking-tighter uppercase">
              ESTRUTURAS<br/>
              <span className="text-slate-400">DE CONFIANÇA.</span><br/>
              <span className="text-white/25">DADOS DE PRECISÃO.</span>
            </h1>
          </div>
          
          <p className="text-[11px] sm:text-xs md:text-sm lg:text-sm xl:text-base 2xl:text-lg text-slate-300 font-medium leading-relaxed max-w-xs sm:max-w-md md:max-w-lg xl:max-w-xl">
            {t('login.heroSubtitle')}
          </p>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
             <StatusTag icon={CheckCircle2} label={t('login.certification')} />
             <StatusTag icon={ShieldCheck} label={t('login.secureData')} />
             <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl transition-all hover:bg-white/10 group cursor-default">
                <Cpu size={12} className="text-blue-500 group-hover:rotate-180 transition-transform duration-700 sm:w-3.5 sm:h-3.5" />
                <span className="text-[6.5px] sm:text-[7.5px] xl:text-[9.5px] font-black uppercase tracking-[1.5px] sm:tracking-[2px]">Real-Time Data</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Industrial */}
      <div className="relative z-10 shrink-0 mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-6 text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-[2px] sm:tracking-[3px]">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
            </div>
            <span>{t('login.monitoring')}</span>
          </div>

          <div className="flex items-center ml-auto">
            <button className="text-slate-400 hover:text-white transition-all whitespace-nowrap">
              POLÍTICA DE DADOS
            </button>
          </div>
      </div>
      
      {/* Background Layer */}
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
  <div className="flex items-center gap-2 text-[6.5px] sm:text-[7.5px] md:text-[8.5px] xl:text-[10.5px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-white bg-white/5 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-white/10 shadow-lg hover:border-[#b23c0e]/40 transition-colors">
    <Icon size={12} className="text-blue-500 sm:w-3.5 sm:h-3.5" /> 
    {label}
  </div>
);