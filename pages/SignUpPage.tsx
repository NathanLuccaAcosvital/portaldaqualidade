
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, 
  ChevronLeft, Eye, EyeOff, Briefcase, AlertOctagon
} from 'lucide-react';
import { userService } from '../lib/services/index.ts';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { PrivacyModal } from '../components/common/PrivacyModal.tsx';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', department: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError(t('changePassword.matchError'));
    
    setIsLoading(true);
    try {
      await userService.signUp(
        formData.email.trim(), 
        formData.password, 
        formData.fullName.trim(), 
        undefined, // Sem organização vinculada no auto-cadastro interno
        formData.department.trim()
      );
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || t('login.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative selection:bg-blue-100 overflow-hidden font-sans">
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <aside className="hidden lg:flex lg:w-[30%] relative bg-[#081437] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1920")' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#081437] via-[#081437]/90 to-[#081437]/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white h-full">
          <div className="space-y-12">
            <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[3px]">{t('common.backToLogin')}</span>
            </Link>
            <img src={LOGO_URL} alt="Logo" className="h-10 object-contain drop-shadow-2xl" />
            <div className="space-y-4">
              <div className="h-px w-8 bg-[#B23C0E]"></div>
              <h1 className="text-3xl font-black leading-tight tracking-tighter">Cadastro Interno</h1>
              <p className="text-slate-400 font-medium text-sm">Portal de conformidade técnica Aços Vital.</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="w-full lg:flex-1 flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto custom-scrollbar relative z-30">
        <div className="w-full max-w-[650px] space-y-10 animate-in fade-in duration-700">
          {success ? (
            <SuccessState t={t} />
          ) : (
            <div className="space-y-8">
              <header className="space-y-2">
                <h2 className="text-4xl font-black text-[#081437] tracking-tighter">{t('signup.newRegister')}</h2>
                <p className="text-slate-400 text-sm font-medium">{t('signup.fillFields')}</p>
              </header>

              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput label={t('signup.fullName')} icon={UserIcon} value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} />
                  <FormInput label={t('signup.corpEmail')} icon={Mail} type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                  <FormInput label={t('signup.department')} icon={Briefcase} value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                  <div className="hidden md:block" /> {/* Spacer */}
                  <FormInput label={t('signup.password')} icon={Lock} type={showPassword ? "text" : "password"} value={formData.password} onChange={v => setFormData({...formData, password: v})} toggle={() => setShowPassword(!showPassword)} showToggle={showPassword} />
                  <FormInput label={t('signup.confirmPassword')} icon={Lock} type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={v => setFormData({...formData, confirmPassword: v})} />
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-3"><AlertOctagon size={16} /> {error}</div>}

                <div className="pt-6 space-y-6">
                  <button type="submit" disabled={isLoading} className="w-full bg-[#081437] hover:bg-[#0c1d4d] text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 h-14 active:scale-95 disabled:opacity-70">
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <><span className="uppercase tracking-[4px] text-[11px]">{t('signup.requestRegister')}</span><ArrowRight size={18} className="text-[#62A5FA]" /></>}
                  </button>
                  <p className="text-center text-xs text-slate-400 font-medium">
                    {t('signup.alreadyHaveAccount')} <Link to="/login" className="text-[#081437] font-black hover:text-[#B23C0E] transition-colors ml-1 uppercase tracking-wider">{t('signup.login')}</Link>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SuccessState = ({ t }: any) => (
  <div className="p-16 bg-white rounded-3xl text-center space-y-6">
    <div className="w-20 h-20 bg-blue-50 text-[#62A5FA] rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={40} /></div>
    <h2 className="text-3xl font-black text-[#081437] tracking-tighter">{t('signup.requestSent')}</h2>
    <p className="text-slate-500 text-sm font-medium">{t('signup.validationPending')}</p>
    <div className="flex justify-center pt-4"><Loader2 size={24} className="animate-spin" /></div>
  </div>
);

const FormInput = ({ label, icon: Icon, value, onChange, type = "text", toggle, showToggle }: any) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-2 group">
      <label className={`text-[10px] font-black uppercase tracking-[2px] ml-1 transition-colors ${focused ? 'text-[#62A5FA]' : 'text-slate-400'}`}>{label}</label>
      <div className={`flex items-center bg-slate-50 border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300 ${focused ? 'border-[#62A5FA] bg-white ring-4 ring-[#62A5FA]/10 shadow-sm' : 'border-slate-100'}`}>
        <div className={`w-12 h-12 flex items-center justify-center border-r transition-colors ${focused ? 'text-[#62A5FA] border-[#62A5FA]/10' : 'text-slate-300 border-slate-100'}`}><Icon size={16} strokeWidth={2.5} /></div>
        <input type={type} required className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800" value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {toggle && <button type="button" onClick={toggle} className="w-12 h-12 text-slate-300 hover:text-[#62A5FA]">{showToggle ? <Eye size={18} /> : <EyeOff size={18} />}</button>}
      </div>
    </div>
  );
};

export default SignUpPage;
