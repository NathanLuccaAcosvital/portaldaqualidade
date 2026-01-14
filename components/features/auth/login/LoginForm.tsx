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
    <div className="w-full space-y-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#b23c0e]/5 rounded-full border border-[#b23c0e]/20 text-[#b23c0e]">
           <ShieldCheck size={16} />
           <span className="text-[10px] font-black uppercase tracking-[2px]">Gateway Seguro Ativo</span>
        </div>
        <div>
          <h2 className="text-4xl font-black text-[#081437] tracking-tighter leading-none mb-2">
            Acesso Restrito
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Painel Industrial de Gestão da Qualidade
          </p>
        </div>
      </header>

      <form onSubmit={(e) => onSubmit(e, email, password)} className="space-y-8">
        <div className="space-y-5">
          <div className="space-y-2 group">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                {t('login.corpEmail')}
              </label>
            </div>
            <div className={`flex items-center bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-600 bg-white ring-8 ring-blue-500/5' : 'border-slate-100'}`}>
              <div className={`w-14 h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-blue-600 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Mail size={20} />
              </div>
              <input 
                id="login-email"
                type="email" required 
                className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-[#081437] placeholder-slate-300"
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
              <label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-focus-within:text-blue-600 transition-colors">
                {t('login.accessPassword')}
              </label>
              <button type="button" className="text-[10px] font-black text-[#b23c0e] hover:text-[#8a2e0b] uppercase tracking-widest transition-colors">
                Redefinir
              </button>
            </div>
            <div className={`flex items-center bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-600 bg-white ring-8 ring-blue-500/5' : 'border-slate-100'}`}>
              <div className={`w-14 h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-blue-600 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Lock size={20} />
              </div>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} required 
                className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-[#081437] placeholder-slate-300 tracking-widest"
                placeholder="••••••••"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="w-14 h-14 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
            <div className="p-1.5 bg-red-100 rounded-lg"><AlertOctagon size={16} /></div>
            {error}
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-[#081437] hover:bg-slate-800 text-white font-black h-16 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
            <>
              <span className="uppercase tracking-[5px] text-xs">{t('login.authenticate')}</span>
              <ArrowRight size={20} className="text-blue-400 group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};