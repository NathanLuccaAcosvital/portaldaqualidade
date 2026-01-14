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
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: 'clamp(20px, 4vw, 50px) clamp(20px, 4vw, 50px)' 
        }}
        aria-hidden="true"
      />

      {/* Header: Logo */}
      <div className="relative z-10 shrink-0 animate-in fade-in slide-in-from-left-8 duration-1000">
        <img 
          src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
          alt="Aços Vital - Logo Industrial" 
          className="h-10 sm:h-12 md:h-14 lg:h-16 xl:h-18 2xl:h-24 object-contain filter brightness-0 invert drop-shadow-2xl" 
        />
      </div>

      {/* Main Content: Distribuição Natural */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 sm:w-12 bg-[#d14b16] rounded-full shadow-[0_0_15px_rgba(209,75,22,0.4)]" aria-hidden="true"></div>
              <span className="text-[#ff6b2b] text-[10px] sm:text-[11px] md:text-[12px] xl:text-[13px] font-black uppercase tracking-[4px] sm:tracking-[6px]">
                {t('login.subtitle')}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-7xl font-black leading-[1.05] sm:leading-[0.95] tracking-tighter uppercase">
              ESTRUTURAS<br/>
              <span className="text-slate-300">DE CONFIANÇA.</span><br/>
              <span className="text-white/45">DADOS DE PRECISÃO.</span>
            </h1>
          </div>
          
          <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl text-slate-200 font-medium leading-relaxed max-w-xs sm:max-w-md md:max-w-lg xl:max-w-2xl">
            {t('login.heroSubtitle')}
          </p>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2" role="list">
             <StatusTag icon={CheckCircle2} label={t('login.certification')} />
             <StatusTag icon={ShieldCheck} label={t('login.secureData')} />
             <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl transition-all hover:bg-white/20 group cursor-default" role="listitem">
                <Cpu size={14} className="text-blue-400 group-hover:rotate-180 transition-transform duration-700 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="text-[10px] sm:text-[11px] xl:text-[12px] font-black uppercase tracking-[2px]">Real-Time Data</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Industrial Slim */}
      <footer className="relative z-10 shrink-0 mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-white/20 pt-6 text-[10px] sm:text-[11px] md:text-[12px] font-black uppercase tracking-[2px] sm:tracking-[4px]">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span>{t('login.monitoring')}</span>
          </div>

          <div className="flex items-center ml-auto">
            <button className="text-slate-300 hover:text-white transition-all underline-offset-4 hover:underline">
              POLÍTICA DE DADOS
            </button>
          </div>
      </footer>
      
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img 
          src={BACKGROUND_URL}
          alt=""
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#040a1d] via-[#081437]/95 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </div>
    </div>
  );
};

const StatusTag = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-2.5 text-[9px] sm:text-[10px] md:text-[11px] xl:text-[12px] font-black uppercase tracking-[2px] text-white bg-white/10 backdrop-blur-xl px-4 py-2 sm:py-2.5 rounded-xl border border-white/20 shadow-lg hover:border-[#ff6b2b]/50 transition-colors" role="listitem">
    <Icon size={14} className="text-blue-400 sm:w-4 sm:h-4" aria-hidden="true" /> 
    {label}
  </div>
);