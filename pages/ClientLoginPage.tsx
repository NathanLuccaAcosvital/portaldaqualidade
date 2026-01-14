
import React, { useState } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { 
  Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, AlertOctagon, 
  Globe, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

const ClientLoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  if (user && normalizeRole(user.role) === UserRole.CLIENT) {
    return <Navigate to="/client/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(credentials.email, credentials.password);
    if (!result.success) {
      setError(result.error || t('login.error'));
    }
  };

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
    <div className="h-screen w-full flex bg-white relative selection:bg-blue-100 overflow-hidden font-sans">
      <CookieBanner />

      {/* Lado Esquerdo: Identidade Visual Industrial (Desktop) */}
      <aside className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden bg-[#081437] h-full shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-110 animate-slow-zoom" 
          style={{ backgroundImage: `url("${BACKGROUND_URL}")` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#081437] via-[#081437]/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-16 w-full h-full text-white">
          <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
            <img src={LOGO_URL} alt={t('menu.brand')} className="h-10 xl:h-14 object-contain" />
          </div>

          <div className="space-y-6 xl:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <div className="space-y-4 xl:space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[1.5px] w-12 bg-[#B23C0E]"></div>
                <span className="text-[#B23C0E] text-[10px] xl:text-xs font-bold uppercase tracking-[6px]">{t('login.subtitle')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl xl:text-6xl font-bold leading-[1.1] tracking-tighter max-w-xl">
                {t('login.slogan').split(',')[0]},<br/>
                <span className="text-[#62A5FA] block mt-2">{t('login.slogan').split(',')[1]}</span>
              </h1>
            </div>
            
            <p className="text-sm xl:text-lg text-slate-300 font-medium leading-relaxed max-w-lg text-pretty">
              {t('login.heroSubtitle')}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
               <div className="flex items-center gap-3 text-[9px] xl:text-[10px] font-bold uppercase tracking-[2px] text-white bg-white/5 backdrop-blur-md px-4 py-3 xl:px-6 xl:py-4 rounded-xl border border-white/10 shadow-xl transition-transform hover:scale-105">
                  <CheckCircle2 size={14} className="text-[#B23C0E] xl:size-4" /> {t('login.certification')}
               </div>
               <div className="flex items-center gap-3 text-[9px] xl:text-[10px] font-bold uppercase tracking-[2px] text-white bg-white/5 backdrop-blur-md px-4 py-3 xl:px-6 xl:py-4 rounded-xl border border-white/10 shadow-xl transition-transform hover:scale-105">
                  <ShieldCheck size={14} className="text-[#B23C0E] xl:size-4" /> {t('login.secureData')}
               </div>
            </div>
          </div>

          {/* RODAPÉ LATERAL (Removido copyright conforme solicitado) */}
          <div className="text-[10px] xl:text-[11px] text-slate-400 font-black flex items-center justify-start gap-12 uppercase tracking-[4px] xl:tracking-[6px]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                <span>{t('login.monitoring')}</span>
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                {t('common.privacy')}
              </div>
          </div>
        </div>
      </aside>

      {/* Lado Direito: Formulário Compacto e Responsivo */}
      <main className="w-full lg:flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-white relative overflow-hidden">
        
        {/* Barra Superior de Idiomas */}
        <div className="absolute top-4 right-4 z-50 animate-in fade-in duration-1000">
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
        </div>

        {/* Container do Card - Ultra Responsivo */}
        <div className="w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[380px] xl:max-w-[440px] flex flex-col p-0.5 bg-gradient-to-br from-blue-100/30 to-blue-50/10 rounded-[2rem] animate-in zoom-in-95 duration-700">
          <div className="bg-white rounded-[1.8rem] p-4 xs:p-6 sm:p-8 xl:p-10 space-y-4 xs:space-y-6 xl:space-y-8 shadow-sm border border-blue-50/30 overflow-y-auto custom-scrollbar">
            <header className="space-y-1 sm:space-y-2 xl:space-y-3">
              <h2 className="text-xl xs:text-2xl sm:text-3xl xl:text-4xl font-bold text-[#081437] tracking-tighter leading-none">{t('login.title')}</h2>
              <p className="text-slate-400 text-[9px] xs:text-[10px] sm:text-xs xl:text-sm font-medium leading-relaxed">
                {t('login.enterCredentials')}
              </p>
            </header>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 xl:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                 <div className="space-y-1">
                    <label className="text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">
                      {t('login.corpEmail')}
                    </label>
                    <div className={`flex items-center bg-slate-50/70 border-[1.5px] rounded-xl overflow-hidden transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-400 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}>
                       <div className={`w-8 sm:w-10 xl:w-12 h-9 sm:h-11 xl:h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-blue-500 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                          <Mail size={14} className="sm:size-4" />
                       </div>
                       <input 
                          type="email" required 
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 xl:py-3 bg-transparent outline-none text-[10px] xs:text-[11px] sm:text-xs xl:text-sm font-semibold text-[#081437] placeholder-slate-300"
                          placeholder="usuario@acosvital.com"
                          onFocus={() => setFocusedInput('email')}
                          onBlur={() => setFocusedInput(null)}
                          value={credentials.email}
                          onChange={e => setCredentials({...credentials, email: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <div className="flex justify-between items-end px-1">
                       <label className="text-[7px] xs:text-[8px] sm:text-[9px] font-black uppercase tracking-[1.5px] text-slate-400">
                         {t('login.accessPassword')}
                       </label>
                       <button type="button" className="text-[6px] xs:text-[7px] sm:text-[8px] font-black text-[#B23C0E] hover:underline uppercase tracking-widest">
                         {t('login.forgotPassword')}
                       </button>
                    </div>
                    <div className={`flex items-center bg-slate-50/70 border-[1.5px] rounded-xl overflow-hidden transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-400 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}>
                       <div className={`w-8 sm:w-10 xl:w-12 h-9 sm:h-11 xl:h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-blue-500 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                          <Lock size={14} className="sm:size-4" />
                       </div>
                       <input 
                          type={showPassword ? "text" : "password"} required 
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 xl:py-3 bg-transparent outline-none text-[10px] xs:text-[11px] sm:text-xs xl:text-sm font-semibold text-[#081437] placeholder-slate-300 tracking-wider"
                          placeholder="••••••••••••"
                          onFocus={() => setFocusedInput('password')}
                          onBlur={() => setFocusedInput(null)}
                          value={credentials.password}
                          onChange={e => setCredentials({...credentials, password: e.target.value})}
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-8 sm:w-10 xl:w-12 h-9 sm:h-11 xl:h-14 flex items-center justify-center text-slate-300 hover:text-[#081437] transition-colors">
                          {showPassword ? <EyeOff size={14} className="sm:size-4" /> : <Eye size={14} className="sm:size-4" />}
                       </button>
                    </div>
                 </div>
              </div>

              {error && (
                <div className="p-2 sm:p-3 bg-red-50 text-red-600 text-[8px] sm:text-[9px] xl:text-[10px] font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-shake">
                  <AlertOctagon size={12} className="shrink-0" /> {error}
                </div>
              )}

              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-[#081437] hover:bg-[#0c1c4d] text-white font-bold h-10 sm:h-12 xl:h-14 rounded-xl transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg active:scale-[0.98] disabled:opacity-70 group"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <span className="uppercase tracking-[2px] sm:tracking-[3px] text-[8px] sm:text-[9px] xl:text-[10px] font-bold">{t('login.authenticate')}</span>
                    <ArrowRight size={14} className="sm:size-4 text-white group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <footer className="text-center pt-3 sm:pt-5 xl:pt-6 border-t border-slate-50 space-y-2">
               <p className="text-[7px] xs:text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                  MODO DE ACESSO EXCLUSIVO PARA CLIENTES E ANALISTAS.
               </p>
               <p className="text-[8px] xs:text-[9px] sm:text-[10px] font-black text-[#081437] uppercase tracking-[2px] opacity-60">
                  © 2026 AÇOS VITAL
               </p>
            </footer>
          </div>
        </div>

        {/* Rodapé Mobile (Apenas visível em telas pequenas < lg) */}
        <div className="mt-8 flex lg:hidden items-center justify-center gap-6 sm:gap-10 text-[8px] xs:text-[9px] text-slate-400 font-black uppercase tracking-[3px] sm:tracking-[4px] animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span>{t('login.monitoring')}</span>
            </div>
            <div className="hover:text-blue-600 cursor-pointer transition-colors">
                {t('common.privacy')}
            </div>
        </div>
      </main>
      
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite alternate ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        @media (max-width: 340px) {
          .xs\:max-w-\[340px\] { max-width: 290px; }
        }
      `}</style>
    </div>
  );
};

export default ClientLoginPage;
