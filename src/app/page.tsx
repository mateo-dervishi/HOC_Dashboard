'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Header,
  CapitalPanel,
  ProjectProgress,
  BudgetActual,
  OperationalReadiness,
  FinancialOutlook,
  RisksPanel,
  FileUpload,
} from '@/components';
import { DashboardData } from '@/lib/types';
import { parseExcelFile, getDefaultDashboardData } from '@/lib/parseExcel';

// Auto-refresh interval in milliseconds (5 minutes)
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'upload' | 'default'>('default');

  // Reconstruct dates from JSON
  const reconstructDates = (parsed: DashboardData): DashboardData => {
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated),
      showroom: {
        ...parsed.showroom,
        targetDate: new Date(parsed.showroom.targetDate),
        milestones: parsed.showroom.milestones.map((m) => ({
          ...m,
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
          actualDate: m.actualDate ? new Date(m.actualDate) : null,
        })),
      },
      warehouse: {
        ...parsed.warehouse,
        targetDate: new Date(parsed.warehouse.targetDate),
        milestones: parsed.warehouse.milestones.map((m) => ({
          ...m,
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
          actualDate: m.actualDate ? new Date(m.actualDate) : null,
        })),
      },
    };
  };

  // Fetch data from API
  const fetchData = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/data');
      const result = await response.json();

      if (result.success && result.data) {
        const reconstructedData = reconstructDates(result.data);
        setData(reconstructedData);
        setDataSource(result.source === 'excel' ? 'api' : 'default');
        
        // Also save to localStorage as backup
        localStorage.setItem('hoc_dashboard_data', JSON.stringify(reconstructedData));
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
      
      // Fall back to localStorage or default data
      const stored = localStorage.getItem('hoc_dashboard_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setData(reconstructDates(parsed));
          setDataSource('default');
        } catch {
          setData(getDefaultDashboardData());
          setDataSource('default');
        }
      } else {
        setData(getDefaultDashboardData());
        setDataSource('default');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false); // Don't show loading state for auto-refresh
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle manual file upload (overrides API data)
  const handleUpload = async (file: File) => {
    setIsRefreshing(true);

    try {
      const buffer = await file.arrayBuffer();
      const parsedData = parseExcelFile(buffer);

      // Save to localStorage
      localStorage.setItem('hoc_dashboard_data', JSON.stringify(parsedData));

      setData(parsedData);
      setDataSource('upload');
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Error parsing Excel file. Please ensure it has the correct format.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#737373] uppercase tracking-wider">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header
        lastUpdated={data.lastUpdated}
        onRefresh={handleRefresh}
        onUpload={() => setShowUpload(true)}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Data Source Indicator */}
        <div className="mb-4 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              dataSource === 'api'
                ? 'bg-[#4A9C6D]'
                : dataSource === 'upload'
                ? 'bg-[#5B8DEF]'
                : 'bg-[#D4A84B]'
            }`}
          />
          <span className="text-xs text-[#525252]">
            {dataSource === 'api'
              ? 'Live data from Excel file'
              : dataSource === 'upload'
              ? 'Data from uploaded file'
              : 'Using demo data — place Excel file in public/data/'}
          </span>
          <span className="text-xs text-[#3d3d3d]">• Auto-refresh every 5 min</span>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-5">
          {/* Row 1: Capital (4 cols) + Project Progress (8 cols) */}
          <div className="col-span-12 lg:col-span-4">
            <CapitalPanel data={data.capital} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ProjectProgress showroom={data.showroom} warehouse={data.warehouse} />
          </div>

          {/* Row 2: Budget (8 cols) + Operational (4 cols) */}
          <div className="col-span-12 lg:col-span-8">
            <BudgetActual data={data.budget} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <OperationalReadiness data={data.operational} />
          </div>

          {/* Row 3: Financial (6 cols) + Risks (6 cols) */}
          <div className="col-span-12 lg:col-span-6">
            <FinancialOutlook data={data.financial} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <RisksPanel data={data.risks} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[#1F1F1F]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#525252]">
              House of Clarence Investor Dashboard • Confidential
            </p>
            <p className="text-xs text-[#525252]">
              Data: public/data/HOC_Investor_Dashboard_Template.xlsx
            </p>
          </div>
        </footer>
      </main>

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
