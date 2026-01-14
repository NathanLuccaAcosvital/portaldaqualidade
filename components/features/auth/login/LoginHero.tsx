import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col w-full h-full text-white overflow-hidden pt-6 md:pt-10 lg:pt-12 xl:pt-16 px-10 lg:px-14 xl:px-18 pb-10 xl:pb-16">
      {/* Grid Industrial de Fundo - Sutil */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
        aria-hidden="true"
      />

      {/* Header: Logo - Elevada e Aumentada Proporcionalmente */}
      <div className="relative z-10 shrink-0 mb-auto animate-in fade-in slide-in-from-left-8 duration-1000">
        <img 
          src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
          alt="Aços Vital - Logo Industrial" 
          className="h-14 sm:h-16 md:h-18 lg:h-20 xl:h-24 2xl:h-32 object-contain filter brightness-0 invert drop-shadow-2xl" 
        />
      </div>

      {/* Main Content: Proporções otimizadas para Notebooks 13-14" */}
      <div className="relative z-10 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="space-y-5 sm:space-y-6">
          
          {/* Subtitle com Detalhe Laranja Vital */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="h-[1.5px] w-8 bg-[#ff6b2b] shadow-[0_0_8px_rgba(255,107,43,0.3)]" aria-hidden="true"></div>
              <span className="text-[#ff6b2b] text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-[3px]">
                {t('login.subtitle')}
              </span>
            </div>
            
            {/* Headline: BEM MENOR para sofisticação visual em telas menores */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-5xl font-black leading-[1.15] tracking-tighter uppercase max-w-lg">
              ESTRUTURAS<br/>
              <span className="text-slate-300">DE CONFIANÇA.</span><br/>
              <span className="text-white/25">DADOS DE PRECISÃO.</span>
            </h1>
          </div>
          
          <p className="text-[11px] sm:text-[12px] lg:text-[12.5px] xl:text-sm text-slate-300/70 font-medium leading-relaxed max-w-xs lg:max-w-sm xl:max-w-md">
            {t('login.heroSubtitle')}
          </p>
          
          {/* Badges Compactos Outlined (Diminuídos conforme solicitado) */}
          <div className="flex flex-wrap gap-2 pt-1" role="list">
             <StatusTag icon={CheckCircle2} label={t('login.certification')} />
             <StatusTag icon={ShieldCheck} label={t('login.secureData')} />
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-white/70 group cursor-default transition-all hover:bg-white/10" role="listitem">
                <Cpu size={11} className="text-blue-400 opacity-60" aria-hidden="true" />
                <span className="text-[7.5px] lg:text-[8px] font-black uppercase tracking-[1px]">Real-Time Data</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Industrial Slim */}
      <footer className="relative z-10 shrink-0 mt-auto pt-6 flex items-center justify-between border-t border-white/5 text-[8px] lg:text-[8.5px] font-black uppercase tracking-[2px] text-white/35">
          <div className="flex items-center gap-3">
            <div className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
            </div>
            <span>{t('login.monitoring')}</span>
          </div>

          <button className="hover:text-white transition-all underline-offset-4 hover:underline">
            POLÍTICA DE DADOS
          </button>
      </footer>
      
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img 
          src={BACKGROUND_URL}
          alt=""
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#01040f] via-[#081437]/95 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
      </div>
    </div>
  );
};

const StatusTag = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-1.5 text-[7.5px] lg:text-[8px] font-black uppercase tracking-[1px] text-white/70 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 transition-all hover:border-white/20" role="listitem">
    <Icon size={11} className="text-blue-400 opacity-60" aria-hidden="true" /> 
    {label}
  </div>
);