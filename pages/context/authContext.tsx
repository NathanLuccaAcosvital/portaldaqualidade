
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const syncUserProfile = useCallback(async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("[AuthContext] Profile Sync Error:", error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (initialized.current) return;
      initialized.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await syncUserProfile();
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        console.error("[AuthContext] Init Error:", e);
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await syncUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [syncUserProfile]);

  const login = async (email: string, password: string) => {
    try {
      const authResult = await userService.authenticate(email, password);
      if (!authResult.success) return authResult;

      const profile = await syncUserProfile();
      if (!profile) return { success: false, error: "Falha ao carregar perfil após login." };
      
      return { success: true };
    } catch (err) {
      return { success: false, error: "Erro inesperado na autenticação." };
    }
  };

  const logout = async () => {
    try {
      await userService.logout();
    } finally {
      setUser(null);
      window.location.hash = '#/login';
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
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
