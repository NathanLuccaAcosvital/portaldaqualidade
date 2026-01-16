
import React from 'react';
import { ChevronRight, List, LayoutGrid, Search, UploadCloud, FolderPlus, Edit2, Download, Trash2, Home } from 'lucide-react';
import { BreadcrumbItem, FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';

interface ExplorerToolbarProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  onNavigate: (folderId: string | null) => void;
  breadcrumbs: BreadcrumbItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onRenameSelected: () => void;
  onDownloadSelected: () => void;
  selectedFilesData: FileNode[];
  userRole: UserRole;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ 
  viewMode, 
  onViewChange, 
  onNavigate, 
  breadcrumbs, 
  searchTerm, 
  onSearchChange,
  onUploadClick,
  onCreateFolderClick,
  selectedCount,
  onDeleteSelected,
  onRenameSelected,
  onDownloadSelected,
  selectedFilesData,
  userRole
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-slate-100 p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
      
      {/* Fluxo LTR de Navegação (Começa na Esquerda e progride para Direita) */}
      <div className="flex items-center gap-3 flex-1 min-w-0 w-full overflow-hidden justify-start">
        <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} t={t} />
      </div>

      <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
        <SearchInput searchTerm={searchTerm} onSearchChange={onSearchChange} t={t} />
        
        <div className="flex items-center gap-3">
          {selectedCount > 0 ? (
            <SelectedActions 
              count={selectedCount} 
              onDelete={onDeleteSelected} 
              onRename={onRenameSelected} 
              onDownload={onDownloadSelected}
              selectedFilesData={selectedFilesData}
              t={t}
              userRole={userRole}
            />
          ) : (
            <PrimaryActions 
              onUpload={onUploadClick} 
              onCreateFolder={onCreateFolderClick} 
              viewMode={viewMode} 
              onViewChange={onViewChange}
              t={t}
              userRole={userRole}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Breadcrumbs: React.FC<{ breadcrumbs: BreadcrumbItem[]; onNavigate: (id: string | null) => void, t: any }> = ({ breadcrumbs, onNavigate, t }) => (
  <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 pr-4" aria-label="Navegação de Pastas">
    {breadcrumbs.map((item, index) => {
      const isLast = index === breadcrumbs.length - 1;
      const isRoot = item.id === null;
      
      return (
        <div key={item.id || 'root'} className="flex items-center shrink-0">
          <button 
            onClick={() => onNavigate(item.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider whitespace-nowrap
              ${isLast 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'}
            `}
          >
            {isRoot && <Home size={14} className={isLast ? 'text-white' : 'text-blue-400'} />}
            {isRoot ? t('dashboard.kpi.libraryLabel') : item.name}
          </button>
          {!isLast && (
            <ChevronRight size={14} className="text-slate-300 mx-1" />
          )}
        </div>
      );
    })}
  </nav>
);

const SearchInput: React.FC<{ searchTerm: string; onSearchChange: (term: string) => void; t: any }> = ({ searchTerm, onSearchChange, t }) => (
  <div className="relative group max-w-xs hidden sm:block">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
    <input 
      type="text" 
      placeholder={t('files.searchPlaceholder')}
      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-tight w-full outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-slate-600" 
      value={searchTerm} 
      onChange={e => onSearchChange(e.target.value)} 
    />
  </div>
);

const PrimaryActions: React.FC<{ 
  onUpload: () => void; 
  onCreateFolder: () => void; 
  viewMode: 'grid' | 'list'; 
  onViewChange: (mode: 'grid' | 'list') => void; 
  t: any;
  userRole: UserRole;
}> = ({ 
  onUpload, onCreateFolder, viewMode, onViewChange, t, userRole 
}) => {
  const isClient = userRole === UserRole.CLIENT;
  return (
    <div className="flex items-center gap-2">
      {!isClient && (
        <>
          <button 
            onClick={onUpload} 
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-200"
            title={t('files.upload.button')}
          >
            <UploadCloud size={18} />
          </button>
          <button 
            onClick={onCreateFolder} 
            className="bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-xl transition-all shadow-lg"
            title={t('files.createFolder.button')}
          >
            <FolderPlus size={18} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
        </>
      )}
      
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => onViewChange('list')} 
          className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
        >
          <List size={16}/>
        </button>
        <button 
          onClick={() => onViewChange('grid')} 
          className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
        >
          <LayoutGrid size={16}/>
        </button>
      </div>
    </div>
  );
};

const SelectedActions: React.FC<{ 
  count: number; 
  onDelete: () => void; 
  onRename: () => void; 
  onDownload: () => void; 
  t: any; 
  selectedFilesData: FileNode[];
  userRole: UserRole;
}> = ({ count, onDelete, onRename, onDownload, t, selectedFilesData, userRole }) => {
  const isSingleFileSelected = count === 1 && selectedFilesData[0]?.type !== FileType.FOLDER;
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 animate-in zoom-in-95">
      <span className="text-[10px] font-black uppercase text-blue-700 mr-2">{count} selecionado</span>
      {!isClient && (
        <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
      )}
      {isSingleFileSelected && (
        <button onClick={onDownload} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"><Download size={16} /></button>
      )}
    </div>
  );
};
