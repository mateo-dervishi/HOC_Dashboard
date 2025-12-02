'use client';

import { RefreshCw, Upload, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
  onUpload: () => void;
  isRefreshing?: boolean;
}

export function Header({ lastUpdated, onRefresh, onUpload, isRefreshing = false }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1F1F1F]">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-semibold tracking-[0.2em] text-[#F8F7F5] uppercase">
                House of Clarence
              </h1>
              <p className="text-[11px] tracking-[0.15em] text-[#737373] uppercase mt-0.5">
                Investor Dashboard
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            <div className="text-right mr-4">
              <p className="text-[10px] uppercase tracking-wider text-[#525252]">Last Updated</p>
              <p className="text-sm text-[#A3A3A3] font-tabular">{formatDate(lastUpdated)}</p>
            </div>

            {/* Upload Button */}
            <button
              onClick={onUpload}
              className="
                flex items-center gap-2 px-4 py-2
                bg-[#1A1A1A] border border-[#333333] rounded-lg
                text-sm text-[#A3A3A3]
                hover:bg-[#252525] hover:text-[#F8F7F5] hover:border-[#444444]
                transition-all duration-200
              "
            >
              <Upload size={14} />
              <span>Upload Data</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="
                flex items-center gap-2 px-4 py-2
                bg-[#C9A962] rounded-lg
                text-sm text-[#0A0A0A] font-medium
                hover:bg-[#D4B572]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="
                p-2 rounded-lg
                bg-[#1A1A1A] border border-[#333333]
                text-[#A3A3A3]
                hover:bg-[#252525] hover:text-[#F8F7F5]
                transition-all duration-200
              "
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

