
import { supabase } from '../supabaseClient.ts';
import { User, UserRole } from '../../types/auth.ts';
import { FileNode, FileType, LibraryFilters, BreadcrumbItem, normalizeRole } from '../../types/index.ts';
import { QualityStatus } from '../../types/metallurgy.ts';
import { logAction as internalLogAction } from './loggingService.ts';
import { IFileService, PaginatedResponse, DashboardStatsData } from './interfaces.ts';

const STORAGE_BUCKET = 'certificates';

/**
 * Mapper: DB Row -> Domain FileNode
 */
const toDomainFile = (row: any): FileNode => ({
  id: row.id,
  parentId: row.parent_id,
  name: row.name,
  type: row.type as FileType,
  size: row.size,
  updatedAt: row.updated_at,
  ownerId: row.owner_id,
  storagePath: row.storage_path,
  isFavorite: !!row.is_favorite,
  metadata: row.metadata 
});

export const SupabaseFileService: IFileService = {
  getFiles: async (user, folderId, page = 1, pageSize = 50): Promise<PaginatedResponse<FileNode>> => {
    let query = supabase.from('files').select('*', { count: 'exact' });

    if (folderId) {
      query = query.eq('parent_id', folderId);
    } else {
      query = query.is('parent_id', null);
    }

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query
      .range(from, from + pageSize - 1)
      .order('type', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      items: (data || []).map(toDomainFile),
      total: count || 0,
      hasMore: (count || 0) > from + pageSize
    };
  },

  getFilesByOwner: async (ownerId) => {
    const { data, error } = await supabase.from('files').select('*').eq('owner_id', ownerId);
    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  getRecentFiles: async (user, limit = 10) => {
    const { data, error } = await supabase.from('files')
        .select('*')
        .limit(limit)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toDomainFile);
  },

  getLibraryFiles: async (user, filters, page = 1, pageSize = 20) => {
    return SupabaseFileService.getFiles(user, null, page, pageSize);
  },

  getDashboardStats: async (user): Promise<DashboardStatsData> => {
    const [totalApproved, totalPending] = await Promise.all([
      supabase.from('files')
        .select('*', { count: 'exact', head: true })
        .neq('type', 'FOLDER')
        .eq('metadata->>status', QualityStatus.APPROVED),
      supabase.from('files')
        .select('*', { count: 'exact', head: true })
        .neq('type', 'FOLDER')
        .eq('metadata->>status', QualityStatus.PENDING)
    ]);
    
    return {
        mainValue: totalApproved.count || 0,
        subValue: totalApproved.count || 0,
        pendingValue: totalPending.count || 0,
        status: (totalPending.count || 0) > 0 ? 'PENDING' : 'REGULAR',
        mainLabel: 'Certificados Globais',
        subLabel: 'Docs. Validados'
    };
  },

  createFolder: async (user, parentId, name, ownerId) => {
    const { data, error } = await supabase.from('files').insert({
        name,
        type: 'FOLDER',
        parent_id: parentId,
        owner_id: ownerId || null,
        storage_path: 'system/folder',
        updated_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
    return toDomainFile(data);
  },

  uploadFile: async (user, fileData, ownerId) => {
    const { data, error } = await supabase.from('files').insert({
        name: fileData.name,
        type: fileData.type || 'PDF',
        parent_id: fileData.parentId,
        owner_id: ownerId,
        storage_path: fileData.storagePath,
        size: fileData.size,
        metadata: fileData.metadata || { status: QualityStatus.PENDING },
        uploaded_by: user.id,
        updated_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return toDomainFile(data);
  },

  updateFile: async (user, fileId, updates) => {
    const { error } = await supabase.from('files').update({
        name: updates.name,
        metadata: updates.metadata,
        parent_id: updates.parentId,
        updated_at: new Date().toISOString()
    }).eq('id', fileId);
    if (error) throw error;
  },

  deleteFile: async (user, fileId) => {
    const { error } = await supabase.from('files').delete().eq('id', fileId);
    if (error) throw error;
  },

  searchFiles: async (user, query, page = 1, pageSize = 20) => {
    const from = (page - 1) * pageSize;
    const { data, count, error } = await supabase.from('files')
        .select('*', { count: 'exact' })
        .ilike('name', `%${query}%`)
        .range(from, from + pageSize - 1);
    
    if (error) throw error;
    return {
        items: (data || []).map(toDomainFile),
        total: count || 0,
        hasMore: (count || 0) > from + pageSize
    };
  },

  getBreadcrumbs: async (folderId) => {
    if (!folderId) return [{ id: null, name: 'Home' }];
    const { data } = await supabase.from('files').select('id, name').eq('id', folderId).single();
    return [{ id: null, name: 'Home' }, { id: folderId, name: data?.name || 'Pasta' }];
  },

  toggleFavorite: async (user, fileId) => {
    const { data: existing } = await supabase.from('file_favorites').select('*').eq('user_id', user.id).eq('file_id', fileId).maybeSingle();
    
    if (existing) {
        await supabase.from('file_favorites').delete().eq('id', existing.id);
        return false;
    } else {
        await supabase.from('file_favorites').insert({ user_id: user.id, file_id: fileId });
        return true;
    }
  },

  getFavorites: async (user) => {
    const { data, error } = await supabase.from('file_favorites').select('files(*)').eq('user_id', user.id);
    if (error) throw error;
    return (data || []).map(f => toDomainFile(f.files));
  },

  getFileSignedUrl: async (user, fileId): Promise<string> => {
    const { data: file, error } = await supabase.from('files').select('storage_path').eq('id', fileId).single();
    if (error || !file) throw new Error("Documento não encontrado.");

    const { data, error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(file.storage_path, 3600);

    if (storageError) throw storageError;
    return data.signedUrl;
  },

  logAction: async (user, action, target, category, severity, status, metadata) => {
    await internalLogAction(user, action, target, category, severity, status, metadata);
  },

  getAuditLogs: async (user) => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return (data || []).map(l => ({
        id: l.id,
        timestamp: l.created_at,
        userId: l.user_id,
        userName: l.metadata?.userName || 'Sistema',
        userRole: l.metadata?.userRole || 'SYSTEM',
        action: l.action,
        category: l.category,
        target: l.target,
        severity: l.severity,
        status: l.status,
        ip: l.ip,
        location: l.location,
        userAgent: l.user_agent,
        device: l.device,
        metadata: l.metadata,
        requestId: l.request_id
    }));
  },

  getQualityAuditLogs: async (user, filters) => {
    let query = supabase.from('audit_logs').select('*').eq('category', 'DATA').order('created_at', { ascending: false });
    if (filters?.severity && filters.severity !== 'ALL') {
        query = query.eq('severity', filters.severity);
    }
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return (data || []).map(l => ({
        id: l.id,
        timestamp: l.created_at,
        userId: l.user_id,
        userName: l.metadata?.userName || 'Sistema',
        userRole: l.metadata?.userRole || 'SYSTEM',
        action: l.action,
        category: l.category,
        target: l.target,
        severity: l.severity,
        status: l.status,
        ip: l.ip,
        location: l.location,
        userAgent: l.user_agent,
        device: l.device,
        metadata: l.metadata,
        requestId: l.request_id
    }));
  }
};
