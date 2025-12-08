const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create a new workbook
const workbook = XLSX.utils.book_new();

// ============================================
// Sheet 1: Capital_Investment
// ============================================
const capitalData = [
  ['Metric', 'Value', 'Notes'],
  ['Total Capital Raised', 625000, 'Total investment secured'],
  ['Capital Deployed', 0, 'No payments made yet - awaiting landlord handover'],
  ['Capital Remaining', 625000, 'Full amount available'],
  ['Monthly Burn Rate', 17000, 'Estimated ongoing monthly costs after initial setup'],
  ['Runway (Months)', 36, 'Calculated from remaining/burn rate'],
  ['Next Major Expense', 245176, 'Due on landlord handover (Dec 19th)'],
  ['Next Expense Description', 'Warehouse Initial Payment', 'Rent deposit, Q1 rent, service charge, insurance, business rates, legal'],
];
const capitalSheet = XLSX.utils.aoa_to_sheet(capitalData);
capitalSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 55 }];
XLSX.utils.book_append_sheet(workbook, capitalSheet, 'Capital_Investment');

// ============================================
// Sheet 2: Costs_Tracker
// ============================================
const costsData = [
  ['Category', 'Budgeted', 'Actual', 'Forecast', 'Notes'],
  ['Warehouse - Rent Deposit (7 months)', 154065.60, 0, 154065.60, '£128,388 + VAT (£25,677.60) - Due Dec 19th'],
  ['Warehouse - Q1 Rent', 38516.40, 0, 38516.40, '£32,097 + VAT (£6,419.40) - Due Dec 19th'],
  ['Warehouse - Service Charge (Quarterly)', 12000, 0, 48000, '£12,000 per quarter - No VAT'],
  ['Warehouse - Insurance (Annual)', 4800, 0, 4800, 'Yearly upfront - VAT exempt - Due Dec 19th'],
  ['Warehouse - Business Rates (Monthly)', 5000, 0, 60000, '£5,000 per month - No VAT'],
  ['Warehouse - Legal/Professional', 13116.60, 0, 13116.60, '£10,930.50 + VAT (£2,186.10) - Due Dec 19th'],
  ['Showroom - Total Completion', 255000, 0, 255000, 'Estimate to complete showroom'],
];
const costsSheet = XLSX.utils.aoa_to_sheet(costsData);
costsSheet['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 45 }];
XLSX.utils.book_append_sheet(workbook, costsSheet, 'Costs_Tracker');

// ============================================
// Sheet 3: Showroom_Progress
// ============================================
const showroomData = [
  ['Milestone', 'Target Date', 'Status %', 'Complete', 'Actual Date', 'Notes'],
  ['Lease Agreement Signed', '2025-03-01', 100, 'Yes', '2025-02-25', 'Completed'],
  ['Landlord Scope Complete', '2025-04-30', 100, 'Yes', '2025-04-15', 'Landlord finished his works'],
  ['Contractor Appointed', '2025-06-01', 100, 'Yes', '2025-05-20', 'Contractor selected and appointed'],
  ['1st Fix In Progress', '2026-01-15', 40, 'No', '', 'Currently on standstill - expected complete in 1.5 months'],
  ['2nd Fix', '2026-03-01', 0, 'No', '', 'TBC - follows 1st fix completion'],
  ['Fixtures & Displays', '2026-05-01', 0, 'No', '', 'Final installations'],
  ['Showroom Launch', '2026-06-01', 0, 'No', '', 'Target opening date'],
];
const showroomSheet = XLSX.utils.aoa_to_sheet(showroomData);
showroomSheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 50 }];
XLSX.utils.book_append_sheet(workbook, showroomSheet, 'Showroom_Progress');

