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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Load data from localStorage or use defaults
  const loadData = useCallback(() => {
    const stored = localStorage.getItem('hoc_dashboard_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Reconstruct dates
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        parsed.showroom.targetDate = new Date(parsed.showroom.targetDate);
        parsed.warehouse.targetDate = new Date(parsed.warehouse.targetDate);
        parsed.showroom.milestones = parsed.showroom.milestones.map((m: Record<string, unknown>) => ({
          ...m,
          targetDate: m.targetDate ? new Date(m.targetDate as string) : null,
          actualDate: m.actualDate ? new Date(m.actualDate as string) : null,
        }));
        parsed.warehouse.milestones = parsed.warehouse.milestones.map((m: Record<string, unknown>) => ({
          ...m,
          targetDate: m.targetDate ? new Date(m.targetDate as string) : null,
          actualDate: m.actualDate ? new Date(m.actualDate as string) : null,
        }));
        setData(parsed);
      } catch {
        setData(getDefaultDashboardData());
      }
    } else {
      setData(getDefaultDashboardData());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle file upload
  const handleUpload = async (file: File) => {
    setIsRefreshing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const parsedData = parseExcelFile(buffer);
      
      // Save to localStorage
      localStorage.setItem('hoc_dashboard_data', JSON.stringify(parsedData));
      
      setData(parsedData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Error parsing Excel file. Please ensure it has the correct format.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh - in production this would re-fetch from server
    setTimeout(() => {
      if (data) {
        setData({
          ...data,
          lastUpdated: new Date(),
        });
      }
      setIsRefreshing(false);
    }, 500);
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
              Data sourced from HOC_Investor_Dashboard_Template.xlsx
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
