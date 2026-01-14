
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { adminService, userService } from '../../../../lib/services/index.ts';
import { UserRole, SystemStatus, User, normalizeRole } from '../../../../types/index.ts';
import { AdminStatsData } from '../../../../lib/services/interfaces.ts';

/**
 * Orquestrador da Página Administrativa (Facade Pattern)
 * Responsabilidade: Coordenar o carregamento inicial e segurança da área.
 */
export const useAdminPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStatsData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]);

  const loadInitialData = useCallback(async () => {
    if (!user) return;
    
    // Guard Clause de Segurança
    if (normalizeRole(user.role) !== UserRole.ADMIN) {
        navigate('/dashboard', { replace: true });
        return;
    }

    setIsLoading(true);
    try {
      const [stats, status, analysts] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getSystemStatus(),
        userService.getUsersByRole(UserRole.QUALITY),
      ]);

      setAdminStats(stats);
      setSystemStatus(status);
      setQualityAnalysts(analysts);
    } catch (err: unknown) {
      console.error("[useAdminPage] Data Sync Failure:", err);
      showToast("Falha crítica ao sincronizar painel de controle.", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast, navigate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const changeTab = useCallback((tab: string) => {
    navigate(`/admin?tab=${tab}`, { replace: true });
  }, [navigate]);

  return {
    user,
    activeTab,
    isLoading,
    isSaving,
    setIsSaving,
    adminStats,
    systemStatus,
    setSystemStatus,
    qualityAnalysts,
    changeTab,
    refreshData: loadInitialData
  };
};