// ============================================
// Sheet 4: Warehouse_Progress
// ============================================
const warehouseData = [
  ['Milestone', 'Target Date', 'Status %', 'Complete', 'Actual Date', 'Notes'],
  ['Lease Agreement Signed', '2025-06-01', 100, 'Yes', '2025-05-28', 'Long-term lease secured'],
  ['Refurb Design Approved', '2025-09-01', 100, 'Yes', '2025-08-25', 'Specifications agreed'],
  ['Warehouse Refurb', '2025-12-19', 90, 'No', '', 'Landlord refurb in progress - handover Dec 19th'],
  ['Landlord Handover', '2025-12-19', 0, 'No', '', 'Warehouse becomes operational'],
  ['Racking & Setup', '2026-01-15', 0, 'No', '', 'Internal setup after handover'],
  ['Warehouse Fully Operational', '2026-01-31', 0, 'No', '', 'All systems ready'],
];
const warehouseSheet = XLSX.utils.aoa_to_sheet(warehouseData);
warehouseSheet['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 45 }];
XLSX.utils.book_append_sheet(workbook, warehouseSheet, 'Warehouse_Progress');

// ============================================
// Sheet 5: Suppliers
// ============================================
const suppliersData = [
  ['Supplier', 'Status', 'Product Count', 'Category', 'Notes'],
  ['Guangzhou Sanitary Co.', 'Confirmed', 245, 'Bathroom', 'Premium bathroom fixtures'],
  ['Foshan Tiles Ltd', 'Confirmed', 312, 'Tiles', 'Porcelain and ceramic tiles'],
  ['Zhongshan Lighting', 'Confirmed', 156, 'Lighting', 'Designer lighting fixtures'],
  ['Shenzhen Electric', 'Confirmed', 89, 'Electrical', 'Switches, sockets, accessories'],
  ['Dongguan Furniture', 'Pending', 0, 'Furniture', 'Final samples awaited'],
  ['Shanghai Kitchen Systems', 'Pending', 45, 'Kitchen', 'Cabinet and worktop supplier'],
];
const suppliersSheet = XLSX.utils.aoa_to_sheet(suppliersData);
suppliersSheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 30 }];
XLSX.utils.book_append_sheet(workbook, suppliersSheet, 'Suppliers');

// ============================================
// Sheet 6: Financial_Projections
// ============================================
const financialData = [
  ['Month', 'Revenue Target', 'Is Break Even', 'Notes'],
  ['Month 1', 15000, 'No', 'Soft launch period'],
  ['Month 2', 22000, 'No', 'Building customer base'],
  ['Month 3', 35000, 'No', 'Marketing push begins'],
  ['Month 4', 48000, 'No', 'B2B outreach'],
  ['Month 5', 62000, 'No', 'Trade show participation'],
  ['Month 6', 78000, 'No', 'Summer season'],
  ['Month 7', 95000, 'No', 'Expanded product range'],
  ['Month 8', 115000, 'No', 'Approaching break-even'],
  ['Month 9', 135000, 'Yes', 'BREAK-EVEN MONTH'],
  ['Month 10', 155000, 'No', 'Profitable operations'],
  ['Month 11', 175000, 'No', 'Pre-Christmas peak'],
  ['Month 12', 195000, 'No', 'Year-end target'],
];
const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
financialSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 14 }, { wch: 30 }];
XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial_Projections');

// ============================================
// Sheet 7: Risks_Issues
// ============================================
const risksData = [
  ['Risk ID', 'Risk Name', 'RAG', 'Description', 'Mitigation', 'Status', 'Owner', 'Is Blocker', 'Pending Decision'],
  ['R001', 'Showroom 1st Fix Delay', 'Amber', 'Current standstill on 1st fix works', 'Monitoring closely - expected to resume shortly', 'Open', 'Project Lead', 'No', 'No'],
  ['R002', 'Warehouse Handover Timing', 'Green', 'Landlord confirmed Dec 19th handover', 'Date confirmed - preparing for handover', 'Open', 'Operations', 'No', 'No'],
  ['R003', 'Supplier Lead Times', 'Amber', 'Chinese New Year may impact initial stock delivery', 'Planning stock order ahead of CNY', 'Open', 'Operations', 'No', 'No'],
  ['R004', 'Currency Fluctuation', 'Amber', 'GBP/CNY exchange rate volatility', 'Building 5% currency buffer into pricing', 'Open', 'Finance', 'No', 'No'],
  ['R005', 'Cash Flow Management', 'Green', 'Large initial payment due Dec 19th', 'Capital secured and available', 'Open', 'Finance', 'No', 'No'],
  ['R006', 'Staff Recruitment', 'Green', 'Need to hire warehouse and showroom staff', 'Recruitment to begin Q1 2026', 'Open', 'HR', 'No', 'No'],
];
const risksSheet = XLSX.utils.aoa_to_sheet(risksData);
risksSheet['!cols'] = [
  { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 45 }, 
  { wch: 45 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 16 }
];
XLSX.utils.book_append_sheet(workbook, risksSheet, 'Risks_Issues');

