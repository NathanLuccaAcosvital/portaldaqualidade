
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/authContext.tsx';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { MobileNavigation } from './MobileNavigation.tsx';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { PrivacyModal } from '../common/PrivacyModal.tsx';
import { ChangePasswordModal } from '../features/auth/ChangePasswordModal.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { useLayoutState } from './hooks/useLayoutState.ts';
import { useSystemSync } from './hooks/useSystemSync.ts';
import { UserRole, normalizeRole } from '../../types/index.ts';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

/**
 * Layout Principal (Orquestrador)
 * (S) Responsabilidade: Definir a grade estrutural e injetar camadas globais.
 */
export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const role = normalizeRole(user?.role);

  // Hooks de Estado e Sincronização (Clean Code - Separation of Concerns)
  const layout = useLayoutState();
  const system = useSystemSync(user);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Camadas Globais de Contexto */}
      <CookieBanner />
      <PrivacyModal isOpen={layout.isPrivacyOpen} onClose={layout.closePrivacy} />
      <ChangePasswordModal isOpen={layout.isChangePasswordOpen} onClose={layout.closeChangePassword} />

      {/* Componente de Navegação Lateral (Desktop) */}
      <Sidebar 
        user={user} 
        role={role} 
        isCollapsed={layout.sidebarCollapsed} 
        onToggle={layout.toggleSidebar} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Banner de Manutenção Dinâmico */}
        <MaintenanceBanner status={system.status} isAdmin={role === UserRole.ADMIN} />
        
        {/* Cabeçalho Adaptativo */}
        <Header 
          title={title} 
          user={user} 
          role={role} 
          unreadCount={system.unreadCount} 
          onLogout={logout}
          onOpenMobileMenu={layout.openMobileMenu}
        />

        {/* Área de Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        {/* Navegação e Menus Mobile */}
        <MobileNavigation 
          user={user}
          isMenuOpen={layout.mobileMenuOpen}
          onCloseMenu={layout.closeMobileMenu}
          onLogout={logout}
          onOpenPassword={layout.openChangePassword}
          onOpenPrivacy={layout.openPrivacy}
        />
      </div>
    </div>
  );
};
