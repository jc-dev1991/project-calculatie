
export enum ProjectStatus {
  DRAFT = 'Concept',
  SENT = 'Verzonden',
  ACCEPTED = 'Geaccepteerd',
  COMPLETED = 'Afgerond',
  ARCHIVED = 'Gearchiveerd'
}

export enum MaterialCategory {
  PLAATMATERIAAL = 'Plaatmateriaal',
  MASSIEF = 'Massief hout',
  BESLAG = 'Beslag',
  AFWERKING = 'Afwerking',
  ELEKTRA = 'Elektra',
  SPUITWERK = 'Spuitwerk',
  OVERIG = 'Overig'
}

export enum MaterialUnit {
  M2 = 'm²',
  M1 = 'm¹',
  PCS = 'stuks',
  SET = 'set',
  LITER = 'liter',
  KG = 'kg'
}

export enum LaborType {
  PRODUCTION = 'Productie',
  ASSEMBLY = 'Montage',
  TRAVEL = 'Reis',
  SUBCONTRACTING = 'Inhuur'
}

export interface OfferSettings {
  companyName: string;
  companyStreet: string;
  companyHouseNumber: string;
  companyZipCode: string;
  companyCity: string;
  companyPhone: string;
  companyEmail: string;
  companyIban: string;
  companyKvK: string;
  companyVat: string;
  headerTitle: string;
  footerText: string;
  termsNotice: string;
  salutation: string;
  language: 'nl' | 'en';
  targetMarginPct: number;
  standardProductionSellRate: number;
  standardAssemblySellRate: number;
}

export interface MaterialLine {
  id: string;
  category: MaterialCategory;
  description: string;
  unit: MaterialUnit;
  quantity: number;
  unitCost: number;
  supplier?: string;
  marginOverrideEnabled: boolean;
  marginOverridePct: number;
  length?: number;
  width?: number;
  thickness?: number;
  libraryItemId?: string;
  isDirectPurchase?: boolean;
}

export interface LibraryMaterial {
  id: string;
  category: MaterialCategory;
  description: string;
  unit: MaterialUnit;
  unitCost: number;
  length?: number;
  width?: number;
  thickness?: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface LaborLine {
  id: string;
  type: LaborType;
  hours: number;
  costRate: number;
  sellRateEnabled: boolean;
  sellRate: number;
  travelBillable: boolean;
}

export interface ExtraCostLine {
  id: string;
  description: string;
  cost: number;
  marginEnabled: boolean;
  marginPct: number;
}

export interface Project {
  id: string;
  documentNumber: number; // Nieuw: volgnummer voor indexering
  title: string;
  clientName?: string;
  status: ProjectStatus;
  currency: string;
  vatRate: number;
  notes: string;
  
  materialMarginEnabled: boolean;
  materialMarginPct: number;
  
  laborMarginEnabled: boolean;
  laborMarginPct: number;

  materials: MaterialLine[];
  labor: LaborLine[];
  extras: ExtraCostLine[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTotals {
  materialsCostTotal: number;
  materialsSalesTotal: number;
  laborCostTotal: number;
  laborSalesTotal: number;
  extrasCostTotal: number;
  extrasSalesTotal: number;
  subtotalCost: number;
  subtotalSales: number;
  vatAmount: number;
  totalIncVat: number;
  grossProfit: number;
  grossMarginPct: number;
}