// ============================================
// Sheet 8: Monthly_Cashflow
// ============================================
const cashflowData = [
  ['Month', 'Item', 'Net Amount', 'VAT (20%)', 'Gross Amount', 'VAT Reclaimable', 'Running Balance', 'Notes'],
  ['Opening', 'Capital Raised', 625000, 0, 625000, 'N/A', 625000, 'Starting balance'],
  ['Dec 2025', 'Legal/Professional Fees', 10930.50, 2186.10, 13116.60, 'Yes', 611883.40, 'Legal and professional fees'],
  ['Dec 2025', 'Rent Deposit (7 months)', 128388, 25677.60, 154065.60, 'Yes', 457817.80, '7 months deposit'],
  ['Dec 2025', 'Q1 Rent', 32097, 6419.40, 38516.40, 'Yes', 419301.40, 'Quarter 1 rent payment'],
  ['Dec 2025', 'Service Charge (Q1)', 12000, 0, 12000, 'No', 407301.40, 'Quarterly service charge - exempt'],
  ['Dec 2025', 'Insurance (Annual)', 4800, 0, 4800, 'No', 402501.40, 'Annual insurance - exempt'],
  ['Dec 2025', 'Business Rates', 5000, 0, 5000, 'No', 371824, 'Monthly - no VAT on rates'],
  ['Jan 2026', 'Business Rates', 5000, 0, 5000, 'No', 366824, 'Monthly payment'],
  ['Feb 2026', 'Business Rates', 5000, 0, 5000, 'No', 361824, 'Monthly payment'],
  ['Mar 2026', 'Business Rates', 5000, 0, 5000, 'No', 356824, 'Monthly payment'],
  ['Mar 2026', 'Q2 Rent', 32097, 6419.40, 38516.40, 'Yes', 318307.60, 'Quarter 2 rent payment'],
  ['Mar 2026', 'Service Charge (Q2)', 12000, 0, 12000, 'No', 306307.60, 'Quarterly service charge'],
  ['Apr 2026', 'Business Rates', 5000, 0, 5000, 'No', 301307.60, 'Monthly payment'],
  ['May 2026', 'Business Rates', 5000, 0, 5000, 'No', 296307.60, 'Monthly payment'],
  ['Jun 2026', 'Business Rates', 5000, 0, 5000, 'No', 291307.60, 'Monthly payment'],
  ['Jun 2026', 'Q3 Rent', 32097, 6419.40, 38516.40, 'Yes', 252791.20, 'Quarter 3 rent payment'],
  ['Jun 2026', 'Service Charge (Q3)', 12000, 0, 12000, 'No', 240791.20, 'Quarterly service charge'],
];
const cashflowSheet = XLSX.utils.aoa_to_sheet(cashflowData);
cashflowSheet['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
XLSX.utils.book_append_sheet(workbook, cashflowSheet, 'Monthly_Cashflow');

// ============================================
// Sheet 9: Settings (for metadata)
// ============================================
const settingsData = [
  ['Setting', 'Value', 'Notes'],
  ['Showroom Location', 'London Showroom', 'Display name'],
  ['Showroom Target Date', '2026-06-01', 'Target completion'],
  ['Showroom Paused', 'No', 'Active - 1st fix in progress'],
  ['Warehouse Location', 'UK Warehouse', 'Display name'],
  ['Warehouse Target Date', '2026-01-31', 'Target fully operational'],
  ['Warehouse Paused', 'No', ''],
  ['Warehouse Handover Date', '2025-12-19', 'Landlord handover date'],
  ['Gross Margin Target', 45, 'Percentage'],
  ['B2B Split', 60, 'Percentage of revenue'],
  ['B2C Split', 40, 'Percentage of revenue'],
  ['Staff Required', 3, 'Total headcount needed'],
  ['Staff Hired', 1, 'Current headcount'],
  ['Website Status', 'In Development', 'Options: Not Started, In Development, Live, Planned'],
  ['Inventory System Status', 'Planned', 'Options: Not Started, In Development, Live, Planned'],
];
const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
settingsSheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 45 }];
XLSX.utils.book_append_sheet(workbook, settingsSheet, 'Settings');

// Write the workbook to file
const outputPath = path.join(dataDir, 'HOC_Investor_Dashboard_Template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Excel template created successfully at:`);
console.log(`   ${outputPath}`);
console.log('');
console.log('📋 Sheets created:');
console.log('   1. Capital_Investment - Capital and cash position');
console.log('   2. Costs_Tracker - Budget vs actual by category');
console.log('   3. Showroom_Progress - Showroom milestones');
console.log('   4. Warehouse_Progress - Warehouse milestones');
console.log('   5. Suppliers - Supplier list and status');
console.log('   6. Financial_Projections - Monthly revenue targets');
console.log('   7. Risks_Issues - Risk register');
console.log('   8. Monthly_Cashflow - Monthly cash flow projections');
console.log('   9. Settings - Dashboard configuration');
console.log('');
console.log('📝 To update dashboard data:');
console.log('   1. Open the Excel file');
console.log('   2. Edit the values in each sheet');
console.log('   3. Save the file');
console.log('   4. Refresh the dashboard (or wait for auto-refresh)');
