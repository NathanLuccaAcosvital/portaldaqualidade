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
    <div className="h-screen w-full flex bg-slate-900 relative selection:bg-blue-100 overflow-hidden font-sans">
      {/* Camada de Granulação Industrial */}
      <div className="absolute inset-0 z-[100] opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <CookieBanner />

      <aside className="hidden lg:flex lg:w-[50%] xl:w-[60%] relative overflow-hidden h-full shrink-0">
        <LoginHero />
      </aside>

      <main className="flex-1 h-full flex flex-col items-center justify-center p-6 bg-white lg:rounded-l-[3rem] relative z-10 shadow-[-50px_0_100px_rgba(0,0,0,0.3)]">
        
        {/* Language Switcher */}
        <div className="absolute top-8 right-8 z-50 animate-in fade-in duration-1000">
          <LanguageSelector />
        </div>

        <div className="w-full max-w-[390px] animate-in zoom-in-95 duration-700">
          <div className="space-y-10">
            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            <footer className="pt-10 border-t border-slate-100 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[9.5px] font-black text-slate-800 uppercase tracking-[2.5px]">Aços Vital S.A.</p>
                  <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Sistemas de Gestão Industrial</p>
               </div>
               <img src="https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png" alt="" className="h-5 opacity-20 grayscale" />
            </footer>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
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
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default ClientLoginPage;