
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="text-center space-y-6 max-w-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 animate-pulse"></div>
            <ShieldAlert size={80} className="text-slate-900 relative z-10 mx-auto" />
        </div>
        
        <div className="space-y-2">
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter">404</h1>
            <h2 className="text-xl font-bold text-slate-800">Recurso não localizado</h2>
            <p className="text-slate-500 text-sm leading-relaxed">O caminho solicitado não existe ou você não possui as permissões necessárias para acessá-lo.</p>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all uppercase text-[11px] tracking-widest"
        >
          <ArrowLeft size={18} /> Retornar ao porto seguro
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
