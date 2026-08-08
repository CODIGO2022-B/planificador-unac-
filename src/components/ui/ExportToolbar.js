'use client';
import { useSchedule } from '@/context/ScheduleContext';
import { FileDown, Image as ImageIcon, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { PdfDocument } from '../export/PdfDocument';
import { exportToExcel } from '@/lib/exportUtils';
import { useState } from 'react';

export default function ExportToolbar() {
  const { selectedCourses, getColor } = useSchedule();
  const [isExporting, setIsExporting] = useState(false);
  
  if (selectedCourses.length === 0) return null;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const blob = await pdf(<PdfDocument courses={selectedCourses} getCourseColor={getColor} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Horario_UNAC_2026-B.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(selectedCourses);
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="sticky bottom-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2 sm:gap-4">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-600/20 text-sm"
        >
          <FileDown size={18} />
          <span>PDF Nativo</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-emerald-600/20 text-sm"
        >
          <FileSpreadsheet size={18} />
          <span>Excel</span>
        </button>
        
        <button
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-full font-medium transition-colors shadow-lg text-sm"
        >
          <ImageIcon size={18} />
          <span>PNG</span>
        </button>
      </div>
    </motion.div>
  );
}
