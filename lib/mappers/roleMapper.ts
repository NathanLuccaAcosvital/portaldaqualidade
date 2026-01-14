
import { UserRole } from '../../types/auth.ts';

/**
 * Role Mapper Utility (Clean Code)
 * Isola a lógica de transformação de string/db para o Enum de domínio.
 */
export const normalizeRole = (role: unknown): UserRole => {
    if (!role) return UserRole.CLIENT;
    
    const normalized = String(role).trim().toUpperCase();
    
    const roleMap: Record<string, UserRole> = {
        'ADMIN': UserRole.ADMIN,
        'ROOT': UserRole.ADMIN,
        'QUALITY': UserRole.QUALITY,
        'QUALIDADE': UserRole.QUALITY,
        'CLIENT': UserRole.CLIENT,
        'CLIENTE': UserRole.CLIENT,
    };

    return roleMap[normalized] || UserRole.CLIENT;
};
