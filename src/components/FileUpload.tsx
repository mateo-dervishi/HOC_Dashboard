'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FileUpload({ onUpload, isOpen, onClose }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];
    
    const isValidType = validTypes.some(type => 
      file.type === type || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (!isValidType) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        setUploadedFile(files[0]);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        setUploadedFile(files[0]);
      }
    }
  };

  const handleUpload = () => {
    if (uploadedFile) {
      onUpload(uploadedFile);
      onClose();
      setUploadedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111111] border border-[#262626] rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#1A1A1A] text-[#737373] hover:text-[#F8F7F5] transition-colors"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-medium text-[#F8F7F5] mb-2">Upload Dashboard Data</h3>
        <p className="text-sm text-[#737373] mb-6">
          Upload your Excel file to update the dashboard. The file should contain the required data sheets.
        </p>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            file-upload-zone p-8 rounded-xl cursor-pointer text-center
            ${isDragging ? 'dragging' : ''}
            ${uploadedFile ? 'border-[#4A9C6D] bg-[#4A9C6D]/5' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploadedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle size={40} className="text-[#4A9C6D] mb-3" />
              <p className="text-sm text-[#F8F7F5] font-medium">{uploadedFile.name}</p>
              <p className="text-xs text-[#737373] mt-1">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                <FileSpreadsheet size={28} className="text-[#C9A962]" />
              </div>
              <p className="text-sm text-[#F8F7F5] mb-1">
                Drop your Excel file here, or <span className="text-[#C9A962]">browse</span>
              </p>
              <p className="text-xs text-[#525252]">
                Supports .xlsx and .xls files up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-3 text-sm text-[#C94A4A]">{error}</p>
        )}

        {/* Expected Format */}
        <div className="mt-6 p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
          <p className="text-[10px] uppercase tracking-wider text-[#525252] mb-2">Expected Sheets</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              'Capital_Investment',
              'Costs_Tracker',
              'Showroom_Progress',
              'Warehouse_Progress',
              'Suppliers',
              'Financial_Projections',
              'Risks_Issues'
            ].map(sheet => (
              <p key={sheet} className="text-xs text-[#737373]">• {sheet}</p>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[#737373] hover:text-[#F8F7F5] hover:bg-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!uploadedFile}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${uploadedFile 
                ? 'bg-[#C9A962] text-[#0A0A0A] hover:bg-[#D4B572]' 
                : 'bg-[#1A1A1A] text-[#525252] cursor-not-allowed'}
            `}
          >
            Upload & Update
          </button>
        </div>
      </div>
    </div>
  );
}

