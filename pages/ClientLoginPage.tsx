import React, { useState } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';

// Componentes Refatorados
import { LoginHero } from '../components/features/auth/login/LoginHero.tsx';
import { LoginForm } from '../components/features/auth/login/LoginForm.tsx';
import { LanguageSelector } from '../components/features/auth/login/LanguageSelector.tsx';

const ClientLoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState('');

  if (user && normalizeRole(user.role) === UserRole.CLIENT) {
    return <Navigate to="/client/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent, email: string, pass: string) => {
    e.preventDefault();
    setError('');
    const result = await login(email, pass);
    if (!result.success) {
      setError(result.error || t('login.error'));
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#040a1d] relative selection:bg-blue-100 overflow-x-hidden font-sans">
      {/* Camada de Granulação Industrial */}
      <div className="absolute inset-0 z-[100] opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <CookieBanner />

      {/* Hero Section: Ocupa agora uma área maior para comprimir a seção de login lateralmente */}
      <aside className="hidden lg:flex lg:w-[60%] xl:w-[68%] relative overflow-hidden h-screen shrink-0 border-r border-white/5">
        <LoginHero />
      </aside>

      {/* Login Form Section: Seção branca agora mais estreita e focada */}
      <main className="flex-1 min-h-screen flex flex-col items-center justify-center p-6 md:p-12 lg:p-14 xl:p-20 bg-white lg:rounded-l-[3.5rem] relative z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] lg:shadow-[-40px_0_100px_rgba(0,0,0,0.4)]">
        
        {/* Language Switcher - Posicionamento responsivo refinado */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 animate-in fade-in duration-1000">
          <LanguageSelector />
        </div>

        {/* Login Container: Mantido compacto para não "vazar" na seção agora mais estreita */}
        <div className="w-full max-w-[360px] xl:max-w-[380px] animate-in zoom-in-95 duration-700">
          <div className="space-y-8 md:space-y-10">
            <div className="flex justify-center lg:hidden mb-10">
               <img src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" alt="Aços Vital" className="h-10 object-contain" />
            </div>

            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            <footer className="pt-8 md:pt-10 border-t border-slate-100 flex items-center justify-between">
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-[2px]">Aços Vital S.A.</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sistemas de Qualidade</p>
               </div>
               <img 
                 src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" 
                 alt="" 
                 className="h-4 opacity-20 grayscale hidden sm:block" 
                 aria-hidden="true" 
               />
            </footer>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 60s infinite alternate ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default ClientLoginPage;