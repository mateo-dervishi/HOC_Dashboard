import * as XLSX from 'xlsx';
import {
  DashboardData,
  CapitalData,
  ProjectData,
  BudgetData,
  OperationalData,
  FinancialData,
  RisksData,
  Milestone,
  CategorySpend,
  Risk,
  MonthlyProjection,
  CapitalRow,
  CostRow,
  MilestoneRow,
  SupplierRow,
  ProjectionRow,
  RiskRow,
} from './types';

function parseExcelDate(value: string | number | Date | undefined | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    // Excel serial date number
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

function getDaysRemaining(targetDate: Date | null): number {
  if (!targetDate) return 0;
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function parseCapital(sheet: XLSX.WorkSheet): CapitalData {
  const data = XLSX.utils.sheet_to_json<CapitalRow>(sheet);
  
  const getValue = (metric: string): number => {
    const row = data.find(r => r.Metric?.toLowerCase().includes(metric.toLowerCase()));
    return typeof row?.Value === 'number' ? row.Value : parseFloat(String(row?.Value || '0')) || 0;
  };
  
  const getStringValue = (metric: string): string => {
    const row = data.find(r => r.Metric?.toLowerCase().includes(metric.toLowerCase()));
    return String(row?.Value || '');
  };

  const totalRaised = getValue('total raised') || getValue('capital raised');
  const deployed = getValue('deployed') || getValue('capital deployed');
  const burnRate = getValue('burn rate') || getValue('monthly burn');
  const remaining = getValue('remaining') || (totalRaised - deployed);
  
  // Find next major expense
  const nextExpenseRow = data.find(r => 
    r.Metric?.toLowerCase().includes('next') && r.Metric?.toLowerCase().includes('expense')
  );
  
  return {
    totalRaised,
    deployed,
    deployedPercent: totalRaised > 0 ? (deployed / totalRaised) * 100 : 0,
    remaining,
    burnRate,
    runwayMonths: burnRate > 0 ? Math.floor(remaining / burnRate) : 0,
    nextMajorExpense: {
      description: nextExpenseRow?.Notes || getStringValue('next expense') || 'First Stock Order',
      amount: nextExpenseRow?.Value as number || getValue('next expense amount') || 0,
    },
  };
}

function parseMilestones(sheet: XLSX.WorkSheet): Milestone[] {
  const data = XLSX.utils.sheet_to_json<MilestoneRow>(sheet);
  
  return data.map(row => ({
    name: row.Milestone || '',
    targetDate: parseExcelDate(row['Target Date']),
    statusPercent: row['Status %'] || 0,
    complete: parseBoolean(row.Complete),
    actualDate: parseExcelDate(row['Actual Date']),
    notes: row.Notes || '',
  }));
}

function parseProject(sheet: XLSX.WorkSheet, location: string, targetDateStr: string): ProjectData {
  const milestones = parseMilestones(sheet);
  
  // Calculate overall completion as average of milestone percentages
  const completionPercent = milestones.length > 0
    ? milestones.reduce((sum, m) => sum + m.statusPercent, 0) / milestones.length
    : 0;
  
  const targetDate = new Date(targetDateStr);
  
  return {
    location,
    completionPercent,
    targetDate,
    daysRemaining: getDaysRemaining(targetDate),
    milestones,
  };
}

function parseBudget(sheet: XLSX.WorkSheet): BudgetData {
  const data = XLSX.utils.sheet_to_json<CostRow>(sheet);
  
  const byCategory: CategorySpend[] = data
    .filter(row => row.Category && row.Category.toLowerCase() !== 'total')
    .map(row => {
      const budgeted = row.Budgeted || 0;
      const actual = row.Actual || 0;
      const forecast = row.Forecast || actual;
      const variance = budgeted - actual;
      
      return {
        category: row.Category,
        budgeted,
        actual,
        forecast,
        variance,
        variancePercent: budgeted > 0 ? (variance / budgeted) * 100 : 0,
      };
    });
  
  const budgetedTotal = byCategory.reduce((sum, c) => sum + c.budgeted, 0);
  const actualSpend = byCategory.reduce((sum, c) => sum + c.actual, 0);
  const forecast = byCategory.reduce((sum, c) => sum + c.forecast, 0);
  const variance = budgetedTotal - actualSpend;
  
  return {
    budgetedTotal,
    actualSpend,
    variance,
    variancePercent: budgetedTotal > 0 ? (variance / budgetedTotal) * 100 : 0,
    forecast,
    byCategory,
  };
}

function parseOperational(supplierSheet: XLSX.WorkSheet): OperationalData {
  const suppliers = XLSX.utils.sheet_to_json<SupplierRow>(supplierSheet);
  
  const confirmedSuppliers = suppliers.filter(s => 
    s.Status?.toLowerCase() === 'confirmed' || s.Status?.toLowerCase() === 'yes'
  );
  
  const totalProducts = suppliers.reduce((sum, s) => sum + (s['Product Count'] || 0), 0);
  
  return {
    suppliersConfirmed: confirmedSuppliers.length,
    suppliersTotal: suppliers.length,
    productsInCatalogue: totalProducts,
    staffHired: 0,
    staffRequired: 2,
    websiteStatus: 'In Development',
    inventorySystemStatus: 'Planned',
  };
}

function parseFinancial(sheet: XLSX.WorkSheet): FinancialData {
  const data = XLSX.utils.sheet_to_json<ProjectionRow>(sheet);
  
  const revenueProjections: MonthlyProjection[] = data
    .filter(row => row.Month && row['Revenue Target'] !== undefined)
    .map(row => ({
      month: row.Month,
      revenue: row['Revenue Target'] || 0,
      isBreakEven: parseBoolean(row['Is Break Even']),
    }));
  
  const breakEvenRow = revenueProjections.find(p => p.isBreakEven);
  const year1Target = revenueProjections.reduce((sum, p) => sum + p.revenue, 0);
  
  return {
    revenueProjections,
    breakEvenMonth: breakEvenRow?.month || 'Month 9',
    month1Target: revenueProjections[0]?.revenue || 0,
    year1Target,
    grossMarginTarget: 45,
    b2bSplit: 60,
    b2cSplit: 40,
  };
}

function parseRisks(sheet: XLSX.WorkSheet): RisksData {
  const data = XLSX.utils.sheet_to_json<RiskRow>(sheet);
  
  const items: Risk[] = data.map(row => ({
    id: row['Risk ID'] || Math.random().toString(36).substr(2, 9),
    name: row['Risk Name'] || '',
    rag: row.RAG || 'Amber',
    description: row.Description || '',
    mitigation: row.Mitigation || '',
    status: row.Status || 'Open',
    owner: row.Owner || '',
    isBlocker: parseBoolean(row['Is Blocker']),
    isPendingDecision: parseBoolean(row['Pending Decision']),
  }));
  
  const openItems = items.filter(r => r.status === 'Open');
  
  return {
    red: openItems.filter(r => r.rag === 'Red').length,
    amber: openItems.filter(r => r.rag === 'Amber').length,
    green: openItems.filter(r => r.rag === 'Green').length,
    activeBlockers: openItems.filter(r => r.isBlocker).length,
    pendingDecisions: openItems.filter(r => r.isPendingDecision).length,
    items,
  };
}

export function parseExcelFile(buffer: ArrayBuffer): DashboardData {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  
  // Get sheets by name (case-insensitive matching)
  const getSheet = (name: string): XLSX.WorkSheet | null => {
    const sheetName = workbook.SheetNames.find(
      s => s.toLowerCase().replace(/[_\s]/g, '') === name.toLowerCase().replace(/[_\s]/g, '')
    );
    return sheetName ? workbook.Sheets[sheetName] : null;
  };
  
  const capitalSheet = getSheet('Capital_Investment') || getSheet('Capital');
  const costsSheet = getSheet('Costs_Tracker') || getSheet('Costs');
  const showroomSheet = getSheet('Showroom_Progress') || getSheet('Showroom');
  const warehouseSheet = getSheet('Warehouse_Progress') || getSheet('Warehouse');
  const suppliersSheet = getSheet('Suppliers');
  const financialSheet = getSheet('Financial_Projections') || getSheet('Financial');
  const risksSheet = getSheet('Risks_Issues') || getSheet('Risks');
  
  return {
    capital: capitalSheet ? parseCapital(capitalSheet) : getDefaultCapital(),
    showroom: showroomSheet 
      ? parseProject(showroomSheet, 'London Showroom', '2025-06-01')
      : getDefaultShowroom(),
    warehouse: warehouseSheet 
      ? parseProject(warehouseSheet, 'UK Warehouse', '2026-01-15')
      : getDefaultWarehouse(),
    budget: costsSheet ? parseBudget(costsSheet) : getDefaultBudget(),
    operational: suppliersSheet ? parseOperational(suppliersSheet) : getDefaultOperational(),
    financial: financialSheet ? parseFinancial(financialSheet) : getDefaultFinancial(),
    risks: risksSheet ? parseRisks(risksSheet) : getDefaultRisks(),
    lastUpdated: new Date(),
  };
}

// Default data functions for when Excel sheets are missing or for demo purposes
export function getDefaultCapital(): CapitalData {
  return {
    totalRaised: 250000,
    deployed: 87500,
    deployedPercent: 35,
    remaining: 162500,
    burnRate: 12500,
    runwayMonths: 13,
    nextMajorExpense: {
      description: 'First Stock Order - China Suppliers',
      amount: 75000,
    },
  };
}

export function getDefaultShowroom(): ProjectData {
  return {
    location: 'London Showroom',
    completionPercent: 45,
    targetDate: new Date('2025-06-01'),
    daysRemaining: getDaysRemaining(new Date('2025-06-01')),
    milestones: [
      { name: 'Lease Agreement Signed', targetDate: new Date('2024-11-01'), statusPercent: 100, complete: true, actualDate: new Date('2024-10-28'), notes: '' },
      { name: 'Design Plans Approved', targetDate: new Date('2024-12-15'), statusPercent: 100, complete: true, actualDate: new Date('2024-12-10'), notes: '' },
      { name: 'Contractor Appointed', targetDate: new Date('2025-01-15'), statusPercent: 75, complete: false, actualDate: null, notes: 'Final quotes being reviewed' },
      { name: 'Fit-out Commences', targetDate: new Date('2025-02-01'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
      { name: 'Fixtures & Displays Installed', targetDate: new Date('2025-04-15'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
      { name: 'Showroom Launch', targetDate: new Date('2025-06-01'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
    ],
  };
}

export function getDefaultWarehouse(): ProjectData {
  return {
    location: 'UK Warehouse',
    completionPercent: 25,
    targetDate: new Date('2026-01-15'),
    daysRemaining: getDaysRemaining(new Date('2026-01-15')),
    milestones: [
      { name: 'Lease Agreement Signed', targetDate: new Date('2024-10-01'), statusPercent: 100, complete: true, actualDate: new Date('2024-09-25'), notes: '' },
      { name: 'Landlord Refurb Design Approved', targetDate: new Date('2024-12-01'), statusPercent: 100, complete: true, actualDate: new Date('2024-11-28'), notes: '' },
      { name: 'Landlord Refurb In Progress', targetDate: new Date('2025-09-01'), statusPercent: 15, complete: false, actualDate: null, notes: 'Landlord managing refurbishment' },
      { name: 'Internal Fit-out Planning', targetDate: new Date('2025-08-01'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
      { name: 'Racking & Storage Installed', targetDate: new Date('2025-12-01'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
      { name: 'Warehouse Operational', targetDate: new Date('2026-01-15'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
    ],
    notes: 'Refurbishment managed by landlord',
  };
}

export function getDefaultBudget(): BudgetData {
  const byCategory: CategorySpend[] = [
    { category: 'Showroom Fit-out', budgeted: 65000, actual: 22000, forecast: 62000, variance: 43000, variancePercent: 66.15 },
    { category: 'Warehouse Setup', budgeted: 40000, actual: 8000, forecast: 38000, variance: 32000, variancePercent: 80 },
    { category: 'Initial Stock', budgeted: 75000, actual: 0, forecast: 75000, variance: 75000, variancePercent: 100 },
    { category: 'Legal & Professional', budgeted: 15000, actual: 12500, forecast: 14000, variance: 2500, variancePercent: 16.67 },
    { category: 'Marketing & Launch', budgeted: 25000, actual: 5000, forecast: 25000, variance: 20000, variancePercent: 80 },
    { category: 'Technology & Systems', budgeted: 12000, actual: 6000, forecast: 11000, variance: 6000, variancePercent: 50 },
    { category: 'Working Capital', budgeted: 18000, actual: 34000, forecast: 40000, variance: -16000, variancePercent: -88.89 },
  ];
  
  const budgetedTotal = byCategory.reduce((sum, c) => sum + c.budgeted, 0);
  const actualSpend = byCategory.reduce((sum, c) => sum + c.actual, 0);
  const forecast = byCategory.reduce((sum, c) => sum + c.forecast, 0);
  
  return {
    budgetedTotal,
    actualSpend,
    variance: budgetedTotal - actualSpend,
    variancePercent: ((budgetedTotal - actualSpend) / budgetedTotal) * 100,
    forecast,
    byCategory,
  };
}

export function getDefaultOperational(): OperationalData {
  return {
    suppliersConfirmed: 4,
    suppliersTotal: 6,
    productsInCatalogue: 847,
    staffHired: 1,
    staffRequired: 3,
    websiteStatus: 'In Development',
    inventorySystemStatus: 'Planned',
  };
}

export function getDefaultFinancial(): FinancialData {
  return {
    revenueProjections: [
      { month: 'Month 1', revenue: 15000 },
      { month: 'Month 2', revenue: 22000 },
      { month: 'Month 3', revenue: 35000 },
      { month: 'Month 4', revenue: 48000 },
      { month: 'Month 5', revenue: 62000 },
      { month: 'Month 6', revenue: 78000 },
      { month: 'Month 7', revenue: 95000 },
      { month: 'Month 8', revenue: 115000 },
      { month: 'Month 9', revenue: 135000, isBreakEven: true },
      { month: 'Month 10', revenue: 155000 },
      { month: 'Month 11', revenue: 175000 },
      { month: 'Month 12', revenue: 195000 },
    ],
    breakEvenMonth: 'Month 9',
    month1Target: 15000,
    year1Target: 1130000,
    grossMarginTarget: 45,
    b2bSplit: 60,
    b2cSplit: 40,
  };
}

export function getDefaultRisks(): RisksData {
  const items: Risk[] = [
    {
      id: 'R001',
      name: 'Supplier Lead Times',
      rag: 'Amber',
      description: 'Chinese New Year may impact initial stock delivery timeline',
      mitigation: 'Planning stock order 6 weeks before CNY. Multiple supplier relationships.',
      status: 'Open',
      owner: 'Operations',
      isBlocker: false,
      isPendingDecision: false,
    },
    {
      id: 'R002',
      name: 'Warehouse Refurb Delay',
      rag: 'Amber',
      description: 'Landlord refurbishment timeline dependent on contractor availability',
      mitigation: 'Weekly progress calls with landlord. Contingency storage identified.',
      status: 'Open',
      owner: 'Operations',
      isBlocker: false,
      isPendingDecision: false,
    },
    {
      id: 'R003',
      name: 'Import Duties Post-Brexit',
      rag: 'Green',
      description: 'Potential changes to UK import regulations',
      mitigation: 'Working with customs broker. Duty calculations built into pricing model.',
      status: 'Open',
      owner: 'Finance',
      isBlocker: false,
      isPendingDecision: false,
    },
    {
      id: 'R004',
      name: 'Showroom Contractor Selection',
      rag: 'Amber',
      description: 'Final contractor decision pending - 3 quotes received',
      mitigation: 'Expediting final meetings. Budget allows for preferred contractor.',
      status: 'Open',
      owner: 'Project Lead',
      isBlocker: false,
      isPendingDecision: true,
    },
    {
      id: 'R005',
      name: 'Currency Fluctuation',
      rag: 'Amber',
      description: 'GBP/CNY exchange rate volatility affects stock costs',
      mitigation: 'Building 5% currency buffer into pricing. Considering forward contracts.',
      status: 'Open',
      owner: 'Finance',
      isBlocker: false,
      isPendingDecision: false,
    },
    {
      id: 'R006',
      name: 'Staff Recruitment',
      rag: 'Green',
      description: 'Need to hire showroom manager and warehouse staff',
      mitigation: 'Recruitment to begin Q1 2025. Job specs prepared.',
      status: 'Open',
      owner: 'HR',
      isBlocker: false,
      isPendingDecision: false,
    },
  ];
  
  return {
    red: 0,
    amber: 4,
    green: 2,
    activeBlockers: 0,
    pendingDecisions: 1,
    items,
  };
}

export function getDefaultDashboardData(): DashboardData {
  return {
    capital: getDefaultCapital(),
    showroom: getDefaultShowroom(),
    warehouse: getDefaultWarehouse(),
    budget: getDefaultBudget(),
    operational: getDefaultOperational(),
    financial: getDefaultFinancial(),
    risks: getDefaultRisks(),
    lastUpdated: new Date(),
  };
}

