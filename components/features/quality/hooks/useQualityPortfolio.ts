import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { qualityService } from '../../../../lib/services/index.ts';
// Fix: Import supabase from the client file instead of the services index
import { supabase } from '../../../../lib/supabaseClient.ts';
import { ClientOrganization, FileNode, QualityStatus } from '../../../../types/index.ts';

export const useQualityPortfolio = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileNode[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQualityData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Busca Portfólio e Pendências Gerais
      const [portfolio, pending] = await Promise.all([
        qualityService.getManagedPortfolio(user.id),
        qualityService.getPendingInspections(user.id)
      ]);

      // 2. Busca arquivos especificamente rejeitados ou marcados para apagar pelas empresas da carteira
      const orgIds = portfolio.map(o => o.id);
      let rejected: any[] = [];
      
      if (orgIds.length > 0) {
          const { data } = await (supabase as any)
            .from('files')
            .select('*')
            .in('owner_id', orgIds)
            .or(`metadata->>status.eq.${QualityStatus.REJECTED},metadata->>status.eq.${QualityStatus.TO_DELETE}`);
          rejected = data || [];
      }

      setClients(portfolio);
      setPendingFiles(pending);
      setRejectedFiles(rejected);
    } catch (err) {
      console.error("Quality Context Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQualityData();
  }, [loadQualityData]);

  return { clients, pendingFiles, rejectedFiles, isLoading, refresh: loadQualityData };
};