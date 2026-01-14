
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService } from '../lib/services/index.ts';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provedor de Autenticação - Gerencia o estado global do usuário.
 * (S) Responsabilidade: Sincronizar sessão do servidor com o estado da aplicação.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Sincroniza o perfil do banco com o estado local.
   * Isolado para ser reutilizável (refresh).
   */
  const syncUserProfile = useCallback(async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("[AuthContext] Falha na sincronização de perfil:", error);
      setUser(null);
      return null;
    }
  }, []);

  /**
   * Monitoramento ativo da sessão via Supabase Auth
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted) {
        await syncUserProfile();
      }
      if (isMounted) setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (isMounted) {
          await syncUserProfile();
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  /**
   * Realiza a autenticação de login
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authResult = await userService.authenticate(email, password);
      
      if (!authResult.success) {
        setIsLoading(false);
        return authResult;
      }

      const profile = await syncUserProfile();
      
      if (!profile) {
        await userService.logout();
        setIsLoading(false);
        return { success: false, error: "Perfil de acesso não localizado. Entre em contato com a TI." };
      }
      
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: "Erro inesperado durante a autenticação." };
    }
  };

  /**
   * Finaliza a sessão atual
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await userService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      refreshProfile: syncUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser invocado dentro de um AuthProvider');
  }
  return context;
};
