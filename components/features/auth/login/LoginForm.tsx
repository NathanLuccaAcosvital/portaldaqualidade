
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertOctagon } from 'lucide-react';
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
    <div className="w-full space-y-4 lg:space-y-5 xl:space-y-5 2xl:space-y-10">
      <header className="space-y-1">
        <h2 className="text-xl sm:text-2xl xl:text-2xl 2xl:text-4xl font-black text-[#081437] tracking-tighter leading-none">
          {t('login.title')}
        </h2>
        <p className="text-slate-400 text-[9px] sm:text-xs xl:text-[10px] 2xl:text-sm font-bold uppercase tracking-wider">
          {t('login.enterCredentials')}
        </p>
      </header>

      <form onSubmit={(e) => onSubmit(e, email, password)} className="space-y-4 xl:space-y-4 2xl:space-y-8">
        <div className="space-y-3 xl:space-y-3">
          <div className="space-y-1">
            <label className="text-[7px] sm:text-[8px] xl:text-[8px] 2xl:text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">
              {t('login.corpEmail')}
            </label>
            <div className={`flex items-center bg-slate-50/70 border-[1.5px] rounded-xl overflow-hidden transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-400 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}>
              <div className={`w-10 xl:w-11 2xl:w-14 h-10 xl:h-11 2xl:h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'email' ? 'text-blue-500 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Mail size={16} />
              </div>
              <input 
                type="email" required 
                className="flex-1 px-3 xl:px-4 py-2 xl:py-2.5 2xl:py-4 bg-transparent outline-none text-[11px] xl:text-[12px] 2xl:text-sm font-bold text-[#081437] placeholder-slate-300"
                placeholder="usuario@acosvital.com"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-end px-1">
              <label className="text-[7px] sm:text-[8px] xl:text-[8px] 2xl:text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">
                {t('login.accessPassword')}
              </label>
              <button type="button" className="text-[6px] sm:text-[7px] xl:text-[8px] 2xl:text-[9px] font-black text-[#B23C0E] hover:underline uppercase tracking-widest">
                {t('login.forgotPassword')}
              </button>
            </div>
            <div className={`flex items-center bg-slate-50/70 border-[1.5px] rounded-xl overflow-hidden transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-400 bg-white ring-4 ring-blue-50' : 'border-slate-100'}`}>
              <div className={`w-10 xl:w-11 2xl:w-14 h-10 xl:h-11 2xl:h-14 flex items-center justify-center border-r transition-colors ${focusedInput === 'password' ? 'text-blue-500 border-slate-100' : 'text-slate-300 border-slate-50'}`}>
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} required 
                className="flex-1 px-3 xl:px-4 py-2 xl:py-2.5 2xl:py-4 bg-transparent outline-none text-[11px] xl:text-[12px] 2xl:text-sm font-bold text-[#081437] placeholder-slate-300 tracking-wider"
                placeholder="••••••••"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-10 xl:w-11 2xl:w-14 flex items-center justify-center text-slate-300 hover:text-[#081437] transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2 xl:p-2.5 bg-red-50 text-red-600 text-[9px] xl:text-[9px] font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-shake">
            <AlertOctagon size={14} className="shrink-0" /> {error}
          </div>
        )}

        <button 
          type="submit" disabled={isLoading}
          className="w-full bg-[#081437] hover:bg-[#0c1c4d] text-white font-bold h-10 xl:h-11 2xl:h-16 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-70 group"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
            <>
              <span className="uppercase tracking-[2.5px] text-[9px] xl:text-[9px] 2xl:text-xs font-black">{t('login.authenticate')}</span>
              <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
