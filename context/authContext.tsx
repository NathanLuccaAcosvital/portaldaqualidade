import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService } from '../lib/services/index.ts';
import { appService } from '../lib/services/appService.tsx';
import { User, SystemStatus } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  error: string | null;
  isInitialSyncComplete: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  retryInitialSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    systemStatus: null,
    error: null,
    isInitialSyncComplete: false,
  });

  const mounted = useRef(true);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await appService.getInitialData();
      
      if (mounted.current) {
        setState({
          user: data.user,
          systemStatus: data.systemStatus,
          isLoading: false,
          error: null,
          isInitialSyncComplete: true,
        });
      }
    } catch (error) {
      console.error("Critical Auth Sync Error:", error);
      if (mounted.current) {
        setState(s => ({ 
          ...s, 
          isLoading: false, 
          error: "Conexão perdida com o Gateway de Segurança.", 
          isInitialSyncComplete: true 
        }));
      }
    }
  }, []);

  const retryInitialSync = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null, isInitialSyncComplete: false }));
    await refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    mounted.current = true;
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setState(s => ({ ...s, isLoading: true, isInitialSyncComplete: false }));
        refreshAuth();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    const result = await userService.authenticate(email, password);
    if (!result.success) {
      setState(s => ({ ...s, isLoading: false, error: result.error || 'Autenticação recusada' }));
    }
    return result;
  };

  const logout = async () => {
    await userService.logout();
    window.location.href = '/'; 
  };

  const value = useMemo(() => ({ 
    ...state, 
    login, 
    logout, 
    retryInitialSync 
  }), [state, retryInitialSync]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};