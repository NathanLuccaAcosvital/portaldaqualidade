
import { 
  Home, 
  Library, 
  Star, 
  History, 
  ShieldCheck, 
  Building2, 
  Users, 
  Activity, 
  LogOut,
  Lock,
  FileText,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { User, UserRole, normalizeRole } from '../types/index.ts';

/**
 * Interface que define a estrutura de um item de menu
 */
export interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
}

/**
 * Interface para seções do menu lateral
 */
export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Estratégia de Navegação para ADMINISTRADORES
 */
const getAdminNavigation = (t: any): NavSection[] => [
  {
    title: "OPERACIONAL",
    items: [
      { label: "Command Center", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Base de Usuários", path: '/admin?tab=users', icon: Users },
      { label: "Portfólio B2B", path: '/admin?tab=clients', icon: Building2 },
    ]
  },
  {
    title: "GOVERNANÇA",
    items: [
      { label: "Logs de Auditoria", path: '/admin?tab=logs', icon: ShieldAlert },
      { label: "Painel de Segurança", path: '/admin?tab=settings', icon: ShieldCheck },
    ]
  }
];

/**
 * Estratégia de Navegação para QUALIDADE
 */
const getQualityNavigation = (t: any): NavSection[] => [
  {
    title: "OPERACIONAL",
    items: [
      { label: t('quality.overview'), path: '/quality/dashboard', icon: Activity, exact: true },
      { label: t('quality.b2bPortfolio'), path: '/quality?view=clients', icon: Building2 },
    ]
  },
  {
    title: "GOVERNANÇA",
    items: [
      { label: t('quality.myAuditLog'), path: '/quality?view=audit-log', icon: FileText }
    ]
  }
];

/**
 * Estratégia de Navegação para CLIENTES
 */
const getClientNavigation = (t: any): NavSection[] => [
  {
    title: "OPERACIONAL",
    items: [
      { label: t('menu.home'), path: '/client/dashboard', icon: Home, exact: true },
      { label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library },
    ]
  },
  {
    title: t('menu.quickAccess'),
    items: [
      { label: t('menu.favorites'), path: '/client/dashboard?view=favorites', icon: Star },
      { label: t('menu.recent'), path: '/client/dashboard?view=recent', icon: History },
    ]
  }
];

/**
 * Retorna a configuração de menu baseada no papel do usuário (OCP Applied)
 */
export const getMenuConfig = (user: User | null, t: any): NavSection[] => {
  if (!user) return [];
  
  const role = normalizeRole(user.role);

  const navigationMap: Record<UserRole, (t: any) => NavSection[]> = {
    [UserRole.ADMIN]: getAdminNavigation,
    [UserRole.QUALITY]: getQualityNavigation,
    [UserRole.CLIENT]: getClientNavigation,
  };

  return navigationMap[role]?.(t) || [];
};

/**
 * Retorna itens para a barra de navegação inferior (Mobile)
 */
export const getBottomNavItems = (user: User | null, t: any): NavItem[] => {
  if (!user) return [];
  const role = normalizeRole(user.role);

  if (role === UserRole.ADMIN) {
    return [
      { label: "Dash", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Usuários", path: '/admin?tab=users', icon: Users },
      { label: "Logs", path: '/admin?tab=logs', icon: ShieldAlert },
    ];
  }
  
  if (role === UserRole.QUALITY) {
    return [
        { label: "Resumo", path: '/quality/dashboard', icon: Activity, exact: true },
        { label: "Clientes", path: '/quality?view=clients', icon: Building2 },
        { label: "Auditoria", path: '/quality?view=audit-log', icon: FileText },
    ];
  }

  return [
    { label: t('menu.home'), path: '/client/dashboard', icon: Home, exact: true },
    { label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library },
    { label: t('menu.favorites'), path: '/client/dashboard?view=favorites', icon: Star },
  ];
};

/**
 * Itens fixos do menu de perfil do usuário
 */
export const getUserMenuItems = (t: any, hooks: { onLogout: () => void, onOpenChangePassword: () => void, onOpenPrivacy: () => void }) => [
  { label: t('common.changePassword'), icon: Lock, onClick: hooks.onOpenChangePassword },
  { label: t('common.privacy'), icon: ShieldCheck, onClick: hooks.onOpenPrivacy },
  { label: t('common.logout'), icon: LogOut, onClick: hooks.onLogout },
];
