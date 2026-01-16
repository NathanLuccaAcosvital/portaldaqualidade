
import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/authContext.tsx';
import { usePartnerCertificates } from '../hooks/usePartnerCertificates.ts';
import { FileExplorer } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { FileNode, UserRole, FileType, QualityStatus } from '../../../../types/index.ts';
import { fileService } from '../../../../lib/services/index.ts';
import { Info, ShieldCheck, HelpCircle, ArrowRight, FileCheck } from 'lucide-react';

export const PartnerLibraryView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  const { files, isLoading, breadcrumbs, refresh } = usePartnerCertificates(currentFolderId, searchTerm);
  
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  const handleNavigate = (id: string | null) => {
    setSearchParams(prev => {
        if (id) prev.set('folderId', id);
        else prev.delete('folderId');
        return prev;
    });
  };

  const handleDownload = async (file: FileNode) => {
    const url = await fileService.getSignedUrl(file.storagePath);
    window.open(url, '_blank');
  };

  const handlePreviewClose = () => {
    setPreviewFile(null);
    refresh();
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* Seção de Onboarding - Explica ao cliente como funciona */}
      {!currentFolderId && !searchTerm && (
        <section className="bg-[#081437] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0">
               <FileCheck size={40} className="text-blue-400" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-black tracking-tight">Sua Central de Certificados</h2>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed font-medium">
                Aqui você acessa todos os laudos técnicos da <b>Aços Vital</b>. 
                Documentos com selo <span className="text-emerald-400 font-bold">Verde</span> estão liberados para uso. 
                Sinalize qualquer divergência diretamente no visualizador do arquivo.
              </p>
            </div>
            <div className="hidden lg:flex flex-col gap-2">
               <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Aprovados: Prontos para Uso</span>
               </div>
               <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Pendentes: Em Análise Vital</span>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* Container da Biblioteca */}
      <div className="flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        <FilePreviewModal 
          initialFile={previewFile}
          allFiles={files.filter(f => f.type !== FileType.FOLDER)}
          isOpen={!!previewFile} 
          onClose={handlePreviewClose} 
          onDownloadFile={handleDownload} 
        />

        <ExplorerToolbar
          breadcrumbs={breadcrumbs}
          onNavigate={handleNavigate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onUploadClick={() => {}} 
          onCreateFolderClick={() => {}}
          selectedCount={selectedFileIds.length}
          onDeleteSelected={() => {}} 
          onRenameSelected={() => {}}
          onDownloadSelected={() => {
              const selected = files.find(f => f.id === selectedFileIds[0]);
              if (selected) handleDownload(selected);
          }}
          viewMode={viewMode}
          onViewChange={setViewMode}
          selectedFilesData={files.filter(f => selectedFileIds.includes(f.id))}
          userRole={UserRole.CLIENT}
        />

        {/* Legendinha de usabilidade rápida no topo da lista */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dica:</span>
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-tight">
                 <HelpCircle size={12} className="text-blue-500" /> Clique duas vezes em um arquivo para abrir o painel de inspeção.
              </p>
           </div>
        </div>

        <FileExplorer 
          files={files} 
          loading={isLoading}
          currentFolderId={currentFolderId}
          searchTerm={searchTerm}
          breadcrumbs={breadcrumbs}
          selectedFileIds={selectedFileIds}
          onToggleFileSelection={(id) => setSelectedFileIds(prev => prev.includes(id) ? [] : [id])}
          onNavigate={handleNavigate}
          onFileSelectForPreview={(f) => f && f.type !== FileType.FOLDER && setPreviewFile(f)}
          onDownloadFile={handleDownload}
          onRenameFile={() => {}}
          onDeleteFile={() => {}}
          viewMode={viewMode}
          userRole={UserRole.CLIENT}
        />
      </div>
    </div>
  );
};
