
import React, { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { adminService } from '../lib/services/index.ts';
import { UserRole, SystemStatus, normalizeRole } from '../types/index.ts';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen.tsx';

/**
 * Middleware de Controle de Disponibilidade do Sistema.
 * (S) Responsabilidade: Bloquear acessos durante janelas de manutenção.
 */
export const MaintenanceMiddleware: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isChecking, setIsChecking] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await adminService.getSystemStatus();
      setStatus(s);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Inscrição em tempo real para mudanças de status (O) Aberto para extensões
    const unsubscribe = adminService.subscribeToSystemStatus(setStatus);
    return () => unsubscribe();
  }, [fetchStatus]);

  if (isChecking) return null;

  // Bypass de Manutenção para Role ADMINISTRADOR
  const isAuthorizedToBypass = user && normalizeRole(user.role) === UserRole.ADMIN;
  const isSystemLocked = status.mode === 'MAINTENANCE';

  if (isSystemLocked && !isAuthorizedToBypass) {
    return <MaintenanceScreen status={status} onRetry={fetchStatus} />;
  }

  return <Outlet context={{ systemStatus: status }} />;
};
