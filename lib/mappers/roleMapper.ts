
import { UserRole } from '../../types/auth.ts';

/**
 * Role Mapper Utility (Resilient)
 * Mapeia variações de strings do banco para o Enum de domínio.
 */
export const normalizeRole = (role: unknown): UserRole => {
    if (!role) return UserRole.CLIENT;
    
    const normalized = String(role).trim().toUpperCase();
    
    // Mapeamento robusto suportando PT-BR e EN-US
    const roleMap: Record<string, UserRole> = {
        'ADMIN': UserRole.ADMIN,
        'ADMINISTRADOR': UserRole.ADMIN,
        'QUALITY': UserRole.QUALITY,
        'QUALIDADE': UserRole.QUALITY,
        'CLIENT': UserRole.CLIENT,
        'CLIENTE': UserRole.CLIENT,
        'USER': UserRole.CLIENT
    };

    return roleMap[normalized] || UserRole.CLIENT;
};
