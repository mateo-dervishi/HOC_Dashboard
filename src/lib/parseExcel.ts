import * as XLSX from 'xlsx';
import {
  DashboardData,
  CapitalData,
  ProjectData,
  BudgetData,
  OperationalData,
  FinancialData,
  RisksData,
  CashFlowData,
  MonthlyOutgoing,
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

interface SettingsRow {
  Setting: string;
  Value: string | number;
  Notes?: string;
}

function parseOperational(supplierSheet: XLSX.WorkSheet, settingsSheet?: XLSX.WorkSheet | null): OperationalData {
  const suppliers = XLSX.utils.sheet_to_json<SupplierRow>(supplierSheet);
  
  const confirmedSuppliers = suppliers.filter(s => 
    s.Status?.toLowerCase() === 'confirmed' || s.Status?.toLowerCase() === 'yes'
  );
  
  const totalProducts = suppliers.reduce((sum, s) => sum + (s['Product Count'] || 0), 0);
  
  // Parse settings if available
  let staffHired = 1;
  let staffRequired = 3;
  let websiteStatus: 'Not Started' | 'In Development' | 'Live' | 'Planned' = 'In Development';
  let inventorySystemStatus: 'Not Started' | 'In Development' | 'Live' | 'Planned' = 'Planned';
  
  if (settingsSheet) {
    const settings = XLSX.utils.sheet_to_json<SettingsRow>(settingsSheet);
    
    const getSetting = (name: string): string | number | undefined => {
      const row = settings.find(s => s.Setting?.toLowerCase().includes(name.toLowerCase()));
      return row?.Value;
    };
    
    staffHired = Number(getSetting('staff hired')) || 1;
    staffRequired = Number(getSetting('staff required')) || 3;
    
    const webStatus = String(getSetting('website status') || 'In Development');
    if (['Not Started', 'In Development', 'Live', 'Planned'].includes(webStatus)) {
      websiteStatus = webStatus as typeof websiteStatus;
    }
    
    const invStatus = String(getSetting('inventory system') || 'Planned');
    if (['Not Started', 'In Development', 'Live', 'Planned'].includes(invStatus)) {
      inventorySystemStatus = invStatus as typeof inventorySystemStatus;
    }
  }
  
  return {
    suppliersConfirmed: confirmedSuppliers.length,
    suppliersTotal: suppliers.length,
    productsInCatalogue: totalProducts,
    staffHired,
    staffRequired,
    websiteStatus,
    inventorySystemStatus,
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
  const settingsSheet = getSheet('Settings');
  
  // Parse settings for locations and dates
  let showroomLocation = 'London Showroom';
  let showroomTargetDate = '2025-06-01';
  let showroomPaused = true;
  let showroomPauseReason = 'Project currently on hold pending strategic review';
  let warehouseLocation = 'UK Warehouse';
  let warehouseTargetDate = '2026-01-15';
  let warehousePaused = false;
  let warehousePauseReason = '';
  let grossMarginTarget = 45;
  let b2bSplit = 60;
  let b2cSplit = 40;
  
  if (settingsSheet) {
    const settings = XLSX.utils.sheet_to_json<{ Setting: string; Value: string | number; Notes?: string }>(settingsSheet);
    const getSetting = (name: string): string | number | undefined => {
      const row = settings.find(s => s.Setting?.toLowerCase().includes(name.toLowerCase()));
      return row?.Value;
    };
    const getSettingNotes = (name: string): string | undefined => {
      const row = settings.find(s => s.Setting?.toLowerCase().includes(name.toLowerCase()));
      return row?.Notes;
    };
    
    showroomLocation = String(getSetting('showroom location') || showroomLocation);
    showroomTargetDate = String(getSetting('showroom target') || showroomTargetDate);
    warehouseLocation = String(getSetting('warehouse location') || warehouseLocation);
    warehouseTargetDate = String(getSetting('warehouse target') || warehouseTargetDate);
    grossMarginTarget = Number(getSetting('gross margin')) || grossMarginTarget;
    b2bSplit = Number(getSetting('b2b split')) || b2bSplit;
    b2cSplit = Number(getSetting('b2c split')) || b2cSplit;
    
    // Parse paused states
    const showroomPausedVal = getSetting('showroom paused');
    showroomPaused = showroomPausedVal === 'Yes' || showroomPausedVal === 'yes' || showroomPausedVal === 1;
    showroomPauseReason = String(getSettingNotes('showroom paused') || showroomPauseReason);
    
    const warehousePausedVal = getSetting('warehouse paused');
    warehousePaused = warehousePausedVal === 'Yes' || warehousePausedVal === 'yes' || warehousePausedVal === 1;
    warehousePauseReason = String(getSettingNotes('warehouse paused') || '');
  }
  
  const financial = financialSheet ? parseFinancial(financialSheet) : getDefaultFinancial();
  
  const showroomData = showroomSheet 
    ? parseProject(showroomSheet, showroomLocation, showroomTargetDate)
    : getDefaultShowroom();
    
  const warehouseData = warehouseSheet 
    ? parseProject(warehouseSheet, warehouseLocation, warehouseTargetDate)
    : getDefaultWarehouse();

  return {
    capital: capitalSheet ? parseCapital(capitalSheet) : getDefaultCapital(),
    showroom: {
      ...showroomData,
      isPaused: showroomPaused,
      pauseReason: showroomPauseReason,
    },
    warehouse: {
      ...warehouseData,
      isPaused: warehousePaused,
      pauseReason: warehousePauseReason,
    },
    budget: costsSheet ? parseBudget(costsSheet) : getDefaultBudget(),
    operational: suppliersSheet ? parseOperational(suppliersSheet, settingsSheet) : getDefaultOperational(),
    financial: {
      ...financial,
      grossMarginTarget,
      b2bSplit,
      b2cSplit,
    },
    risks: risksSheet ? parseRisks(risksSheet) : getDefaultRisks(),
    cashFlow: getDefaultCashFlow(),
    lastUpdated: new Date(),
  };
}

// Default data functions for when Excel sheets are missing or for demo purposes
export function getDefaultCapital(): CapitalData {
  return {
    totalRaised: 625000,
    deployed: 0,
    deployedPercent: 0,
    remaining: 625000,
    burnRate: 17000,
    runwayMonths: 36,
    nextMajorExpense: {
      description: 'Warehouse Initial Payment (Due Dec 19th)',
      amount: 245176,
    },
  };
}

export function getDefaultShowroom(): ProjectData {
  return {
    location: 'London Showroom',
    completionPercent: 48,
    targetDate: new Date('2026-06-01'),
    daysRemaining: getDaysRemaining(new Date('2026-06-01')),
    milestones: [
      { name: 'Lease Agreement Signed', targetDate: new Date('2025-03-01'), statusPercent: 100, complete: true, actualDate: new Date('2025-02-25'), notes: '' },
      { name: 'Landlord Scope Complete', targetDate: new Date('2025-04-30'), statusPercent: 100, complete: true, actualDate: new Date('2025-04-15'), notes: 'Landlord finished his works' },
      { name: 'Contractor Appointed', targetDate: new Date('2025-06-01'), statusPercent: 100, complete: true, actualDate: new Date('2025-05-20'), notes: '' },
      { name: '1st Fix In Progress', targetDate: new Date('2026-01-15'), statusPercent: 40, complete: false, actualDate: null, notes: 'Current standstill - expected complete in 1.5 months' },
      { name: '2nd Fix', targetDate: new Date('2026-03-01'), statusPercent: 0, complete: false, actualDate: null, notes: 'TBC - follows 1st fix' },
      { name: 'Fixtures & Displays', targetDate: new Date('2026-05-01'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
      { name: 'Showroom Launch', targetDate: new Date('2026-06-01'), statusPercent: 0, complete: false, actualDate: null, notes: '' },
    ],
    isPaused: false,
    pauseReason: '',
  };
}

export function getDefaultWarehouse(): ProjectData {
  return {
    location: 'UK Warehouse',
    completionPercent: 55,
    targetDate: new Date('2026-01-31'),
    daysRemaining: getDaysRemaining(new Date('2026-01-31')),
    milestones: [
      { name: 'Lease Agreement Signed', targetDate: new Date('2025-06-01'), statusPercent: 100, complete: true, actualDate: new Date('2025-05-28'), notes: '' },
      { name: 'Refurb Design Approved', targetDate: new Date('2025-09-01'), statusPercent: 100, complete: true, actualDate: new Date('2025-08-25'), notes: '' },
      { name: 'Warehouse Refurb', targetDate: new Date('2025-12-19'), statusPercent: 90, complete: false, actualDate: null, notes: 'Landlord refurb in progress - handover Dec 19th' },
      { name: 'Landlord Handover', targetDate: new Date('2025-12-19'), statusPercent: 0, complete: false, actualDate: null, notes: 'Warehouse becomes operational' },
      { name: 'Racking & Setup', targetDate: new Date('2026-01-15'), statusPercent: 0, complete: false, actualDate: null, notes: 'Internal setup after handover' },
      { name: 'Warehouse Fully Operational', targetDate: new Date('2026-01-31'), statusPercent: 0, complete: false, actualDate: null, notes: 'All systems ready' },
    ],
    notes: 'Handover from landlord: Dec 19th, 2025',
    isPaused: false,
  };
}

export function getDefaultBudget(): BudgetData {
  const byCategory: CategorySpend[] = [
    { category: 'Warehouse - Rent Deposit (7 months)', budgeted: 179743, actual: 0, forecast: 179743, variance: 179743, variancePercent: 100 },
    { category: 'Warehouse - Q1 Rent', budgeted: 38516, actual: 0, forecast: 38516, variance: 38516, variancePercent: 100 },
    { category: 'Warehouse - Service Charge (Year)', budgeted: 48000, actual: 0, forecast: 48000, variance: 48000, variancePercent: 100 },
    { category: 'Warehouse - Insurance (Annual)', budgeted: 4800, actual: 0, forecast: 4800, variance: 4800, variancePercent: 100 },
    { category: 'Warehouse - Business Rates (Year)', budgeted: 60000, actual: 0, forecast: 60000, variance: 60000, variancePercent: 100 },
    { category: 'Warehouse - Legal/Professional', budgeted: 13117, actual: 0, forecast: 13117, variance: 13117, variancePercent: 100 },
    { category: 'Warehouse - Racking & Setup', budgeted: 25000, actual: 0, forecast: 25000, variance: 25000, variancePercent: 100 },
    { category: 'Showroom - Total Completion', budgeted: 255000, actual: 0, forecast: 255000, variance: 255000, variancePercent: 100 },
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

export function getDefaultCashFlow(): CashFlowData {
  // Starting balance: £625,000
  // Dec outgoings: £253,176 → Closing: £371,824
  // Jan outgoings: £5,000 → Closing: £366,824
  // Feb outgoings: £5,000 → Closing: £361,824
  // Mar outgoings: £55,516.40 → Closing: £306,307.60
  // Apr outgoings: £5,000 → Closing: £301,307.60
  // May outgoings: £5,000 → Closing: £296,307.60
  // Jun outgoings: £55,516.40 → Closing: £240,791.20
  
  return {
    projections: [
      {
        month: 'Dec 2025',
        outgoings: 253176,
        netTotal: 188815.50,
        vatTotal: 34283.10,
        details: [
          { item: 'Legal/Professional Fees', net: 10930.50, vat: 2186.10, gross: 13116.60, vatReclaimable: true },
          { item: 'Rent Deposit (7 months)', net: 128388, vat: 25677.60, gross: 154065.60, vatReclaimable: true },
          { item: 'Q1 Rent', net: 32097, vat: 6419.40, gross: 38516.40, vatReclaimable: true },
          { item: 'Service Charge (Q1)', net: 12000, vat: 0, gross: 12000, vatReclaimable: false },
          { item: 'Insurance (Annual)', net: 4800, vat: 0, gross: 4800, vatReclaimable: false },
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
        ],
        closingBalance: 371824,
      },
      {
        month: 'Jan 2026',
        outgoings: 5000,
        netTotal: 5000,
        vatTotal: 0,
        details: [
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
        ],
        closingBalance: 366824,
      },
      {
        month: 'Feb 2026',
        outgoings: 5000,
        netTotal: 5000,
        vatTotal: 0,
        details: [
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
        ],
        closingBalance: 361824,
      },
      {
        month: 'Mar 2026',
        outgoings: 55516.40,
        netTotal: 49097,
        vatTotal: 6419.40,
        details: [
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
          { item: 'Q2 Rent', net: 32097, vat: 6419.40, gross: 38516.40, vatReclaimable: true },
          { item: 'Service Charge (Q2)', net: 12000, vat: 0, gross: 12000, vatReclaimable: false },
        ],
        closingBalance: 306307.60,
      },
      {
        month: 'Apr 2026',
        outgoings: 5000,
        netTotal: 5000,
        vatTotal: 0,
        details: [
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
        ],
        closingBalance: 301307.60,
      },
      {
        month: 'May 2026',
        outgoings: 5000,
        netTotal: 5000,
        vatTotal: 0,
        details: [
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
        ],
        closingBalance: 296307.60,
      },
      {
        month: 'Jun 2026',
        outgoings: 55516.40,
        netTotal: 49097,
        vatTotal: 6419.40,
        details: [
          { item: 'Business Rates', net: 5000, vat: 0, gross: 5000, vatReclaimable: false },
          { item: 'Q3 Rent', net: 32097, vat: 6419.40, gross: 38516.40, vatReclaimable: true },
          { item: 'Service Charge (Q3)', net: 12000, vat: 0, gross: 12000, vatReclaimable: false },
        ],
        closingBalance: 240791.20,
      },
    ],
    burnRate: 17000,
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
    cashFlow: getDefaultCashFlow(),
    lastUpdated: new Date(),
  };
}

