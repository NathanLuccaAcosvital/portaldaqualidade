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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#b23c0e]/10 rounded-full border border-[#b23c0e]/30 text-[#8a2e0b]">
           <ShieldCheck size={14} />
           <span className="text-[10px] font-black uppercase tracking-[2px]">Gateway Seguro Ativo</span>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#040a1d] tracking-tighter leading-none mb-2">
            Acesso Restrito
          </h2>
          <p className="text-slate-600 text-sm font-medium tracking-tight">
            Painel Industrial de Gestão da Qualidade
          </p>
        </div>
      </header>

      <form onSubmit={(e) => onSubmit(e, email, password)} className="space-y-5 sm:space-y-6">
        <div className="space-y-4">
          <div className="space-y-2 group">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-[2px] text-slate-600 group-focus-within:text-blue-700 transition-colors">
                {t('login.corpEmail')}
              </label>
            </div>
            <div className={`flex items-center bg-slate-50 border-2 rounded-xl transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-700 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-r-2 transition-colors ${focusedInput === 'email' ? 'text-blue-700 border-slate-100' : 'text-slate-500 border-slate-200'}`}>
                <Mail size={18} />
              </div>
              <input 
                id="login-email"
                type="email" required 
                className="flex-1 px-4 py-2.5 sm:py-3 bg-transparent outline-none text-sm font-medium text-[#040a1d] placeholder-slate-500"
                placeholder="ex: tecnico@acosvital.com"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-[2px] text-slate-600 group-focus-within:text-blue-700 transition-colors">
                {t('login.accessPassword')}
              </label>
              <button 
                type="button" 
                className="text-[10px] font-bold text-[#b23c0e] hover:text-[#8a2e0b] uppercase tracking-widest transition-colors underline-offset-4 hover:underline"
                aria-label="Redefinir senha de acesso"
              >
                Redefinir
              </button>
            </div>
            <div className={`flex items-center bg-slate-50 border-2 rounded-xl transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-700 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-r-2 transition-colors ${focusedInput === 'password' ? 'text-blue-700 border-slate-100' : 'text-slate-500 border-slate-200'}`}>
                <Lock size={18} />
              </div>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} required 
                className="flex-1 px-4 py-2.5 sm:py-3 bg-transparent outline-none text-sm font-medium text-[#040a1d] placeholder-slate-500 tracking-widest"
                placeholder="••••••••"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-500 hover:text-blue-700 transition-colors"
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-900 text-[11px] font-bold rounded-xl border-2 border-red-200 flex items-center gap-3 animate-shake" role="alert">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-700"><AlertOctagon size={16} /></div>
            {error}
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-[#040a1d] hover:bg-slate-800 text-white font-black h-12 sm:h-14 rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
            <>
              <span className="uppercase tracking-[3px] text-[11px]">{t('login.authenticate')}</span>
              <ArrowRight size={18} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};