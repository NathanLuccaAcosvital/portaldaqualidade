
// Fix: Import types from their respective source modules
import { User } from '../../types/auth.ts';
import { UserRole, AccountStatus } from '../../types/enums.ts';
import { IUserService, RawProfile } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';
import { withTimeout } from '../utils/apiUtils.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';
import { AuthError } from '@supabase/supabase-js';

const API_TIMEOUT = 10000;

const normalizeAuthError = (error: AuthError): string => {
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "auth.errors.invalidCredentials";
  if (msg.includes("too many requests")) return "auth.errors.tooManyRequests";
  return "auth.errors.unexpected";
};

const toDomainUser = (row: any, sessionUser?: any): User | null => {
  if (!row) return null;
  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
  
  const isPendingDeletion = sessionUser?.user_metadata?.is_pending_deletion === true;

  return {
    id: row.id,
    name: row.full_name || 'Usuário Sem Nome',
    email: row.email || sessionUser?.email || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id || undefined,
    organizationName: orgData?.name || 'Aços Vital (Interno)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department || 'CLIENT_INTERNAL',
    lastLogin: row.last_login || undefined,
    isPendingDeletion
  };
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) return { success: false, error: normalizeAuthError(error) };
    return { success: true };
  },

  signUp: async (email, password, fullName, organizationId, userType, role = UserRole.CLIENT) => {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          is_pending_deletion: false
        }
      }
    });

    if (authError) throw new Error(authError.message);
    if (!data.user) throw new Error("Falha ao criar credenciais de acesso.");

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      role: role,
      organization_id: organizationId || null,
      department: userType,
      status: 'ACTIVE'
    });

    if (profileError) throw profileError;

    await logAction(null, 'USER_CREATED', email, 'AUTH', 'INFO', 'SUCCESS', { userType, role, organizationId });
  },

  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, organizations!organization_id(name)')
      .eq('id', session.user.id)
      .maybeSingle();

    return toDomainUser(profile, session.user);
  },

  getUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organizations!organization_id(name)')
      .order('full_name');

    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  saveUser: async (u) => {
    const { error } = await supabase.from('profiles').update({
      full_name: u.name,
      role: u.role,
      organization_id: u.organizationId || null,
      department: u.department, 
      status: u.status,
      updated_at: new Date().toISOString()
    }).eq('id', u.id);

    if (error) throw error;
    
    await logAction(null, 'USER_UPDATED', u.email, 'DATA', 'INFO', 'SUCCESS', { id: u.id });
  },

  flagUserForDeletion: async (userId: string, adminUser: User) => {
    const { error } = await supabase.from('profiles').update({
      status: 'INACTIVE', 
      department: 'PENDING_DELETION' 
    }).eq('id', userId);

    if (error) throw error;

    await logAction(adminUser, 'USER_FLAGGED_DELETION', userId, 'SECURITY', 'WARNING', 'SUCCESS');
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.clear();
  },

  getUsersByRole: async (role) => {
    const { data, error } = await supabase.from('profiles').select('*, organizations!organization_id(name)').eq('role', role);
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p));
  },

  changePassword: async (userId, current, newPass) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    return true;
  },

  deleteUser: async (_userId: string) => {
    throw new Error("A exclusão direta foi desativada por política de segurança. Use 'Sinalizar para Exclusão'.");
  },

  getUserStats: async () => {
    const [total, active] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
    ]);
    return { total: total.count || 0, active: active.count || 0, clients: 0 };
  }
};