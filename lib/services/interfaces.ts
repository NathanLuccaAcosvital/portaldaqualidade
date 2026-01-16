import { 
  User, 
  ClientOrganization,
  FileNode, 
  AuditLog, 
  SystemStatus, 
  MaintenanceEvent, 
  AppNotification,
  QualityStatus,
  BreadcrumbItem,
  UserRole,
  AccountStatus
} from '../../types/index.ts';

// Interface para estatísticas do dashboard administrativo
export interface AdminStatsData {
  totalUsers: number;
  activeUsers: number;
  activeClients: number;
  logsLast24h: number;
  systemHealthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  dbMaxConnections: number;
}

// Interface para estatísticas do dashboard de qualidade
export interface QualityOverviewStats {
  pendingDocs: number;
  totalActiveClients: number;
}

// Interface para estatísticas gerais de dashboard de arquivos
export interface DashboardStatsData {
  mainValue: number;
  subValue: number;
  pendingValue: number;
  status: 'REGULAR' | 'PENDING' | 'CRITICAL';
  mainLabel: string;
  subLabel: string;
}

// Interface para dados brutos de organização vindo do Supabase
export interface RawClientOrganization {
  id: string;
  name: string;
  cnpj: string;
  status: AccountStatus;
  contract_date: string;
  quality_analyst_id: string | null;
  profiles?: { full_name: string } | { full_name: string }[];
}

// Interface para dados brutos de perfil vindo do Supabase
export interface RawProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_id: string | null;
  status: string;
  department: string;
  last_login: string | null;
  organizations?: { name: string } | { name: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/**
 * SERVIÇO DE INFRAESTRUTURA (STORAGE & BASE FILES)
 * Operações puras de persistência e cloud storage.
 */
export interface IFileService {
  getRawFiles: (folderId: string | null, page?: number, pageSize?: number, searchTerm?: string) => Promise<PaginatedResponse<FileNode>>;
  getFiles: (user: User, folderId: string | null, page?: number, pageSize?: number, searchTerm?: string) => Promise<PaginatedResponse<FileNode>>;
  createFolder: (user: User, parentId: string | null, name: string, ownerId?: string) => Promise<FileNode>;
  uploadFile: (user: User, fileData: any, ownerId: string) => Promise<FileNode>;
  deleteFile: (user: User, fileIds: string[]) => Promise<void>;
  deleteFiles: (fileIds: string[]) => Promise<void>;
  renameFile: (user: User, fileId: string, newName: string) => Promise<void>;
  getBreadcrumbs: (folderId: string | null) => Promise<BreadcrumbItem[]>;
  getSignedUrl: (path: string) => Promise<string>;
  getFileSignedUrl: (user: User, fileId: string) => Promise<string>;
  getAuditLogs: (user: User) => Promise<AuditLog[]>;
  getDashboardStats: (user: User) => Promise<DashboardStatsData>;
  // Métodos antigos mantidos para compatibilidade se necessário
  uploadRaw: (user: User, blob: Blob, name: string, path: string) => Promise<string>;
  deleteRaw: (paths: string[]) => Promise<void>;
}

/**
 * SERVIÇO DE DOMÍNIO: QUALIDADE (Contexto: Analista Técnico)
 */
export interface IQualityService {
  getManagedPortfolio: (analystId: string) => Promise<ClientOrganization[]>;
  getPendingInspections: (analystId: string) => Promise<FileNode[]>;
  submitTechnicalVeredict: (analystId: string, fileId: string, status: QualityStatus, metadata: any) => Promise<void>;
  getTechnicalAuditLogs: (analystId: string, filters?: { search?: string; severity?: string }) => Promise<AuditLog[]>;
  getPortfolioFileExplorer: (analystId: string, folderId: string | null) => Promise<PaginatedResponse<FileNode>>;
  getManagedClients: (analystId: string, filters: { search?: string; status?: string }, page?: number) => Promise<PaginatedResponse<ClientOrganization>>;
  submitVeredict: (user: User, file: FileNode, status: QualityStatus, reason?: string) => Promise<void>;
}

/**
 * SERVIÇO DE DOMÍNIO: PARCEIRO (Contexto: Cliente B2B)
 */
export interface IPartnerService {
  getCertificates: (orgId: string, folderId: string | null, search?: string) => Promise<PaginatedResponse<FileNode>>;
  getComplianceOverview: (orgId: string) => Promise<{ approvedCount: number; lastAnalysis: string }>;
  getRecentActivity: (orgId: string) => Promise<FileNode[]>;
  getPartnerDashboardStats: (orgId: string) => Promise<DashboardStatsData>;
  // Fix: Added logFileView and submitClientFeedback to interface to resolve TS errors in implementations and consumers
  logFileView: (user: User, file: FileNode) => Promise<void>;
  // Fix: Updated submitClientFeedback signature to include annotations parameter (6th argument)
  submitClientFeedback: (user: User, file: FileNode, status: QualityStatus, observations?: string, flags?: string[], annotations?: any[]) => Promise<void>;
}

/**
 * SERVIÇO DE DOMÍNIO: ADMIN (Contexto: Governança Global)
 */
export interface IAdminService {
  getSystemStatus: () => Promise<SystemStatus>;
  updateSystemStatus: (user: User, newStatus: Partial<SystemStatus>) => Promise<SystemStatus>;
  subscribeToSystemStatus: (listener: (status: SystemStatus) => void) => () => void;
  getAdminStats: () => Promise<AdminStatsData>;
  getClients: (filters?: { search?: string; status?: string }, page?: number, pageSize?: number) => Promise<PaginatedResponse<ClientOrganization>>;
  saveClient: (user: User, data: Partial<ClientOrganization>) => Promise<ClientOrganization>;
  deleteClient: (user: User, id: string) => Promise<void>;
  scheduleMaintenance: (user: User, event: Partial<MaintenanceEvent>) => Promise<MaintenanceEvent>;
  // Métodos antigos mantidos para compatibilidade
  updateGatewayMode: (user: User, mode: SystemStatus['mode']) => Promise<void>;
  getGlobalAuditLogs: () => Promise<AuditLog[]>;
  manageUserAccess: (admin: User, targetUser: Partial<User>) => Promise<void>;
  getAllClients: () => Promise<ClientOrganization[]>;
}

export interface IUserService {
  authenticate: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, organizationId?: string, userType?: string, role?: UserRole) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  getUsers: () => Promise<User[]>;
  saveUser: (user: User) => Promise<void>;
  flagUserForDeletion: (userId: string, adminUser: User) => Promise<void>;
  logout: () => Promise<void>;
  getUsersByRole: (role: UserRole) => Promise<User[]>;
  changePassword: (userId: string, current: string, newPass: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<void>;
  getUserStats: () => Promise<{ total: number; active: number; clients: number }>;
}

export interface INotificationService {
  subscribeToNotifications: (listener: () => void) => () => void;
  getNotifications: (user: User) => Promise<AppNotification[]>;
  getUnreadCount: (user: User) => Promise<number>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (user: User) => Promise<void>;
  addNotification: (userId: string | null, title: string, message: string, type: AppNotification['type'], link?: string) => Promise<void>;
}
