import React, { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, UserRole, QualityStatus } from '../../../../types/index.ts';
import { useFileExplorer } from '../../files/hooks/useFileExplorer.ts';
import { FileExplorer, FileExplorerHandle } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { ProcessingOverlay } from '../components/ViewStates.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';

interface FileExplorerViewProps {
  orgId: string;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({ orgId }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileNode | null>(null);
  
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  const {
    files, loading, breadcrumbs,
    handleDeleteFiles, handleRenameFile, fetchFiles
  } = useFileExplorer({
    currentFolderId,
    searchTerm,
    viewMode
  });

  const handleNavigate = useCallback((folderId: string | null) => {
    setSelectedFileIds([]);
    setSearchParams(prev => {
      if (folderId) prev.set('folderId', folderId);
      else prev.delete('folderId');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const handleFileSelectForPreview = useCallback((file: FileNode | null) => {
    if (file && file.type !== FileType.FOLDER) {
        setSelectedFileForPreview(file);
        setIsPreviewOpen(true);
    }
  }, []);

  const handleToggleFileSelection = useCallback((fileId: string) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  }, []);

  const handleDownloadSingleFile = useCallback((file: FileNode) => {
    if (user && file.type !== FileType.FOLDER) {
      fileService.getFileSignedUrl(user, file.id).then(url => {
        window.open(url, '_blank');
      }).catch(err => console.error("Download failed:", err));
    }
  }, [user]);

  // PASSO 4: Regra de Exclusão para Analista (Lixo Digital)
  const handleQualityDelete = async () => {
    if (!user || selectedFileIds.length === 0) return;
    
    const targets = files.filter(f => selectedFileIds.includes(f.id));
    const canDeleteAll = targets.every(f => f.metadata?.status === QualityStatus.TO_DELETE);

    if (!canDeleteAll) {
      showToast("Apenas arquivos marcados como 'APAGAR' pelo cliente podem ser removidos.", "warning");
      return;
    }

    if (window.confirm(`Deseja remover permanentemente ${targets.length} arquivo(s) substituído(s)?`)) {
        try {
            await handleDeleteFiles(selectedFileIds);
            setSelectedFileIds([]);
        } catch (e) {
            showToast("Falha ao limpar arquivos.", "error");
        }
    }
  };

  const selectedFilesData = files.filter(f => selectedFileIds.includes(f.id));

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
      <FilePreviewModal 
        initialFile={selectedFileForPreview}
        allFiles={files.filter(f => f.type !== FileType.FOLDER)}
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onDownloadFile={handleDownloadSingleFile} 
      />

      {loading && <ProcessingOverlay message={t('files.processingFiles')} />}

      <ExplorerToolbar
        breadcrumbs={breadcrumbs}
        onNavigate={handleNavigate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUploadClick={() => {}} 
        onCreateFolderClick={() => {}}
        selectedCount={selectedFileIds.length}
        onDeleteSelected={handleQualityDelete} 
        onRenameSelected={() => {}}
        onDownloadSelected={() => {
           if (selectedFilesData.length === 1) handleDownloadSingleFile(selectedFilesData[0]);
        }}
        viewMode={viewMode}
        onViewChange={setViewMode}
        selectedFilesData={selectedFilesData}
        userRole={UserRole.QUALITY}
      />

      <FileExplorer 
        ref={fileExplorerRef}
        files={files} 
        loading={loading}
        currentFolderId={currentFolderId}
        searchTerm={searchTerm}
        breadcrumbs={breadcrumbs}
        selectedFileIds={selectedFileIds}
        onToggleFileSelection={handleToggleFileSelection}
        onNavigate={handleNavigate}
        onFileSelectForPreview={handleFileSelectForPreview}
        onDownloadFile={handleDownloadSingleFile}
        onRenameFile={() => {}}
        onDeleteFile={() => {}}
        viewMode={viewMode}
        userRole={UserRole.QUALITY}
      />
    </div>
  );
};