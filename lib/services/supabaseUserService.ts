
import { User, UserRole, AccountStatus } from '../../types/auth.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../../types/index.ts';

/**
 * Data Mapper: Database -> Domain
 */
const toDomainUser = (row: any, sessionEmail?: string): User => ({
  id: row.id,
  name: row.full_name,
  email: row.email || sessionEmail || '',
  role: normalizeRole(row.role),
  organizationId: row.organization_id,
  organizationName: row.organizations?.name,
  status: row.status as AccountStatus,
  department: row.department,
  lastLogin: row.last_login
});

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) return { success: false, error: "Credenciais inválidas ou acesso negado." };

    // Update last login timestamp in profile
    await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
    
    return { success: true };
  },

  signUp: async (email, password, fullName, organizationId, department) => {
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email: email.toLowerCase(),
        organization_id: organizationId || null,
        department: department || null,
        role: 'CLIENT',
        status: 'ACTIVE'
      });
      if (profileError) throw profileError;
    }
  },

  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, organizations(name)')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return null;
    return toDomainUser(profile, session.user.email);
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*, organizations(name)').order('full_name');
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  getUsersByRole: async (role) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', role);
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  saveUser: async (u) => {
    const { error } = await supabase.from('profiles').update({
      full_name: u.name,
      role: u.role,
      organization_id: u.organizationId,
      status: u.status,
      department: u.department,
      updated_at: new Date().toISOString()
    }).eq('id', u.id);
    if (error) throw error;
  },

  changePassword: async (userId, current, newPass) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    return true;
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  blockUserById: async (admin, target, reason) => {
    await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', target);
    await logAction(admin, 'SEC_USER_BLOCKED', target, 'SECURITY', 'CRITICAL', 'SUCCESS', { reason });
  },

  getUserStats: async () => {
    const [total, active, clients] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT')
    ]);
    return { 
      total: total.count || 0, 
      active: active.count || 0, 
      clients: clients.count || 0 
    };
  },

  generateRandomPassword: () => Math.random().toString(36).slice(-10)
};
