
import React from 'react';
import { Server, Database, Activity, Cpu, ShieldCheck } from 'lucide-react';
import { AdminStatsData } from '../../../../lib/services/interfaces';

/**
 * AdminOverview View (Pure Presentation)
 * (S) Responsabilidade: Exibir a saúde técnica da infraestrutura.
 */
export const AdminOverview: React.FC<{ stats: AdminStatsData | null }> = ({ stats }) => {
  if (!stats) return <LoadingOverview />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700 pb-8">
      
      <InfrastructureHealthCard 
        cpu={stats.cpuUsage} 
        memory={stats.memoryUsage} 
      />

      <DatabaseClusterCard 
        connections={stats.dbConnections} 
        maxConnections={stats.dbMaxConnections} 
      />

    </div>
  );
};

/* --- Sub-componentes de Composição (ISP) --- */

const InfrastructureHealthCard = ({ cpu, memory }: { cpu: number, memory: number }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
    <header className="flex justify-between items-center">
      <div className="space-y-1">
        <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-400 flex items-center gap-2">
          <Server size={18} className="text-blue-600" /> Infraestrutura Vital
        </h3>
        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cluster Operacional
        </p>
      </div>
    </header>

    <div className="space-y-10">
      <MetricBar label="Carga de CPU" value={cpu} color="blue" />
      <MetricBar label="Utilização de Memória" value={memory} color="indigo" />
    </div>

    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
       <StatusIndicator icon={Cpu} label="Latência" value="22ms" />
       <StatusIndicator icon={Activity} label="Uptime" value="99.98%" />
    </div>
  </div>
);

const DatabaseClusterCard = ({ connections, maxConnections }: { connections: number, maxConnections: number }) => (
  <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
    
    <div className="relative z-10 space-y-8">
      <header className="flex items-center gap-3">
         <Database size={24} className="text-orange-500" />
         <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-500">Database Engine</h3>
      </header>

      <div className="grid grid-cols-2 gap-6">
         <MetricBox label="Conexões Ativas" value={connections} unit="sockets" />
         <MetricBox label="Capacidade Livre" value={maxConnections - connections} unit="slots" />
      </div>
    </div>

    <div className="relative z-10 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 mt-8">
       <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-[#0f172a]" />
       </div>
       <div>
          <p className="text-[11px] font-black uppercase tracking-widest">Integridade de Dados</p>
          <p className="text-[10px] text-slate-400 font-medium">Último backup validado às 03:00 AM.</p>
       </div>
    </div>
  </div>
);

const MetricBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end px-1">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-base font-mono font-black text-slate-900">{value}%</span>
    </div>
    <div className="h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden p-[2px]">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${
          color === 'blue' ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-indigo-600'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const MetricBox = ({ label, value, unit }: any) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black">{value}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
    </div>
  </div>
);

const StatusIndicator = ({ icon: Icon, label, value }: any) => (
  <div className="p-3 bg-slate-50/50 rounded-xl flex items-center gap-3">
    <div className="text-blue-600"><Icon size={16} /></div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase">{label}</p>
      <p className="text-xs font-black text-slate-800">{value}</p>
    </div>
  </div>
);

const LoadingOverview = () => (
  <div className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
  </div>
);
