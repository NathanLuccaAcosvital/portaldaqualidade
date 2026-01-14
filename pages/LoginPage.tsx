
import React, { useState } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, AlertOctagon, Globe } from 'lucide-react';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { PrivacyModal } from '../components/common/PrivacyModal.tsx';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(credentials.email, credentials.password);
    if (!result.success) setError(result.error || t('login.connectionError'));
  };

  return (
    <div className="min-h-screen flex bg-white relative selection:bg-blue-100 overflow-hidden font-sans">
      <LanguageSelector current={i18n.language} onSelect={(l) => i18n.changeLanguage(l)} />
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Hero Branding Section - (S) Single Responsibility for Visuals */}
      <LoginBranding t={t} />

      {/* Form Section */}
      <main className="w-full lg:flex-1 flex items-center justify-center p-8 md:p-16 bg-white relative z-30">
        <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-right-6 duration-1000">
          <header className="space-y-3">
            <h2 className="text-4xl font-black text-[#081437] tracking-tighter">{t('menu.portalName')}</h2>
            <p className="text-slate-400 text-sm font-medium">{t('login.enterCredentials')}</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <AuthInputField 
              id="email" label={t('login.corpEmail')} icon={Mail} type="email"
              value={credentials.email} onChange={(v) => setCredentials({...credentials, email: v})}
              placeholder="usuario@acosvital.com"
            />

            <AuthInputField 
              id="password" label={t('login.accessPassword')} icon={Lock} 
              type={showPassword ? "text" : "password"}
              value={credentials.password} onChange={(v) => setCredentials({...credentials, password: v})}
              placeholder="••••••••••••"
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              isToggled={showPassword}
              rightLabel={<a href="#" className="text-[10px] font-bold text-[#B23C0E] hover:underline">{t('login.forgotPassword')}</a>}
            />

            {error && <ErrorMessage message={error} />}
            
            <SubmitButton isLoading={isLoading} label={t('login.authenticateAccess')} />
          </form>

          <footer className="text-center pt-8 border-t border-slate-50">
            <p className="text-[12px] text-slate-400 font-medium">
              {t('login.newUser')} <Link to="/signup" className="text-[#081437] font-black hover:text-[#B23C0E] transition-colors ml-1 uppercase tracking-wider">
                {t('login.requestRegister')}
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

const LanguageSelector = ({ current, onSelect }: any) => (
  <div className="absolute top-6 right-6 z-[110] flex gap-1 bg-white/60 backdrop-blur-xl p-1 rounded-xl border border-slate-200/50 shadow-sm">
    <div className="pl-2.5 pr-1.5 text-slate-400 flex items-center"><Globe size={14} /></div>
    {['pt', 'en'].map(l => (
      <button key={l} onClick={() => onSelect(l)} className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${current === l ? 'bg-[#081437] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{l}</button>
    ))}
  </div>
);

const LoginBranding = ({ t }: any) => (
  <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden shrink-0">
    <div className="absolute inset-0 bg-cover bg-center animate-slow-zoom" style={{ backgroundImage: `url("${BACKGROUND_URL}")` }} />
    <div className="absolute inset-0 bg-[#081437]/60" />
    <div className="relative z-30 flex flex-col justify-between p-20 w-full text-white">
      <img src={LOGO_URL} alt="Aços Vital" className="h-16 object-contain self-start" />
      <div className="space-y-6 max-w-xl">
        <h1 className="text-6xl font-black leading-tight tracking-tighter">Conformidade<br/><span className="text-[#62A5FA]">Garantida.</span></h1>
        <p className="text-lg text-slate-300 font-medium leading-relaxed">{t('login.sloganText')}</p>
      </div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[4px]">© {new Date().getFullYear()} Aços Vital S.A.</div>
    </div>
    <style>{`.animate-slow-zoom { animation: zoom 30s infinite alternate; } @keyframes zoom { from { transform: scale(1); } to { transform: scale(1.1); } }`}</style>
  </div>
);

const AuthInputField = ({ label, icon: Icon, value, onChange, type, placeholder, showToggle, onToggle, isToggled, rightLabel }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end px-1">
      <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">{label}</label>
      {rightLabel}
    </div>
    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden focus-within:border-[#62A5FA] focus-within:bg-white transition-all">
      <div className="w-12 h-14 flex items-center justify-center border-r border-slate-100 text-slate-300"><Icon size={18} /></div>
      <input 
        type={type} required className="flex-1 px-5 py-4 bg-transparent outline-none text-sm"
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      />
      {showToggle && (
        <button type="button" onClick={onToggle} className="px-4 text-slate-300 hover:text-blue-500">
          {isToggled ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-3">
    <AlertOctagon size={16} /> {message}
  </div>
);

const SubmitButton = ({ isLoading, label }: any) => (
  <button 
    type="submit" disabled={isLoading}
    className="w-full bg-[#081437] hover:bg-[#0c1d4d] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-70 h-14"
  >
    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
      <div className="flex items-center gap-3 uppercase tracking-[4px] text-[11px]">
        {label} <ArrowRight size={18} className="text-[#62A5FA]" />
      </div>
    )}
  </button>
);

export default LoginPage;
