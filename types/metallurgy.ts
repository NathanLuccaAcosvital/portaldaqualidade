
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
  
  // Análise Documental (Técnica Vital)
  status: QualityStatus;
  rejectionReason?: string;
  inspectedAt?: ISO8601Date;
  inspectedBy?: string;

  // Análise Física (Recebimento Cliente)
  physicalStatus?: QualityStatus;
  physicalInspectedAt?: ISO8601Date;
  physicalInspectedBy?: string;
  physicalEvidenceUrl?: string;
  physicalObservations?: string;

  clientObservations?: string; 
  clientFlags?: string[];      
  viewedAt?: ISO8601Date;      
  viewedBy?: string;           
  chemicalComposition: ChemicalComposition;
  mechanicalProperties: MechanicalProperties;
}
