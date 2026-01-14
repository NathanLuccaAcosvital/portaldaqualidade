
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
    <div className="h-screen w-full flex bg-white relative selection:bg-blue-100 overflow-hidden font-sans">
      <CookieBanner />

      {/* Lado Esquerdo: Identidade Visual Industrial (Apenas Desktop > 1024px) */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[55%] relative overflow-hidden bg-[#081437] h-full shrink-0">
        <LoginHero />
      </aside>

      {/* Lado Direito: Container de Formulário Centralizado e Flexível */}
      <main className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 xl:p-16 bg-slate-50 lg:bg-white relative overflow-y-auto custom-scrollbar">
        
        {/* Language Switcher Flutuante */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 animate-in fade-in duration-1000">
          <LanguageSelector />
        </div>

        {/* Card de Login com Limite de Largura para TVs e Monitores Ultra-Wide */}
        <div className="w-full max-w-[440px] flex flex-col p-1 bg-gradient-to-br from-blue-100/20 to-transparent rounded-[2.5rem] animate-in zoom-in-95 duration-700 shadow-xl lg:shadow-none bg-white lg:bg-transparent">
          <div className="bg-white rounded-[2.3rem] p-6 xs:p-8 sm:p-10 xl:p-12 space-y-8">
            <LoginForm 
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            <footer className="text-center pt-6 border-t border-slate-100 space-y-3">
               <p className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-wide leading-relaxed">
                  MODO DE ACESSO EXCLUSIVO PARA CLIENTES E ANALISTAS.
               </p>
               <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[3px]">
                  © 2026 AÇOS VITAL
               </p>
            </footer>
          </div>
        </div>

        {/* Rodapé Mobile/Tablet (Visível apenas quando Hero está oculto) */}
        <div className="mt-12 flex lg:hidden items-center justify-center gap-8 text-[9px] text-slate-600 font-black uppercase tracking-[4px] animate-in fade-in duration-1000 delay-500">
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
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 40s infinite alternate ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
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
      `}</style>
    </div>
  );
};

export default ClientLoginPage;
