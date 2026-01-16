
import React from 'react';
import { usePartnerCertificates } from '../hooks/usePartnerCertificates.ts';
import { ShieldCheck, Download, FileText, Clock, AlertTriangle, FileWarning, ArrowRight } from 'lucide-react';
import { PageLoader } from '../../../common/PageLoader.tsx';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';

export const PartnerDashboardView: React.FC = () => {
  const { files, isLoading, stats, refresh } = usePartnerCertificates(null, '');
  const [, setSearchParams] = useSearchParams();

  if (isLoading) return <PageLoader message="Sincronizando Indicadores Vital..." />;

  const hasRejected = (stats as any).rejectedCount > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Grade de KPIs do Parceiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Em Conformidade</h3>
          </div>
          <div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{(stats as any).approvedCount || 0}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Certificados Auditados</p>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] border shadow-sm flex flex-col justify-between transition-all ${
          hasRejected ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              hasRejected ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              <FileWarning size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Ação Requerida</h3>
          </div>
          <div>
            <p className={`text-4xl font-black tracking-tighter ${hasRejected ? 'text-red-600' : 'text-slate-800'}`}>
              {(stats as any).rejectedCount || 0}
            </p>
            <p className={`text-[10px] font-bold uppercase mt-1 ${hasRejected ? 'text-red-500' : 'text-slate-400'}`}>
              {hasRejected ? 'Documentos Contestados' : 'Nenhuma Pendência'}
            </p>
          </div>
        </div>

        <div className="bg-[#081437] p-6 rounded-[2rem] text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock size={80} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-10 h-10 bg-white/10 text-blue-400 rounded-xl flex items-center justify-center border border-white/5">
              <Clock size={20} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">Última Auditoria</h3>
          </div>
          <div className="relative z-10">
            <p className="text-xl font-bold">{stats.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleDateString() : '--/--/----'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Sincronização em Tempo Real</p>
          </div>
        </div>
      </div>

      {/* CTA de Documentação */}
      {hasRejected && (
        <div className="bg-gradient-to-r from-[#b23c0e] to-[#8a2f0b] p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-black uppercase tracking-tight">Ajustes Técnicos Necessários</h4>
            <p className="text-sm text-white/70 font-medium max-w-xl">
              Você possui certificados que foram marcados para correção ou substituição. Verifique as observações da engenharia na sua biblioteca.
            </p>
          </div>
          <button 
            onClick={() => setSearchParams({ view: 'library' })}
            className="px-8 py-4 bg-white text-[#b23c0e] rounded-2xl font-black text-xs uppercase tracking-[2px] shadow-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-3 shrink-0"
          >
            Acessar Biblioteca <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Atividade Recente */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <header className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-[3px]">Transmissões Recentes</h4>
        </header>
        <div className="divide-y divide-slate-50">
          {files.slice(0, 5).map(file => (
            <div key={file.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{file.size}</span>
                    <FileStatusBadge status={file.metadata?.status} />
                    {file.metadata?.viewedAt && (
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 ml-2">Visualizado</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => setSearchParams({ view: 'library', folderId: file.parentId || '' })}
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                    title="Localizar na Biblioteca"
                >
                    <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic text-sm">
              Nenhuma atividade documental detectada no terminal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
