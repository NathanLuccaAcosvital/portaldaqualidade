
import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';

// Lazy loading das páginas
const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));
const SignUpPage = React.lazy(() => import('./pages/SignUpPage.tsx'));
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard.tsx'));
const QualityDashboard = React.lazy(() => import('./pages/dashboards/QualityDashboard.tsx'));
const ClientDashboard = React.lazy(() => import('./pages/dashboards/ClientDashboard.tsx'));
const QualityPage = React.lazy(() => import('./pages/QualityPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'));

const PageLoader = ({ message = "Sincronizando" }: { message?: string }) => (
  <div className="h-screen w-screen bg-[#081437] flex flex-col items-center justify-center text-white">
      <Loader2 size={40} className="animate-spin text-blue-400 mb-6" />
      <p className="text-[10px] font-black text-slate-500 tracking-[6px] uppercase animate-pulse">{message}</p>
  </div>
);

/**
 * Redirecionador Inteligente: Executado apenas quando o Auth está PRONTO.
 */
const RootRedirect = () => {
    const { user } = useAuth();
    
    return useMemo(() => {
        if (!user) return <Navigate to="/login" replace />;
        
        const role = normalizeRole(user.role);
        const roleRoutes: Record<UserRole, string> = {
          [UserRole.ADMIN]: '/admin/dashboard',
          [UserRole.QUALITY]: '/quality/dashboard',
          [UserRole.CLIENT]: '/client/dashboard'
        };

        return <Navigate to={roleRoutes[role] || '/client/dashboard'} replace />;
    }, [user]);
};

export const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Loader ÚNICO e SOBERANO. Nada renderiza enquanto isLoading for true.
  if (isLoading) return <PageLoader message="Portal Aços Vital" />;

  return (
    <Suspense fallback={<PageLoader message="Carregando Módulo" />}>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={user ? <RootRedirect /> : <LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Camada de Proteção */}
        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/dashboard" element={<RootRedirect />} />

                {/* Áreas Privadas */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminPage />} /> 
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality/dashboard" element={<QualityDashboard />} />
                    <Route path="/quality" element={<QualityPage />} />
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    <Route path="/client/dashboard" element={<ClientDashboard />} />
                </Route>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
