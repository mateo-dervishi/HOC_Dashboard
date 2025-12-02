# House of Clarence - Investor Dashboard

A professional, real-time investor dashboard for **House of Clarence (HOC)** — a luxury second-fix materials company importing from China for B2B and B2C sales in the UK.

![Dashboard Preview](docs/preview.png)

## Features

- **Capital & Cash Position** - Track total capital raised, deployment, burn rate, and runway
- **Project Progress** - Monitor showroom and warehouse development milestones
- **Budget vs Actual** - Visualize spending against budget with interactive charts
- **Operational Readiness** - Track supplier confirmations, staffing, and system status
- **Financial Outlook** - View revenue projections and break-even timeline
- **Risks & Issues** - RAG-status risk register with filtering and expansion

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Excel Parsing:** SheetJS (xlsx)
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mateo-dervishi/HOC_Dashboard.git
cd HOC_Dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Data Management

### Excel File Location

The dashboard automatically reads from:
```
public/data/HOC_Investor_Dashboard_Template.xlsx
```

When you edit and save this file, simply refresh the dashboard (or wait for auto-refresh every 5 minutes).

### Excel File Format

The Excel file contains 8 sheets:

| Sheet Name | Description |
|------------|-------------|
| `Capital_Investment` | Total raised, deployed, burn rate, runway |
| `Costs_Tracker` | Budget vs actual by category |
| `Showroom_Progress` | Showroom milestones and status |
| `Warehouse_Progress` | Warehouse milestones and status |
| `Suppliers` | Supplier list and confirmation status |
| `Financial_Projections` | Monthly revenue targets |
| `Risks_Issues` | Risk register with RAG status |
| `Settings` | Dashboard configuration (locations, dates, targets) |

### How to Update Data

**Option 1: Edit the Excel file directly (Recommended)**
1. Open `public/data/HOC_Investor_Dashboard_Template.xlsx`
2. Edit the values in any sheet
3. Save the file
4. Refresh the dashboard or wait for auto-refresh (every 5 min)

**Option 2: Upload via UI**
1. Click "Upload Data" in the header
2. Drag and drop your Excel file
3. Data will be loaded immediately

### Regenerate Template

To create a fresh Excel template with sample data:
```bash
npm run generate-template
```

### Data Source Indicator

The dashboard shows the current data source:
- 🟢 **Green** - Live data from Excel file on server
- 🔵 **Blue** - Data from manually uploaded file
- 🟡 **Yellow** - Using demo data (no Excel file found)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build for Production

```bash
npm run build
npm start
```

## Design Principles

1. **Institutional Grade** - Bloomberg Terminal meets luxury brand aesthetic
2. **Confidence over Caution** - Bold numbers, clear status indicators
3. **At-a-Glance Clarity** - Investor understands status in 5 seconds
4. **Transparency** - Show real numbers, even uncomfortable ones

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0A0A0A` | Primary background |
| Surface | `#111111` | Panel backgrounds |
| Gold | `#C9A962` | Accent, highlights |
| Off-white | `#F8F7F5` | Primary text |
| Red (RAG) | `#C94A4A` | Critical status |
| Amber (RAG) | `#D4A84B` | Warning status |
| Green (RAG) | `#4A9C6D` | Good status |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with fonts
│   ├── page.tsx        # Main dashboard page
│   └── globals.css     # Global styles
├── components/
│   ├── Header.tsx
│   ├── CapitalPanel.tsx
│   ├── ProjectProgress.tsx
│   ├── BudgetActual.tsx
│   ├── OperationalReadiness.tsx
│   ├── FinancialOutlook.tsx
│   ├── RisksPanel.tsx
│   ├── FileUpload.tsx
│   ├── MetricCard.tsx
│   ├── ProgressRing.tsx
│   ├── RAGBadge.tsx
│   └── index.ts
└── lib/
    ├── parseExcel.ts   # Excel parsing logic
    └── types.ts        # TypeScript interfaces
```

## License

Confidential - House of Clarence Ltd.

---

Built with precision for high-net-worth investors.
