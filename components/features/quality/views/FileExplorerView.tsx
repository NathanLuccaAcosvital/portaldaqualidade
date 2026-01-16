
import React, { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, UserRole, QualityStatus } from '../../../../types/index.ts';
import { useFileExplorer } from '../../files/hooks/useFileExplorer.ts';
import { FileExplorer, FileExplorerHandle } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { FilePreviewModal } from '../../files/FilePreviewModal.tsx';
import { CreateFolderModal } from '../../files/modals/CreateFolderModal.tsx';
import { RenameModal } from '../../files/modals/RenameModal.tsx';
import { UploadFileModal } from '../../files/modals/UploadFileModal.tsx';
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
  
  // Estados para Operações de Arquivos
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileNode | null>(null);
  
  // Estados para Upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  const {
    files, loading, breadcrumbs,
    handleDeleteFiles, handleRenameFile, handleCreateFolder, handleUploadFile
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

  const handleUploadAction = async (file: File, fileName: string) => {
    setIsUploading(true);
    try {
      // Se estivermos em uma visão de cliente específica, usamos o orgId dela
      // Caso contrário (visão global), usamos a organização do próprio usuário (Vital)
      const targetOrg = orgId && orgId !== 'global' ? orgId : user?.organizationId;
      
      if (!targetOrg) {
        throw new Error("Organização alvo não identificada.");
      }

      await handleUploadFile(file, fileName, currentFolderId);
      setIsUploadModalOpen(false);
    } catch (error: any) {
      showToast(error.message || "Falha ao transmitir arquivo para o servidor.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolderAction = async (folderName: string) => {
    setIsCreatingFolder(true);
    try {
      await handleCreateFolder(folderName, currentFolderId); 
      setIsCreateFolderModalOpen(false);
    } catch (error) {
      showToast("Falha ao registrar nova pasta no sistema.", "error");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleRenameAction = async (newName: string) => {
    if (!fileToRename) return;
    setIsRenaming(true);
    try {
      await handleRenameFile(fileToRename.id, newName);
      setIsRenameModalOpen(false);
      setFileToRename(null);
    } catch (error) {
      showToast("Erro ao renomear item.", "error");
    } finally {
      setIsRenaming(false);
    }
  };

  const triggerRename = (file: FileNode) => {
    setFileToRename(file);
    setIsRenameModalOpen(true);
  };

  const handleQualityDelete = async () => {
    if (!user || selectedFileIds.length === 0) return;
    
    const targets = files.filter(f => selectedFileIds.includes(f.id));
    const canDeleteAll = targets.every(f => f.metadata?.status === QualityStatus.TO_DELETE || f.type === FileType.FOLDER);

    if (!canDeleteAll) {
      showToast("Apenas pastas vazias ou arquivos marcados como 'APAGAR' podem ser removidos.", "warning");
      return;
    }

    if (window.confirm(`Deseja remover permanentemente ${targets.length} item(s)?`)) {
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

      <UploadFileModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadAction}
        isUploading={isUploading}
        currentFolderId={currentFolderId}
      />

      <CreateFolderModal 
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreateFolderAction}
        isCreating={isCreatingFolder}
      />

      <RenameModal 
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={handleRenameAction}
        isRenaming={isRenaming}
        currentName={fileToRename?.name || ''}
      />

      {(loading || isCreatingFolder || isRenaming || isUploading) && (
        <ProcessingOverlay message={
          isCreatingFolder ? "Sincronizando nova estrutura..." : 
          isRenaming ? "Atualizando identificador..." : 
          isUploading ? "Transmitindo arquivo para nuvem..." :
          t('files.processingFiles')
        } />
      )}

      <ExplorerToolbar
        breadcrumbs={breadcrumbs}
        onNavigate={handleNavigate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUploadClick={() => setIsUploadModalOpen(true)} 
        onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
        selectedCount={selectedFileIds.length}
        onDeleteSelected={handleQualityDelete} 
        onRenameSelected={() => selectedFilesData.length === 1 && triggerRename(selectedFilesData[0])}
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
        onRenameFile={triggerRename}
        onDeleteFile={() => {}}
        viewMode={viewMode}
        userRole={UserRole.QUALITY}
      />
    </div>
  );
};
