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
  ['Total Capital Raised', 250000, 'Seed round from angel investors'],
  ['Capital Deployed', 87500, 'As of current date'],
  ['Capital Remaining', 162500, 'Available for deployment'],
  ['Monthly Burn Rate', 12500, 'Average monthly expenditure'],
  ['Runway (Months)', 13, 'Calculated from remaining/burn rate'],
  ['Next Major Expense', 75000, 'First Stock Order - China Suppliers'],
];
const capitalSheet = XLSX.utils.aoa_to_sheet(capitalData);
capitalSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 40 }];
XLSX.utils.book_append_sheet(workbook, capitalSheet, 'Capital_Investment');

// ============================================
// Sheet 2: Costs_Tracker
// ============================================
const costsData = [
  ['Category', 'Budgeted', 'Actual', 'Forecast', 'Notes'],
  ['Showroom Fit-out', 65000, 22000, 62000, 'Design and construction'],
  ['Warehouse Setup', 40000, 8000, 38000, 'Racking, systems, initial setup'],
  ['Initial Stock', 75000, 0, 75000, 'First order from China suppliers'],
  ['Legal & Professional', 15000, 12500, 14000, 'Company formation, contracts, accounting'],
  ['Marketing & Launch', 25000, 5000, 25000, 'Brand, website, launch campaign'],
  ['Technology & Systems', 12000, 6000, 11000, 'POS, inventory, website'],
  ['Working Capital', 18000, 34000, 40000, 'Operating expenses, contingency'],
];
const costsSheet = XLSX.utils.aoa_to_sheet(costsData);
costsSheet['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 40 }];
XLSX.utils.book_append_sheet(workbook, costsSheet, 'Costs_Tracker');

// ============================================
// Sheet 3: Showroom_Progress
// ============================================
const showroomData = [
  ['Milestone', 'Target Date', 'Status %', 'Complete', 'Actual Date', 'Notes'],
  ['Lease Agreement Signed', '2024-11-01', 100, 'Yes', '2024-10-28', 'Completed ahead of schedule'],
  ['Design Plans Approved', '2024-12-15', 100, 'Yes', '2024-12-10', 'Final designs signed off'],
  ['Contractor Appointed', '2025-01-15', 75, 'No', '', 'Final quotes being reviewed'],
  ['Fit-out Commences', '2025-02-01', 0, 'No', '', 'Awaiting contractor selection'],
  ['Fixtures & Displays Installed', '2025-04-15', 0, 'No', '', 'Custom displays ordered'],
  ['Showroom Launch', '2025-06-01', 0, 'No', '', 'Target opening date'],
];
const showroomSheet = XLSX.utils.aoa_to_sheet(showroomData);
showroomSheet['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
XLSX.utils.book_append_sheet(workbook, showroomSheet, 'Showroom_Progress');

// ============================================
// Sheet 4: Warehouse_Progress
// ============================================
const warehouseData = [
  ['Milestone', 'Target Date', 'Status %', 'Complete', 'Actual Date', 'Notes'],
  ['Lease Agreement Signed', '2024-10-01', 100, 'Yes', '2024-09-25', 'Long-term lease secured'],
  ['Landlord Refurb Design Approved', '2024-12-01', 100, 'Yes', '2024-11-28', 'Specifications agreed'],
  ['Landlord Refurb In Progress', '2025-09-01', 15, 'No', '', 'Landlord managing refurbishment'],
  ['Internal Fit-out Planning', '2025-08-01', 0, 'No', '', 'Racking layout design'],
  ['Racking & Storage Installed', '2025-12-01', 0, 'No', '', 'Industrial racking system'],
  ['Warehouse Operational', '2026-01-15', 0, 'No', '', 'Target go-live date'],
];
const warehouseSheet = XLSX.utils.aoa_to_sheet(warehouseData);
warehouseSheet['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
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
  ['R001', 'Supplier Lead Times', 'Amber', 'Chinese New Year may impact initial stock delivery timeline', 'Planning stock order 6 weeks before CNY. Multiple supplier relationships.', 'Open', 'Operations', 'No', 'No'],
  ['R002', 'Warehouse Refurb Delay', 'Amber', 'Landlord refurbishment timeline dependent on contractor availability', 'Weekly progress calls with landlord. Contingency storage identified.', 'Open', 'Operations', 'No', 'No'],
  ['R003', 'Import Duties Post-Brexit', 'Green', 'Potential changes to UK import regulations', 'Working with customs broker. Duty calculations built into pricing model.', 'Open', 'Finance', 'No', 'No'],
  ['R004', 'Showroom Contractor Selection', 'Amber', 'Final contractor decision pending - 3 quotes received', 'Expediting final meetings. Budget allows for preferred contractor.', 'Open', 'Project Lead', 'No', 'Yes'],
  ['R005', 'Currency Fluctuation', 'Amber', 'GBP/CNY exchange rate volatility affects stock costs', 'Building 5% currency buffer into pricing. Considering forward contracts.', 'Open', 'Finance', 'No', 'No'],
  ['R006', 'Staff Recruitment', 'Green', 'Need to hire showroom manager and warehouse staff', 'Recruitment to begin Q1 2025. Job specs prepared.', 'Open', 'HR', 'No', 'No'],
];
const risksSheet = XLSX.utils.aoa_to_sheet(risksData);
risksSheet['!cols'] = [
  { wch: 8 }, { wch: 25 }, { wch: 8 }, { wch: 45 }, 
  { wch: 50 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 16 }
];
XLSX.utils.book_append_sheet(workbook, risksSheet, 'Risks_Issues');

// ============================================
// Sheet 8: Settings (for metadata)
// ============================================
const settingsData = [
  ['Setting', 'Value', 'Notes'],
  ['Showroom Location', 'London Showroom', 'Display name'],
  ['Showroom Target Date', '2025-06-01', 'Target completion'],
  ['Showroom Paused', 'Yes', 'Project currently on hold pending strategic review'],
  ['Warehouse Location', 'UK Warehouse', 'Display name'],
  ['Warehouse Target Date', '2026-01-15', 'Target completion'],
  ['Warehouse Paused', 'No', ''],
  ['Gross Margin Target', 45, 'Percentage'],
  ['B2B Split', 60, 'Percentage of revenue'],
  ['B2C Split', 40, 'Percentage of revenue'],
  ['Staff Required', 3, 'Total headcount needed'],
  ['Staff Hired', 1, 'Current headcount'],
  ['Website Status', 'In Development', 'Options: Not Started, In Development, Live, Planned'],
  ['Inventory System Status', 'Planned', 'Options: Not Started, In Development, Live, Planned'],
];
const settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);
settingsSheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 40 }];
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
console.log('   8. Settings - Dashboard configuration');
console.log('');
console.log('📝 To update dashboard data:');
console.log('   1. Open the Excel file');
console.log('   2. Edit the values in each sheet');
console.log('   3. Save the file');
console.log('   4. Refresh the dashboard (or wait for auto-refresh)');

