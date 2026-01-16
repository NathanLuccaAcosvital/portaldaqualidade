import { ID, ISO8601Date } from './common.ts';
import { QualityStatus } from './enums.ts';

/**
 * Domínio Técnico - Metalurgia (Core Business)
 */

export interface ChemicalComposition {
  carbon: number;      // % C
  manganese: number;   // % Mn
  silicon: number;     // % Si
  phosphorus: number;  // % P
  sulfur: number;      // % S
}

export interface MechanicalProperties {
  yieldStrength: number;    // MPa (Escoamento)
  tensileStrength: number;  // MPa (Resistência)
  elongation: number;       // %   (Alongamento)
}

export interface SteelBatchMetadata {
  batchNumber: string;
  grade: string;        // ex: SAE 1020, ASTM A36
  invoiceNumber: string;
  status: QualityStatus;
  rejectionReason?: string;
  clientObservations?: string; // Novo: Feedback do cliente
  clientFlags?: string[];      // Novo: Tags de erro (Químico, Mecânico, etc)
  inspectedAt?: ISO8601Date;
  inspectedBy?: string;
  viewedAt?: ISO8601Date;      // Novo: Data da primeira abertura pelo cliente
  viewedBy?: string;           // Novo: Nome do usuário cliente que visualizou
  chemicalComposition: ChemicalComposition;
  mechanicalProperties: MechanicalProperties;
}
