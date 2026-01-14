import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col w-full h-full text-white overflow-hidden pt-8 lg:pt-10 xl:pt-12 2xl:pt-20 px-12 lg:px-16 xl:px-20 2xl:px-32 pb-12 lg:pb-16 xl:pb-20 2xl:pb-32">
      {/* Grid Industrial de Fundo - Sutil e Profissional */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
        aria-hidden="true"
      />

      {/* Header: Logo - Movida para cima e tamanho aumentado proporcionalmente */}
      <div className="relative z-10 shrink-0 mb-auto animate-in fade-in slide-in-from-left-8 duration-1000">
        <img 
          src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
          alt="Aços Vital - Logo Industrial" 
          className="h-12 sm:h-14 md:h-16 lg:h-16 xl:h-20 2xl:h-28 object-contain filter brightness-0 invert drop-shadow-2xl" 
        />
      </div>

      {/* Main Content: Proporções condensadas e elegantes */}
      <div className="relative z-10 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
        <div className="space-y-6 sm:space-y-8">
          
          {/* Subtitle com Detalhe Laranja Vital */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[1.5px] w-10 bg-[#ff6b2b] shadow-[0_0_8px_rgba(255,107,43,0.3)]" aria-hidden="true"></div>
              <span className="text-[#ff6b2b] text-[9px] sm:text-[10px] font-black uppercase tracking-[4px]">
                {t('login.subtitle')}
              </span>
            </div>
            
            {/* Headline: Reduzido para maior sofisticação visual */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-6xl font-black leading-[1.1] tracking-tighter uppercase">
              ESTRUTURAS<br/>
              <span className="text-slate-300">DE CONFIANÇA.</span><br/>
              <span className="text-white/30">DADOS DE PRECISÃO.</span>
            </h1>
          </div>
          
          <p className="text-xs sm:text-sm lg:text-sm xl:text-base text-slate-300/80 font-medium leading-relaxed max-w-sm lg:max-w-md xl:max-w-xl">
            {t('login.heroSubtitle')}
          </p>
          
          {/* Badges Compactos Outlined */}
          <div className="flex flex-wrap gap-2 pt-1" role="list">
             <StatusTag icon={CheckCircle2} label={t('login.certification')} />
             <StatusTag icon={ShieldCheck} label={t('login.secureData')} />
             <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-white/80 group cursor-default transition-all hover:bg-white/10" role="listitem">
                <Cpu size={12} className="text-blue-400 opacity-70" aria-hidden="true" />
                <span className="text-[8.5px] font-black uppercase tracking-[1.2px]">Real-Time Data</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Industrial Slim */}
      <footer className="relative z-10 shrink-0 mt-auto pt-8 flex items-center justify-between border-t border-white/5 text-[8.5px] font-black uppercase tracking-[2px] text-white/40">
          <div className="flex items-center gap-3">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
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
  <div className="flex items-center gap-2 text-[8.5px] font-black uppercase tracking-[1.2px] text-white/80 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10 transition-all hover:border-white/20" role="listitem">
    <Icon size={12} className="text-blue-400 opacity-70" aria-hidden="true" /> 
    {label}
  </div>
);