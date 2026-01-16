
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { User, UserRole, ClientOrganization, AccountStatus, normalizeRole } from '../../../../types/index.ts';
import { userService, adminService } from '../../../../lib/services/index.ts';
import { UserFormData } from '../components/AdminModals.tsx';

interface UseAdminUserProps {
  setIsSaving: (state: boolean) => void;
  restrictedToRole?: UserRole;
}

export const useAdminUserManagement = ({ setIsSaving, restrictedToRole }: UseAdminUserProps) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(restrictedToRole || 'ALL');
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: restrictedToRole || UserRole.CLIENT,
    organizationId: '',
    department: 'CLIENT_INTERNAL',
    status: AccountStatus.ACTIVE,
  });

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingUsers(true);
    try {
      // 1. Sincroniza usuários e empresas
      const [users, clients] = await Promise.all([
        userService.getUsers(),
        adminService.getClients({ status: 'ACTIVE' }, 1, 1000),
      ]);
      
      console.debug(`[Security Check] Usuários permitidos pela RLS: ${users.length}`);
      console.debug(`[Security Check] Empresas atribuídas na carteira: ${clients.items.length}`);
      
      setUsersList(users);
      setClientsList(clients.items);
    } catch (err: any) {
      console.error("[Data Sync Error]", err);
      showToast("Falha na comunicação com a base de dados. Verifique sua RLS.", 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Regra de Negócio: Identificar IDs das empresas sob gestão deste usuário
  const managedOrgIds = useMemo(() => {
    if (!currentUser) return [];
    const role = normalizeRole(currentUser.role);
    
    // Admins gerenciam tudo
    if (role === UserRole.ADMIN) return clientsList.map(c => c.id);
    
    // Analistas gerenciam apenas empresas onde seu ID consta como quality_analyst_id
    if (role === UserRole.QUALITY) {
      return clientsList
        .filter(c => String(c.qualityAnalystId) === String(currentUser.id))
        .map(c => c.id);
    }
    
    return [];
  }, [clientsList, currentUser]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const role = currentUser ? normalizeRole(currentUser.role) : null;
    const isQualityAnalyst = role === UserRole.QUALITY;

    return usersList.filter(u => {
      // 1. Filtro de Arquivamento (Tag Visual)
      const isArchived = u.department === 'PENDING_DELETION';
      if (viewMode === 'ACTIVE' && isArchived) return false;
      if (viewMode === 'ARCHIVED' && !isArchived) return false;

      // 2. Filtro de Role
      const uRole = normalizeRole(u.role);
      const targetRole = restrictedToRole || roleFilter;
      const matchesRole = targetRole === 'ALL' || uRole === normalizeRole(targetRole);
      if (!matchesRole) return false;

      // 3. Filtro de Portfólio (Controle de Visibilidade Frontend)
      if (isQualityAnalyst) {
        // Se for analista, só mostra usuários que pertencem às empresas que ele gere
        if (!u.organizationId || !managedOrgIds.includes(u.organizationId)) return false;
      }

      // 4. Filtro de Busca por Texto
      const matchesSearch = 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search);
        
      return matchesSearch;
    });
  }, [usersList, searchTerm, roleFilter, viewMode, restrictedToRole, currentUser, managedOrgIds]);

  const handleSaveUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!editingUser) {
        await userService.signUp(
          formData.email, 
          formData.password || '', 
          formData.name, 
          formData.organizationId || undefined,
          formData.department,
          formData.role
        );
        showToast("Novo parceiro credenciado com sucesso!", 'success');
      } else {
        await userService.saveUser({ ...editingUser, ...formData } as User);
        showToast("Perfil de acesso atualizado.", 'success');
      }
      setIsUserModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, formData, showToast, setIsSaving, loadData]);

  const handleFlagDeletion = useCallback(async (userId: string) => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
        await userService.flagUserForDeletion(userId, currentUser);
        showToast("Usuário sinalizado para auditoria de exclusão.", 'info');
        setIsUserModalOpen(false);
        await loadData();
    } catch (err: any) {
        showToast(err.message, 'error');
    } finally {
        setIsSaving(false);
    }
  }, [currentUser, setIsSaving, showToast, loadData]);

  const openUserModal = useCallback((target?: User) => {
    if (target) {
      setEditingUser(target);
      setFormData({
        name: target.name,
        email: target.email,
        password: '',
        role: target.role,
        organizationId: target.organizationId || '',
        status: target.status,
        department: target.department || 'CLIENT_INTERNAL'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '', email: '', password: '', 
        role: restrictedToRole || UserRole.CLIENT, 
        organizationId: '', 
        status: AccountStatus.ACTIVE, department: 'CLIENT_INTERNAL'
      });
    }
    setIsUserModalOpen(true);
  }, [restrictedToRole]);

  return {
    filteredUsers,
    isLoadingUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    viewMode,
    setViewMode,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    handleFlagDeletion,
    formData,
    setFormData,
    // No modal, só permite selecionar empresas que o analista gere
    clientsList: clientsList.filter(c => isUserModalOpen ? managedOrgIds.includes(c.id) : true),
  };
};
