
import { IAdminService, AdminStatsData, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SystemStatus, MaintenanceEvent } from '../../types/system.ts';
import { ClientOrganization } from '../../types/auth.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';

/**
 * Implementação Supabase para Gestão Administrativa.
 */
export const SupabaseAdminService: IAdminService = {
  getSystemStatus: async () => {
    const { data, error } = await supabase.from('system_settings').select('*').single();
    if (error || !data) return { mode: 'ONLINE' };
    return {
      mode: data.mode,
      message: data.message,
      scheduledStart: data.scheduled_start,
      scheduledEnd: data.scheduled_end,
      updatedBy: data.updated_by
    };
  },

  updateSystemStatus: async (user, newStatus) => {
    const action = async () => {
      const { data, error } = await supabase.from('system_settings').update({
        mode: newStatus.mode,
        message: newStatus.message,
        scheduled_start: newStatus.scheduledStart,
        scheduled_end: newStatus.scheduledEnd,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }).eq('id', 1).select().single();
      
      if (error) throw error;
      return data as SystemStatus;
    };

    return await withAuditLog(user, 'SYS_STATUS_CHANGE', { 
      target: `Mode: ${newStatus.mode}`, 
      category: 'SYSTEM', 
      initialSeverity: 'WARNING' 
    }, action);
  },

  subscribeToSystemStatus: (listener) => {
    const channel = supabase
      .channel('system_state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, payload => {
        listener(payload.new as SystemStatus);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  getAdminStats: async (): Promise<AdminStatsData> => {
    const [u, a, c, l] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }).gt('created_at', new Date(Date.now() - 86400000).toISOString())
    ]);

    return {
      totalUsers: u.count || 0,
      activeUsers: a.count || 0,
      activeClients: c.count || 0,
      logsLast24h: l.count || 0,
      systemHealthStatus: 'HEALTHY',
      cpuUsage: 12, // Simulação de telemetria
      memoryUsage: 35,
      dbConnections: 8,
      dbMaxConnections: 100
    };
  },

  getClients: async (filters, page = 1, pageSize = 20) => {
    let query = supabase.from('organizations').select('*, profiles!quality_analyst_id(full_name)', { count: 'exact' });
    
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.status && filters.status !== 'ALL') query = query.eq('status', filters.status);

    const { data, count, error } = await query
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('name');

    if (error) throw error;

    return {
      items: (data || []).map(c => ({
        id: c.id, 
        name: c.name, 
        cnpj: c.cnpj, 
        status: c.status, 
        contractDate: c.contract_date,
        qualityAnalystName: c.profiles?.full_name
      })),
      total: count || 0,
      hasMore: (count || 0) > page * pageSize
    };
  },

  saveClient: async (user, data) => {
    const call = async () => {
      const payload = {
        name: data.name, cnpj: data.cnpj, status: data.status,
        contract_date: data.contractDate, quality_analyst_id: data.qualityAnalystId
      };
      const query = data.id ? supabase.from('organizations').update(payload).eq('id', data.id) : supabase.from('organizations').insert(payload);
      const { data: res, error } = await query.select().single();
      if (error) throw error;
      return res as ClientOrganization;
    };
    return await withAuditLog(user, data.id ? 'CLIENT_UPDATE' : 'CLIENT_CREATE', { target: data.name || 'Org', category: 'DATA' }, call);
  },

  deleteClient: async (user, id) => {
    await withAuditLog(user, 'CLIENT_DELETE', { target: id, category: 'DATA' }, () => supabase.from('organizations').delete().eq('id', id));
  },

  getFirewallRules: async () => [],
  getPorts: async () => [],
  getMaintenanceEvents: async () => [],
  scheduleMaintenance: async (user, event) => {
     const { data } = await supabase.from('maintenance_events').insert({...event, created_by: user.id}).select().single();
     return data;
  },
  cancelMaintenance: async (user, id) => {
    await supabase.from('maintenance_events').update({status: 'CANCELLED'}).eq('id', id);
  }
};
