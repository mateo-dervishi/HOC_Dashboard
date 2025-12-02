// TypeScript interfaces for HOC Investor Dashboard

export interface Milestone {
  name: string;
  targetDate: Date | null;
  statusPercent: number;
  complete: boolean;
  actualDate: Date | null;
  notes: string;
}

export interface CategorySpend {
  category: string;
  budgeted: number;
  actual: number;
  forecast: number;
  variance: number;
  variancePercent: number;
}

export interface MonthlyProjection {
  month: string;
  revenue: number;
  isBreakEven?: boolean;
}

export interface Risk {
  id: string;
  name: string;
  rag: 'Red' | 'Amber' | 'Green';
  description: string;
  mitigation: string;
  status: 'Open' | 'Closed';
  owner: string;
  isBlocker?: boolean;
  isPendingDecision?: boolean;
}

export interface CapitalData {
  totalRaised: number;
  deployed: number;
  deployedPercent: number;
  remaining: number;
  burnRate: number;
  runwayMonths: number;
  nextMajorExpense: { description: string; amount: number };
}

export interface ProjectData {
  location: string;
  completionPercent: number;
  targetDate: Date;
  daysRemaining: number;
  milestones: Milestone[];
  notes?: string;
}

export interface BudgetData {
  budgetedTotal: number;
  actualSpend: number;
  variance: number;
  variancePercent: number;
  forecast: number;
  byCategory: CategorySpend[];
}

export interface OperationalData {
  suppliersConfirmed: number;
  suppliersTotal: number;
  productsInCatalogue: number;
  staffHired: number;
  staffRequired: number;
  websiteStatus: 'Not Started' | 'In Development' | 'Live' | 'Planned';
  inventorySystemStatus: 'Not Started' | 'In Development' | 'Live' | 'Planned';
}

export interface FinancialData {
  revenueProjections: MonthlyProjection[];
  breakEvenMonth: string;
  month1Target: number;
  year1Target: number;
  grossMarginTarget: number;
  b2bSplit?: number;
  b2cSplit?: number;
}

export interface RisksData {
  red: number;
  amber: number;
  green: number;
  activeBlockers: number;
  pendingDecisions: number;
  items: Risk[];
}

export interface DashboardData {
  capital: CapitalData;
  showroom: ProjectData;
  warehouse: ProjectData;
  budget: BudgetData;
  operational: OperationalData;
  financial: FinancialData;
  risks: RisksData;
  lastUpdated: Date;
}

// Excel row interfaces for parsing
export interface CapitalRow {
  Metric: string;
  Value: number | string;
  Notes?: string;
}

export interface CostRow {
  Category: string;
  Budgeted: number;
  Actual: number;
  Forecast: number;
  Notes?: string;
}

export interface MilestoneRow {
  Milestone: string;
  'Target Date': string | number | Date;
  'Status %': number;
  Complete: string | boolean;
  'Actual Date'?: string | number | Date;
  Notes?: string;
}

export interface SupplierRow {
  Supplier: string;
  Status: string;
  'Product Count': number;
  Category?: string;
}

export interface ProjectionRow {
  Month: string;
  'Revenue Target': number;
  'Is Break Even'?: string | boolean;
}

export interface RiskRow {
  'Risk ID': string;
  'Risk Name': string;
  RAG: 'Red' | 'Amber' | 'Green';
  Description: string;
  Mitigation: string;
  Status: 'Open' | 'Closed';
  Owner: string;
  'Is Blocker'?: string | boolean;
  'Pending Decision'?: string | boolean;
}

