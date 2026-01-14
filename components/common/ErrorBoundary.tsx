import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Boundary de Erros do Sistema (S)
 * Única responsabilidade: Capturar exceções não tratadas e fornecer fallback seguro.
 */
// Fix: Importing Component directly and extending it to ensure that state, props, and setState are correctly inherited and recognized by the TypeScript compiler
export class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly defining the state property on the class to ensure it's recognized by the compiler and correctly typed
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Aqui poderíamos integrar com um serviço de telemetria como Sentry
    console.error('[Global Error]', error, errorInfo);
  }

  private handleReset = () => {
    // Fix: setState is now correctly recognized as a member of the Component base class
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render(): ReactNode {
    // Fix: state and props are correctly accessed as members inherited from the Component class
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-red-100 p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertOctagon size={40} />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Falha na Matriz de Dados</h1>
          <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">
            Ocorreu uma exceção crítica no processamento da página. Isso pode ser causado por instabilidade na rede ou dados corrompidos no cache.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl"
            >
              <RefreshCw size={16} /> Reiniciar Portal
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
            >
              Ir para o Início
            </button>
          </div>
        </div>
      </div>
    );
  }
}
