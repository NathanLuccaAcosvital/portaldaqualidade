
import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { fileService } from '../../lib/services/index.ts';
import { DashboardStatsData } from '../../lib/services/interfaces.ts';
import { useTranslation } from 'react-i18next';
import { Clock, FileText, Loader2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { normalizeRole, UserRole } from '../../types/index.ts';

const FileExplorer = React.lazy(() => import('../../components/features/files/FileExplorer.tsx').then(m => ({ default: m.FileExplorer })));

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home';

  const [stats, setStats] = useState<DashboardStatsData | null>(null);

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== UserRole.CLIENT) {
      navigate(role === UserRole.ADMIN ? '/admin/dashboard' : '/quality/dashboard', { replace: true });
      return;
    }
    
    if (user) {
      fileService.getDashboardStats(user).then(setStats);
    }
  }, [user, navigate]);

  return (
    <Layout title={t('menu.dashboard')}>
      <div className="space-y-8 pb-12 animate-in fade-in duration-700">
        {currentView === 'home' ? (
          <>
            <DashboardHero 
              name={user?.name.split(' ')[0] || ''} 
              t={t}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KpiCard 
                icon={FileText} 
                label={t('dashboard.kpi.libraryLabel')} 
                value={stats?.subValue ?? '--'} 
                subtext={t('dashboard.kpi.activeDocsSubtext')} 
                color="blue" 
                onClick={() => navigate('/client/dashboard?view=files')} 
                loading={!stats}
              />
              <KpiCard 
                icon={Clock} 
                label={t('dashboard.kpi.pendingLabel')} 
                value={stats?.pendingValue ?? '--'} 
                subtext={t('dashboard.kpi.awaitingSubtext')} 
                color="orange" 
                onClick={() => navigate('/client/dashboard?view=files&status=PENDING')} 
                loading={!stats}
              />
            </div>

            <section className="bg-white rounded-3xl border border-slate-200 h-[600px] overflow-hidden shadow-sm flex flex-col">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-400">Repositório Industrial</h3>
                  <button onClick={() => navigate('/client/dashboard?view=files')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">{t('dashboard.exploreAll')}</button>
               </div>
               <div className="flex-1 overflow-hidden">
                  <Suspense fallback={<ViewLoader />}>
                      {user?.organizationId ? (
                        <FileExplorer hideToolbar={true} />
                      ) : (
                        <ViewLoader />
                      )}
                  </Suspense>
               </div>
            </section>
          </>
        ) : (
          <section className="bg-white rounded-3xl border border-slate-200 min-h-[700px] overflow-hidden shadow-sm flex flex-col">
             <Suspense fallback={<ViewLoader />}>
                {user?.organizationId ? (
                  <FileExplorer />
                ) : (
                  <ViewLoader />
                )}
             </Suspense>
          </section>
        )}
      </div>
    </Layout>
  );
};

const DashboardHero = ({ name, t }: { name: string, t: any }) => (
  <div className="bg-[#081437] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
    <div className="relative z-10 space-y-4">
      <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-[3px] shadow-lg shadow-blue-600/20">B2B Industrial</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.status.monitoringActive')}</span>
          </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight max-w-xl">
        {t('common.goodMorning')}, <span className="text-blue-400">{name}.</span>
      </h1>
      <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed">{t('dashboard.heroDescription')}</p>
    </div>
  </div>
);

const KpiCard = ({ icon: Icon, label, value, subtext, color, onClick, loading }: any) => (
  <button 
    onClick={onClick} 
    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl hover:border-blue-500 transition-all group text-left relative overflow-hidden"
    disabled={loading}
  >
    <div className="flex justify-between items-start">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
        <Icon size={28} />
      </div>
      <ArrowUpRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      {loading ? (
        <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg my-1" />
      ) : (
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h3>
      )}
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subtext}</p>
    </div>
  </button>
);

const ViewLoader = () => (
  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[300px]">
    <div className="relative">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-900" size={16} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[4px]">Sincronizando Módulos...</span>
  </div>
);

export default ClientDashboard;
