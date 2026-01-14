import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertOctagon, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent, email: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <header className="space-y-3">
        {/* Gateway Seguro Badge */}
        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#b23c0e]/5 rounded-lg border border-[#b23c0e]/10 text-[#8a2e0b]">
           <ShieldCheck size={11} />
           <span className="text-[8px] font-black uppercase tracking-[1.5px]">Gateway Seguro Ativo</span>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#040a1d] tracking-tighter leading-none mb-1.5">
            Acesso Restrito
          </h2>
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium tracking-tight">
            Identifique-se para acessar o painel de certificados.
          </p>
        </div>
      </header>

      <form onSubmit={(e) => onSubmit(e, email, password)} className="space-y-6">
        <div className="space-y-4 md:space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5 group">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="login-email" className="text-[9px] font-black uppercase tracking-[1.5px] text-slate-500 group-focus-within:text-blue-800 transition-colors">
                {t('login.corpEmail')}
              </label>
            </div>
            <div className={`flex items-center bg-slate-50 border-b-2 rounded-xl transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-700 bg-white shadow-lg shadow-blue-500/5' : 'border-slate-100'}`}>
              <div className={`w-11 h-12 md:h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-blue-700 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Mail size={16} />
              </div>
              <input 
                id="login-email"
                type="email" required 
                className="flex-1 px-4 py-2.5 bg-transparent outline-none text-xs sm:text-sm font-semibold text-[#040a1d] placeholder-slate-400"
                placeholder="tecnico@acosvital.com"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 group">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="login-password" className="text-[9px] font-black uppercase tracking-[1.5px] text-slate-500 group-focus-within:text-blue-800 transition-colors">
                {t('login.accessPassword')}
              </label>
              <button 
                type="button" 
                className="text-[9px] font-black text-[#b23c0e] hover:text-[#8a2e0b] uppercase tracking-widest transition-colors underline-offset-4 hover:underline"
              >
                Redefinir
              </button>
            </div>
            <div className={`flex items-center bg-slate-50 border-b-2 rounded-xl transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-700 bg-white shadow-lg shadow-blue-500/5' : 'border-slate-100'}`}>
              <div className={`w-11 h-12 md:h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-blue-700 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Lock size={16} />
              </div>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} required 
                className="flex-1 px-4 py-2.5 bg-transparent outline-none text-xs sm:text-sm font-semibold text-[#040a1d] placeholder-slate-400 tracking-widest"
                placeholder="••••••••"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="w-11 h-12 md:h-14 flex items-center justify-center text-slate-300 hover:text-blue-700 transition-colors"
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-900 text-[10px] font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-shake" role="alert">
            <AlertOctagon size={14} className="text-red-700 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-[#040a1d] hover:bg-slate-800 text-white font-black h-12 md:h-14 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
            <>
              <span className="uppercase tracking-[4px] text-[10px] md:text-[11px]">{t('login.authenticate')}</span>
              <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};