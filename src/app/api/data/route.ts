import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { parseExcelFile, getDefaultDashboardData } from '@/lib/parseExcel';

export async function GET() {
  try {
    // Path to the Excel file in the public/data directory
    const filePath = path.join(process.cwd(), 'public', 'data', 'HOC_Investor_Dashboard_Template.xlsx');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('Excel file not found, returning default data');
      return NextResponse.json({
        success: true,
        data: getDefaultDashboardData(),
        source: 'default',
        message: 'Using default data. Place your Excel file at public/data/HOC_Investor_Dashboard_Template.xlsx'
      });
    }
    
    // Read the Excel file
    const fileBuffer = fs.readFileSync(filePath);
    const data = parseExcelFile(fileBuffer.buffer as ArrayBuffer);
    
    return NextResponse.json({
      success: true,
      data,
      source: 'excel',
      lastModified: fs.statSync(filePath).mtime
    });
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
    
    // Return default data on error
    return NextResponse.json({
      success: true,
      data: getDefaultDashboardData(),
      source: 'default',
      error: 'Error reading Excel file, using default data'
    });
  }
}

