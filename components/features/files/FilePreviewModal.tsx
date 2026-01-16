
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Download, Loader2, FileText, 
  ZoomIn, ZoomOut, CheckCircle2, XCircle, 
  Pencil, Square, Circle, Type, Eraser, 
  User, Calendar, ShieldCheck, 
  ChevronRight, Plus, Trash2, Undo2, Redo2, 
  FileCheck2, ImageDown
} from 'lucide-react';
import { FileNode, UserRole, QualityStatus } from '../../../types/index.ts';
import { fileService, partnerService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { FileStatusBadge } from './components/FileStatusBadge.tsx';
import { useToast } from '../../../context/notificationContext.tsx';

if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

type AnnotationType = 'pencil' | 'rect' | 'circle' | 'text';

interface Annotation {
  id: string;
  type: AnnotationType;
  color: string;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
}

// Fix: Added optional allFiles prop and updated onDownloadFile to support Promise<void> or void return types
export const FilePreviewModal: React.FC<{ 
  initialFile: FileNode | null; 
  allFiles?: FileNode[];
  isOpen: boolean; 
  onClose: () => void; 
  onDownloadFile: (file: FileNode) => void | Promise<void>; 
}> = ({ initialFile, allFiles, isOpen, onClose, onDownloadFile }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(0.85);
  const [isActioning, setIsActioning] = useState(false);
  
  const [rejectionMode, setRejectionMode] = useState(false);
  const [obs, setObs] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [newFlagInput, setNewFlagInput] = useState('');

  // Histórico de Desenhos
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [drawingTool, setDrawingTool] = useState<AnnotationType | 'none'>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);

  const isClient = user?.role === UserRole.CLIENT;
  const isMarkedForDelete = currentFile?.metadata?.status === QualityStatus.TO_DELETE;

  useEffect(() => {
    if (isOpen && initialFile) {
      setCurrentFile(initialFile);
      setAnnotations([]);
      setHistory([]);
      setHistoryStep(-1);
      setRejectionMode(false);
      setObs('');
      setSelectedFlags([]);
      if (user?.role === UserRole.CLIENT) partnerService.logFileView(user, initialFile);
    }
  }, [isOpen, initialFile, user]);

  useEffect(() => {
    if (currentFile && user && isOpen) {
      setLoading(true);
      fileService.getFileSignedUrl(user, currentFile.id).then(async (signedUrl) => {
          const loadingTask = (window as any).pdfjsLib.getDocument(signedUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setPageNum(1);
        }).catch(() => showToast("Falha ao descriptografar PDF", "error"))
        .finally(() => setLoading(false));
    }
  }, [currentFile, user, isOpen]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !annotationCanvasRef.current) return;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoom });
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const annCanvas = annotationCanvasRef.current;
    const annCtx = annCanvas.getContext('2d')!;
    
    canvas.width = annCanvas.width = viewport.width;
    canvas.height = annCanvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    drawStoredAnnotations(annCtx);
  }, [pdfDoc, pageNum, zoom, annotations]);

  useEffect(() => {
    if (pdfDoc) renderPage();
  }, [pdfDoc, pageNum, zoom, renderPage]);

  const drawStoredAnnotations = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    annotations.forEach(ann => drawAnnotation(ctx, ann));
  };

  const drawAnnotation = (ctx: CanvasRenderingContext2D, ann: Annotation) => {
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = 3;

    if (ann.type === 'pencil' && ann.points) {
      ctx.beginPath();
      ann.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (ann.type === 'rect' && ann.start && ann.end) {
      ctx.strokeRect(ann.start.x, ann.start.y, ann.end.x - ann.start.x, ann.end.y - ann.start.y);
    } else if (ann.type === 'circle' && ann.start && ann.end) {
      const radius = Math.sqrt(Math.pow(ann.end.x - ann.start.x, 2) + Math.pow(ann.end.y - ann.start.y, 2));
      ctx.beginPath();
      ctx.arc(ann.start.x, ann.start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (ann.type === 'text' && ann.start && ann.text) {
      ctx.font = 'bold 14px Inter';
      ctx.fillText(ann.text, ann.start.x, ann.start.y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (drawingTool === 'none' || !annotationCanvasRef.current) return;
    const rect = annotationCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingTool === 'text') {
      const txt = window.prompt("Anotação de Texto:");
      if (txt) {
        const newAnn: Annotation = { id: crypto.randomUUID(), type: 'text', color: '#ef4444', start: { x, y }, text: txt };
        pushToHistory([...annotations, newAnn]);
      }
      return;
    }

    setIsDrawing(true);
    setCurrentAnnotation({
      id: crypto.randomUUID(),
      type: drawingTool,
      color: '#ef4444',
      start: { x, y },
      points: drawingTool === 'pencil' ? [{ x, y }] : []
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentAnnotation || !annotationCanvasRef.current) return;
    const rect = annotationCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingTool === 'pencil') {
      setCurrentAnnotation(prev => ({ ...prev!, points: [...(prev!.points || []), { x, y }] }));
    } else {
      setCurrentAnnotation(prev => ({ ...prev!, end: { x, y } }));
    }

    const ctx = annotationCanvasRef.current.getContext('2d')!;
    drawStoredAnnotations(ctx);
    drawAnnotation(ctx, { ...currentAnnotation, end: { x, y } });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentAnnotation) {
      pushToHistory([...annotations, currentAnnotation]);
    }
    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  const pushToHistory = (newSet: Annotation[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newSet);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setAnnotations(newSet);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setAnnotations(history[historyStep - 1]);
    } else if (historyStep === 0) {
      setHistoryStep(-1);
      setAnnotations([]);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setAnnotations(history[historyStep + 1]);
    }
  };

  const handleDownloadAnnotated = () => {
    if (!canvasRef.current || !annotationCanvasRef.current) return;
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasRef.current.width;
    compositeCanvas.height = canvasRef.current.height;
    const ctx = compositeCanvas.getContext('2d')!;
    ctx.drawImage(canvasRef.current, 0, 0);
    ctx.drawImage(annotationCanvasRef.current, 0, 0);
    
    const link = document.createElement('a');
    link.download = `REVISAO-${currentFile?.name}.png`;
    link.href = compositeCanvas.toDataURL('image/png');
    link.click();
  };

  const handleAction = async (status: QualityStatus) => {
    if (!currentFile || !user) return;
    setIsActioning(true);
    try {
      await partnerService.submitClientFeedback(user, currentFile, status, obs, selectedFlags, annotations);
      showToast("Veredito transmitido com sucesso.", 'success');
      onClose();
    } catch {
      showToast("Erro ao processar veredito.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  if (!isOpen || !currentFile) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-[#020617] flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* HEADER SIDE-BY-SIDE */}
      <header className="h-20 shrink-0 bg-slate-900 border-b border-white/10 flex items-center justify-between px-8 z-50 shadow-xl">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <FileText className="text-blue-400" size={24} />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-black text-base tracking-tight truncate leading-none mb-1">{currentFile.name}</h2>
            <div className="flex items-center gap-3">
               <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Estação de Revisão B2B</span>
               <div className="w-1 h-1 rounded-full bg-slate-700" />
               <FileStatusBadge status={currentFile.metadata?.status} />
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"><X size={28} /></button>
      </header>

      <div className="flex-1 flex min-h-0">
        
        {/* LADO ESQUERDO: AUDITORIA VISUAL */}
        <div className="flex-1 flex flex-col bg-[#0f172a] relative min-w-0 border-r border-white/5">
          
          {/* TOOLBAR FLUTUANTE */}
          {isClient && !isMarkedForDelete && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] shadow-2xl z-40">
              <ToolBtn active={drawingTool === 'pencil'} onClick={() => setDrawingTool('pencil')} icon={Pencil} title="Desenho Livre" />
              <ToolBtn active={drawingTool === 'rect'} onClick={() => setDrawingTool('rect')} icon={Square} title="Retângulo" />
              <ToolBtn active={drawingTool === 'circle'} onClick={() => setDrawingTool('circle')} icon={Circle} title="Círculo" />
              <ToolBtn active={drawingTool === 'text'} onClick={() => setDrawingTool('text')} icon={Type} title="Anotar Texto" />
              <div className="w-px h-6 bg-white/10 mx-1.5" />
              <ToolBtn onClick={undo} disabled={historyStep < 0} icon={Undo2} title="Desfazer" />
              <ToolBtn onClick={redo} disabled={historyStep >= history.length - 1} icon={Redo2} title="Refazer" />
              <div className="w-px h-6 bg-white/10 mx-1.5" />
              <ToolBtn onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} icon={ZoomOut} />
              <div className="px-2 text-[10px] font-black text-white w-12 text-center">{Math.round(zoom * 100)}%</div>
              <ToolBtn onClick={() => setZoom(z => Math.min(2, z + 0.1))} icon={ZoomIn} />
              <div className="w-px h-6 bg-white/10 mx-1.5" />
              <ToolBtn onClick={() => {
                setAnnotations([]); setHistory([]); setHistoryStep(-1);
              }} icon={Eraser} danger title="Limpar Tudo" />
            </div>
          )}

          <div className="flex-1 overflow-auto custom-scrollbar p-12 flex justify-center items-start">
            <div className="relative bg-white shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-sm">
              {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}
              <canvas ref={canvasRef} className="block" />
              <canvas 
                ref={annotationCanvasRef} 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`absolute top-0 left-0 z-10 ${drawingTool !== 'none' ? 'cursor-crosshair' : 'pointer-events-none'}`} 
              />
            </div>
          </div>
        </div>

        {/* LADO DIREITO: HUB DE DECISÃO */}
        <aside className="w-[450px] shrink-0 bg-white flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50">
          <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
            
            <section className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Identificação do Ativo</h4>
              <div className="grid grid-cols-1 gap-4">
                <DataCard icon={User} label="Responsável Emissão" value="Engenharia Aços Vital" />
                <DataCard icon={Calendar} label="Data da Transmissão" value={new Date(currentFile.updatedAt).toLocaleDateString()} />
                <DataCard icon={ShieldCheck} label="Estado de Compliance" component={<FileStatusBadge status={currentFile.metadata?.status} />} />
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Veredito Técnico</h4>
               
               {isMarkedForDelete ? (
                   <div className="p-8 bg-red-50 rounded-[2.5rem] border-2 border-red-100 text-center space-y-6">
                       <Trash2 size={32} className="mx-auto text-red-600" />
                       <div className="space-y-2">
                           <p className="text-sm font-black text-red-800 uppercase">Aguardando Exclusão</p>
                           <p className="text-xs text-red-600/70 font-medium leading-relaxed">Você sinalizou este arquivo como obsoleto ou inválido para o lote.</p>
                       </div>
                       <button 
                         onClick={() => handleAction(QualityStatus.PENDING)}
                         disabled={isActioning}
                         className="w-full py-4 bg-white border-2 border-red-200 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                       >
                         <Undo2 size={16} /> Restaurar Documento
                       </button>
                   </div>
               ) : !rejectionMode ? (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleAction(QualityStatus.APPROVED)}
                          disabled={isActioning}
                          className="flex flex-col items-center justify-center gap-3 p-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                        >
                          <CheckCircle2 size={32} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Aprovar</span>
                        </button>
                        <button 
                          onClick={() => setRejectionMode(true)}
                          disabled={isActioning}
                          className="flex flex-col items-center justify-center gap-3 p-8 bg-red-50 text-red-600 border-2 border-red-100 hover:border-red-500 rounded-[2rem] transition-all active:scale-95 group"
                        >
                          <XCircle size={32} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Contestar</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => handleAction(QualityStatus.TO_DELETE)}
                        className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-[4px] hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-3"
                    >
                        <Trash2 size={16} /> Solicitar Descarte deste Arquivo
                    </button>
                 </div>
               ) : (
                 <div className="space-y-8 animate-in slide-in-from-right-6 duration-300">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Flags de Divergência</p>
                      <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Descreva o erro (Ex: Lote errado)"
                            value={newFlagInput}
                            onChange={(e) => setNewFlagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (newFlagInput.trim() && setSelectedFlags(p => [...new Set([...p, newFlagInput.trim()])]), setNewFlagInput(''))}
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-red-400"
                        />
                        <button onClick={() => { if(newFlagInput.trim()) setSelectedFlags(p => [...new Set([...p, newFlagInput.trim()])]); setNewFlagInput(''); }} className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"><Plus size={20}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedFlags.map(flag => (
                          <span key={flag} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                            {flag}
                            <button onClick={() => setSelectedFlags(f => f.filter(x => x !== flag))}><X size={12}/></button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações Detalhadas</label>
                      <textarea 
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        placeholder="Justifique tecnicamente para a equipe Vital..."
                        className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-xs font-medium outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setRejectionMode(false)} className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase">Voltar</button>
                      <button 
                        onClick={() => handleAction(QualityStatus.REJECTED)}
                        disabled={!obs.trim() || isActioning}
                        className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95"
                      >
                        Enviar Contestação
                      </button>
                    </div>
                 </div>
               )}
            </section>
          </div>

          {/* ÁREA DE DOWNLOAD DUPLA */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-4">
             <button 
                onClick={handleDownloadAnnotated}
                disabled={annotations.length === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-30 disabled:grayscale"
             >
                <ImageDown size={18} /> Baixar Com Anotações
             </button>
             <button 
                onClick={() => onDownloadFile(currentFile)} 
                className="w-full py-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center gap-3 rounded-2xl font-black text-[9px] uppercase tracking-widest"
             >
                <Download size={16} /> Baixar PDF Original (Limpo)
             </button>
             <div className="text-center pt-2">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[4px]">Vital SGQ Industrial v4.5</span>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ToolBtn = ({ active, onClick, icon: Icon, title, danger, disabled }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    title={title}
    className={`p-3 rounded-2xl transition-all ${
        active 
        ? 'bg-blue-600 text-white shadow-lg scale-110' 
        : danger 
        ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
        : disabled
        ? 'text-slate-700 opacity-20'
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`}
  >
    <Icon size={18} />
  </button>
);

const DataCard = ({ icon: Icon, label, value, component }: any) => (
  <div className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
      <Icon size={20} />
    </div>
    <div className="min-w-0 flex-1">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
       {component ? component : <p className="text-xs font-bold text-slate-800 truncate">{value}</p>}
    </div>
    <ChevronRight size={16} className="text-slate-200" />
  </div>
);
