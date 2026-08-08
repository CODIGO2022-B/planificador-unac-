'use client';
import { useState } from 'react';
import { X, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

export default function UploadExcelModal({ isOpen, onClose }) {
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        if (workbook.SheetNames.length > 0) {
          alert('¡Horario Excel procesado correctamente!');
          onClose();
        }
      } catch (err) {
        setErrorMsg('Error al procesar el archivo Excel. Asegúrate que sea un formato válido.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative border border-slate-200 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-black font-black flex items-center justify-center shadow-md border-2 border-red-400/60 transition cursor-pointer z-50"
          title="Cerrar"
        >
          <X size={18} strokeWidth={3} className="text-black" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Subir Horario Excel
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Sube tu archivo de programación académica en Excel (.XLS, .XLSX)
          </p>
        </div>

        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-8 text-center hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center gap-2">
          <input 
            type="file" 
            accept=".csv, .xls, .xlsx" 
            onChange={handleFileUpload}
            className="hidden" 
          />
          <FileSpreadsheet className="text-indigo-500 mb-1" size={32} />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Presiona para subir el Excel</p>
          <p className="text-[11px] text-slate-400">
            {fileName ? `Seleccionado: ${fileName}` : 'O arrastra el archivo aquí'}
          </p>
        </label>

        {errorMsg && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
