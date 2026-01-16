
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Download, Loader2, FileText, 
  ZoomIn, ZoomOut, CheckCircle2, XCircle, 
  Pencil, Square, Circle, Eraser, 
  User, Calendar, ShieldCheck, 
  ChevronRight, Undo2, Redo2, 
  ImageDown, ArrowUpRight, Trash2, MessageSquare, Plus,
  Hand, ChevronLeft, ChevronRight as ChevronRightIcon,
  Type, Highlighter, Stamp, Layers, Maximize2, MoreHorizontal,
  ChevronUp, Camera, Clock, ClipboardCheck, Tag, Info
} from 'lucide-react';
import { FileNode, UserRole, QualityStatus, SteelBatchMetadata } from '../../../types/index.ts';
import { fileService, qualityService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { FileStatusBadge } from './components/FileStatusBadge.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';

if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

type AnnotationType = 'pencil' | 'rect' | 'circle' | 'arrow' | 'hand' | 'text' | 'highlight' | 'stamp_ok' | 'stamp_no';
interface Point { x: number; y: number; }
interface Annotation {
  id: string;
  type: Exclude<AnnotationType, 'hand'>;
  color: string;
  normalizedPoints?: Point[];
  normalizedStart?: Point;
  normalizedEnd?: Point;
  text?: string;
  page: number;
}

export const FilePreviewModal: React.FC<{ 
  initialFile: FileNode | null; 
  allFiles?: FileNode[];
  isOpen: boolean; 
  onClose: () => void; 
  onDownloadFile: (file: FileNode) => void | Promise<void>; 
}> = ({ initialFile, isOpen, onClose, onDownloadFile }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [loading, setLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [isActioning, setIsActioning] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isOthersOpen, setIsOthersOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [drawingTool, setDrawingTool] = useState<AnnotationType | 'eraser'>('hand');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);
  const [textMode, setTextMode] = useState<{ x: number, y: number } | null>(null);
  const [inputText, setInputText] = useState('');

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const normalize = (val: number, max: number) => val / max;
  const denormalize = (val: number, max: number) => val * max;

  const getCanvasMousePos = (e: React.MouseEvent): Point => {
    const rect = annotationCanvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    if (isOpen && initialFile) {
      setCurrentFile(initialFile);
      setAnnotations([]);
      setDrawingTool('hand');
      setZoom(1.2);
      setPageNum(1);
      setIsOthersOpen(false);
    }
  }, [isOpen, initialFile]);

  useEffect(() => {
    if (currentFile && user && isOpen) {
      setLoading(true);
      fileService.getFileSignedUrl(user, currentFile.id).then(async (signedUrl) => {
          const loadingTask = (window as any).pdfjsLib.getDocument(signedUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setPageNum(1);
        }).catch(() => showToast("Erro ao carregar PDF", "error"))
        .finally(() => setLoading(false));
    }
  }, [currentFile, user, isOpen]);

  const renderPdfPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoom });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (annotationCanvasRef.current) {
        annotationCanvasRef.current.width = viewport.width;
        annotationCanvasRef.current.height = viewport.height;
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, pageNum, zoom]);

  useEffect(() => {
    if (pdfDoc) renderPdfPage();
  }, [pdfDoc, pageNum, zoom, renderPdfPage]);

  const drawAnnotations = useCallback(() => {
    const annCanvas = annotationCanvasRef.current;
    if (!annCanvas) return;
    const ctx = annCanvas.getContext('2d')!;
    const { width, height } = annCanvas;
    ctx.clearRect(0, 0, width, height);
    
    const pageAnns = annotations.filter(a => a.page === pageNum);
    const allToDraw = tempAnnotation ? [...pageAnns, tempAnnotation] : pageAnns;

    allToDraw.forEach(ann => {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.type === 'highlight' ? 20 : 3;
        ctx.lineCap = 'round';
        ctx.globalAlpha = ann.type === 'highlight' ? 0.35 : 1.0;

        if (ann.type === 'pencil' || ann.type === 'highlight') {
            if (ann.normalizedPoints) {
                ctx.beginPath();
                ann.normalizedPoints.forEach((p, i) => {
                    const x = denormalize(p.x, width), y = denormalize(p.y, height);
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                });
                ctx.stroke();
            }
        } else if ((ann.type === 'stamp_ok' || ann.type === 'stamp_no') && ann.normalizedStart) {
            ctx.globalAlpha = 0.85;
            const x = denormalize(ann.normalizedStart.x, width), y = denormalize(ann.normalizedStart.y, height);
            const isOk = ann.type === 'stamp_ok';
            ctx.fillStyle = isOk ? '#10b981' : '#ef4444';
            ctx.beginPath(); ctx.roundRect(x - 65, y - 22, 130, 44, 4); ctx.fill();
            ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = 'white'; ctx.font = 'black 13px Inter'; ctx.textAlign = 'center';
            ctx.fillText(isOk ? 'APROVADO' : 'REPROVADO', x, y + 5);
            ctx.textAlign = 'start';
        } else if (ann.type === 'text' && ann.normalizedStart && ann.text) {
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = ann.color || '#ef4444';
            ctx.font = `bold ${Math.max(13, 15 * zoom)}px Inter`;
            ctx.fillText(ann.text, denormalize(ann.normalizedStart.x, width), denormalize(ann.normalizedStart.y, height));
        } else if (ann.type === 'rect' && ann.normalizedStart && ann.normalizedEnd) {
            const x1 = denormalize(ann.normalizedStart.x, width), y1 = denormalize(ann.normalizedStart.y, height);
            const x2 = denormalize(ann.normalizedEnd.x, width), y2 = denormalize(ann.normalizedEnd.y, height);
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
    });
    ctx.globalAlpha = 1.0;
  }, [annotations, tempAnnotation, pageNum, zoom]);

  useEffect(() => {
    drawAnnotations();
  }, [annotations, tempAnnotation, drawAnnotations]);

  const handleWheel = (e: React.WheelEvent) => {
    if (drawingTool !== 'hand' && !e.ctrlKey) return; 
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(prev => Math.min(5, Math.max(0.3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (drawingTool === 'hand') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX, y: e.clientY,
        scrollLeft: viewportRef.current?.scrollLeft || 0,
        scrollTop: viewportRef.current?.scrollTop || 0
      });
      return;
    }
    const pos = getCanvasMousePos(e);
    const w = annotationCanvasRef.current!.width, h = annotationCanvasRef.current!.height;
    const startNorm = { x: normalize(pos.x, w), y: normalize(pos.y, h) };

    if (drawingTool === 'text') { setTextMode(pos); return; }
    if (drawingTool === 'stamp_ok' || drawingTool === 'stamp_no') {
        setAnnotations(prev => [...prev, { id: crypto.randomUUID(), type: drawingTool, color: '', normalizedStart: startNorm, page: pageNum }]);
        return;
    }
    if (drawingTool === 'eraser') {
        setAnnotations(prev => prev.filter(ann => {
            if (!ann.normalizedStart) return true;
            const dx = denormalize(ann.normalizedStart.x, w) - pos.x, dy = denormalize(ann.normalizedStart.y, h) - pos.y;
            return Math.sqrt(dx*dx + dy*dy) > 40;
        }));
        return;
    }

    setIsDrawing(true);
    setTempAnnotation({
      id: crypto.randomUUID(), type: drawingTool as any, color: drawingTool === 'highlight' ? '#fbbf24' : '#ef4444',
      normalizedStart: startNorm, normalizedEnd: startNorm, page: pageNum,
      normalizedPoints: (drawingTool === 'pencil' || drawingTool === 'highlight') ? [startNorm] : []
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && viewportRef.current) {
      const dx = e.clientX - panStart.x, dy = e.clientY - panStart.y;
      viewportRef.current.scrollLeft = panStart.scrollLeft - dx;
      viewportRef.current.scrollTop = panStart.scrollTop - dy;
      return;
    }
    if (!isDrawing || !tempAnnotation) return;
    const pos = getCanvasMousePos(e);
    const w = annotationCanvasRef.current!.width, h = annotationCanvasRef.current!.height;
    const currentNorm = { x: normalize(pos.x, w), y: normalize(pos.y, h) };
    if (tempAnnotation.type === 'pencil' || tempAnnotation.type === 'highlight') {
      setTempAnnotation(prev => ({...prev!, normalizedPoints: [...(prev!.normalizedPoints || []), currentNorm]}));
    } else {
      setTempAnnotation(prev => ({...prev!, normalizedEnd: currentNorm}));
    }
  };

  const handleMouseUp = () => {
    if (isPanning) { setIsPanning(false); return; }
    if (isDrawing && tempAnnotation) setAnnotations(prev => [...prev, tempAnnotation]);
    setIsDrawing(false); setTempAnnotation(null);
  };

  const submitText = () => {
    if (!textMode || !inputText.trim()) { setTextMode(null); setInputText(''); return; }
    const w = annotationCanvasRef.current!.width, h = annotationCanvasRef.current!.height;
    setAnnotations(prev => [...prev, {
        id: crypto.randomUUID(), type: 'text', color: '#ef4444', 
        normalizedStart: { x: normalize(textMode.x, w), y: normalize(textMode.y, h) },
        text: inputText, page: pageNum
    }]);
    setTextMode(null); setInputText('');
  };

  const handleAction = async (status: QualityStatus, type: 'DOCUMENTAL' | 'PHYSICAL') => {
    if (!currentFile || !user) return;
    setIsActioning(true);
    try {
      const updatedMetadata: SteelBatchMetadata = { ...currentFile.metadata! };
      const timestamp = new Date().toISOString();

      if (type === 'DOCUMENTAL') {
        await qualityService.submitVeredict(user, currentFile, status);
        updatedMetadata.status = status;
        updatedMetadata.inspectedAt = timestamp;
        updatedMetadata.inspectedBy = user.name;
      } else {
        const { error } = await supabase.from('files').update({
          metadata: {
            ...updatedMetadata,
            physicalStatus: status,
            physicalInspectedAt: timestamp,
            physicalInspectedBy: user.name
          }
        }).eq('id', currentFile.id);
        if (error) throw error;
        updatedMetadata.physicalStatus = status;
        updatedMetadata.physicalInspectedAt = timestamp;
        updatedMetadata.physicalInspectedBy = user.name;
      }

      showToast(`Veredito ${type} registrado como ${status}`, 'success');
      setCurrentFile(prev => prev ? ({ ...prev, metadata: updatedMetadata }) : null);
    } catch (err) {
      showToast("Falha ao salvar veredito.", "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentFile || !user) return;
    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `evidence/${currentFile.ownerId}/${currentFile.id}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('certificates').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('certificates').getPublicUrl(path);

      const updatedMetadata = { ...currentFile.metadata!, physicalEvidenceUrl: publicUrl };
      await supabase.from('files').update({ metadata: updatedMetadata }).eq('id', currentFile.id);
      setCurrentFile(prev => prev ? ({ ...prev, metadata: updatedMetadata }) : null);
      showToast("Evidência fotográfica registrada!", "success");
    } catch (err) {
      showToast("Erro ao carregar foto.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (!isOpen || !currentFile) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-[#020617] flex flex-col animate-in fade-in duration-300 overflow-hidden font-sans text-slate-200">
      <header className="h-16 shrink-0 bg-[#081437]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400"><FileText size={20} /></div>
          <div>
            <h2 className="text-white font-black text-xs truncate max-w-xs">{currentFile.name}</h2>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[3px]">Protocolo Técnico Vital</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setShowThumbnails(!showThumbnails)} className={`p-2 rounded-lg transition-all ${showThumbnails ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}><Layers size={18}/></button>
            <div className="w-px h-6 bg-white/5 mx-2" />
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-lg"><X size={20} /></button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {showThumbnails && (
            <aside className="w-44 bg-[#040a1d] border-r border-white/5 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar animate-in slide-in-from-left duration-300">
                {Array.from({ length: numPages }).map((_, i) => (
                    <button key={i} onClick={() => setPageNum(i + 1)} className={`aspect-[3/4] w-full rounded-lg border-2 transition-all flex items-center justify-center font-black text-xs ${pageNum === i + 1 ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/5 bg-white/5 text-slate-600'}`}>
                        {i + 1}
                    </button>
                ))}
            </aside>
        )}

        <div className="flex-1 flex flex-col bg-[#0f172a] relative min-w-0 overflow-hidden">
          <div 
            ref={viewportRef}
            className={`flex-1 overflow-auto custom-scrollbar bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] ${drawingTool === 'hand' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'}`}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}
          >
            <div className="inline-flex min-w-full min-h-full items-start justify-center p-20">
              <div className="relative bg-white shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm">
                {loading && <div className="absolute inset-0 bg-[#081437]/40 flex items-center justify-center z-50 backdrop-blur-sm"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}
                <canvas ref={canvasRef} className="block pointer-events-none" />
                <canvas ref={annotationCanvasRef} className="absolute top-0 left-0 z-10 pointer-events-none" />
                {textMode && (
                    <div className="absolute z-[100] p-2 bg-slate-900 border border-blue-500 rounded-xl shadow-2xl" style={{ left: textMode.x, top: textMode.y }}>
                        <input 
                            ref={textInputRef} autoFocus 
                            className="bg-transparent border-none outline-none text-white text-xs font-bold min-w-[200px]" 
                            placeholder="Escreva sua observação..." 
                            value={inputText} onChange={e => setInputText(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && submitText()} 
                            onBlur={submitText} 
                        />
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#081437]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl shadow-2xl z-[100] animate-in slide-in-from-bottom-4">
              <ToolBtn active={drawingTool === 'hand'} onClick={() => { setDrawingTool('hand'); setIsOthersOpen(false); }} icon={Hand} label="Navegar" />
              <div className="w-px h-6 bg-white/10 mx-1" />
              <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 items-center">
                  <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-10"><ChevronLeft size={16}/></button>
                  <span className="px-3 text-[10px] font-black text-white min-w-[50px] text-center tracking-tighter">{pageNum} / {numPages}</span>
                  <button onClick={() => setPageNum(p => Math.min(numPages, p + 1))} disabled={pageNum >= numPages} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-10"><ChevronRightIcon size={16}/></button>
              </div>

              <div className="hidden xl:flex items-center gap-1.5">
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ToolBtn active={drawingTool === 'pencil'} onClick={() => setDrawingTool('pencil')} icon={Pencil} label="Lápis" />
                <ToolBtn active={drawingTool === 'highlight'} onClick={() => setDrawingTool('highlight')} icon={Highlighter} label="Grifar" />
                <ToolBtn active={drawingTool === 'text'} onClick={() => setDrawingTool('text')} icon={Type} label="Texto" />
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ToolBtn active={drawingTool === 'stamp_ok'} onClick={() => setDrawingTool('stamp_ok')} icon={Stamp} label="APROVAR" success />
                <ToolBtn active={drawingTool === 'stamp_no'} onClick={() => setDrawingTool('stamp_no')} icon={Stamp} label="REPROVAR" danger />
                <ToolBtn active={drawingTool === 'eraser'} onClick={() => setDrawingTool('eraser')} icon={Eraser} label="Apagar" />
              </div>

              <div className="xl:hidden relative">
                <button onClick={() => setIsOthersOpen(!isOthersOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isOthersOpen ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                  <MoreHorizontal size={16} /> <span className="text-[10px] font-black uppercase">Outros</span>
                </button>
                {isOthersOpen && (
                  <div className="absolute bottom-full left-0 mb-4 w-44 bg-[#081437]/98 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 shadow-2xl animate-in slide-in-from-bottom-2 flex flex-col gap-1">
                     <ToolBtnMenu active={drawingTool === 'pencil'} onClick={() => { setDrawingTool('pencil'); setIsOthersOpen(false); }} icon={Pencil} label="Lápis" />
                     <ToolBtnMenu active={drawingTool === 'highlight'} onClick={() => { setDrawingTool('highlight'); setIsOthersOpen(false); }} icon={Highlighter} label="Grifar" />
                     {/* Fix: Replaced undefined 'Texto' icon with 'Type' and added missing 'label' prop */}
                     <ToolBtnMenu active={drawingTool === 'text'} onClick={() => { setDrawingTool('text'); setIsOthersOpen(false); }} icon={Type} label="Texto" />
                     <ToolBtnMenu active={drawingTool === 'stamp_ok'} onClick={() => { setDrawingTool('stamp_ok'); setIsOthersOpen(false); }} icon={Stamp} label="Selo OK" success />
                     <ToolBtnMenu active={drawingTool === 'stamp_no'} onClick={() => { setDrawingTool('stamp_no'); setIsOthersOpen(false); }} icon={Stamp} label="Selo Falha" danger />
                     <ToolBtnMenu active={drawingTool === 'eraser'} onClick={() => { setDrawingTool('eraser'); setIsOthersOpen(false); }} icon={Eraser} label="Borracha" />
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-white/10 mx-1" />
              <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                  <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1.5 text-slate-400 hover:text-white"><ZoomOut size={14}/></button>
                  <button onClick={() => setZoom(z => Math.min(5, z + 0.2))} className="p-1.5 text-slate-400 hover:text-white"><ZoomIn size={14}/></button>
              </div>
          </div>
        </div>

        {/* PAINEL DE AUDITORIA REFORMULADO (LADO DIREITO) */}
        <aside className="hidden lg:flex w-[400px] shrink-0 bg-white flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.08)] z-50">
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* 1. AUDITORIA DOCUMENTAL (VITAL) */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-4 w-1 bg-blue-600 rounded-full" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Protocolo Técnico</h4>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Documental</span>
                  <FileStatusBadge status={currentFile.metadata?.status} />
                </div>

                <div className="pt-4 border-t border-slate-200/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-slate-200 shadow-sm"><ShieldCheck size={18}/></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analista Responsável</p>
                      <p className="text-sm font-bold text-slate-800 leading-none mt-1">{currentFile.metadata?.inspectedBy || 'Sincronizando...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm"><Clock size={16}/></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data de Emissão</p>
                      <p className="text-[11px] font-bold text-slate-600 leading-none mt-1">
                        {currentFile.metadata?.inspectedAt ? new Date(currentFile.metadata.inspectedAt).toLocaleString() : '--/--/----'}
                      </p>
                    </div>
                  </div>
                </div>

                {user?.role !== UserRole.CLIENT && (
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4">
                    <button onClick={() => handleAction(QualityStatus.APPROVED, 'DOCUMENTAL')} className="py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all">Aprovar</button>
                    <button onClick={() => handleAction(QualityStatus.REJECTED, 'DOCUMENTAL')} className="py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-all">Recusar</button>
                  </div>
                )}
              </div>
            </section>

            {/* 2. AUDITORIA FÍSICA (CLIENTE) */}
            <section className="pt-10 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-4 w-1 bg-orange-500 rounded-full" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Conferência Cliente</h4>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspeção Visual</span>
                  <FileStatusBadge status={currentFile.metadata?.physicalStatus || QualityStatus.PENDING} />
                </div>

                {currentFile.metadata?.physicalInspectedBy && (
                   <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-orange-500" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auditado por</p>
                          <p className="text-xs font-bold text-slate-800 truncate">{currentFile.metadata.physicalInspectedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data Resposta</p>
                          <p className="text-[10px] font-bold text-slate-600">{new Date(currentFile.metadata.physicalInspectedAt || '').toLocaleString()}</p>
                        </div>
                      </div>
                   </div>
                )}

                {currentFile.metadata?.physicalEvidenceUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-black">
                    <img src={currentFile.metadata.physicalEvidenceUrl} alt="Evidência" className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                       <p className="text-[8px] font-black text-white/70 uppercase tracking-widest">Foto do Recebimento</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                    <Camera size={24} className="mx-auto text-slate-300 mb-2" />
                    <button onClick={() => photoInputRef.current?.click()} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Anexar Foto do Lote</button>
                    <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAction(QualityStatus.APPROVED, 'PHYSICAL')} className="flex flex-col items-center gap-2 p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all group">
                    <CheckCircle2 size={20} /> <span className="text-[9px] font-black uppercase">Aprovar Material</span>
                  </button>
                  <button onClick={() => handleAction(QualityStatus.REJECTED, 'PHYSICAL')} className="flex flex-col items-center gap-2 p-4 bg-white border border-red-200 text-red-600 rounded-2xl hover:border-red-500 transition-all group">
                    <XCircle size={20} /> <span className="text-[9px] font-black uppercase">Recusar Material</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. DADOS TÉCNICOS DO LOTE */}
            <section className="pt-10 border-t border-slate-100 space-y-6 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-1 bg-slate-800 rounded-full" />
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[3px]">Rastreabilidade</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lote / Corrida</p>
                        <p className="text-xs font-black text-slate-800 font-mono">{currentFile.metadata?.batchNumber || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Classe Mat.</p>
                        <p className="text-xs font-black text-slate-800">{currentFile.metadata?.grade || 'N/A'}</p>
                    </div>
                </div>
            </section>
          </div>

          <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-2">
             <button onClick={() => {
                const composite = document.createElement('canvas');
                composite.width = canvasRef.current!.width; composite.height = canvasRef.current!.height;
                const ctx = composite.getContext('2d')!;
                ctx.drawImage(canvasRef.current!, 0, 0); ctx.drawImage(annotationCanvasRef.current!, 0, 0);
                const link = document.createElement('a'); link.download = `REVISAO-${currentFile?.name}.png`;
                link.href = composite.toDataURL('image/png'); link.click();
             }} className="w-full py-4 bg-[#081437] text-white rounded-xl font-black text-[10px] uppercase tracking-[3px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                <ImageDown size={18} /> Exportar Laudo PNG
             </button>
             <button onClick={() => onDownloadFile(currentFile)} className="w-full py-3 text-slate-500 hover:text-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                <Download size={14} className="inline mr-2" /> Download Original (PDF)
             </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ToolBtn = ({ active, onClick, icon: Icon, label, success, danger }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg scale-105' : success ? 'text-emerald-400 hover:bg-emerald-500/10' : danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <Icon size={16} />
    <span className="hidden xl:flex text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ToolBtnMenu = ({ active, onClick, icon: Icon, label, success, danger }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left ${active ? 'bg-blue-600 text-white shadow-lg' : success ? 'text-emerald-400 hover:bg-emerald-500/10' : danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-white/10'}`}>
    <Icon size={16} /> <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);
