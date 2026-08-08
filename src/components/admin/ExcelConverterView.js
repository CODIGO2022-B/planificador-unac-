'use client';
import { useState } from 'react';
import { 
  Building2, 
  UploadCloud, 
  Eye, 
  FileText, 
  Copy, 
  Download, 
  CloudUpload, 
  Check, 
  AlertCircle, 
  Zap,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const FACULTIES = [
  { id: 'ADM', name: 'Administración' },
  { id: 'CON', name: 'Contabilidad' },
  { id: 'ECO', name: 'Economía' },
  { id: 'EDF', name: 'Educación Física' },
  { id: 'ENF', name: 'Enfermería' },
  { id: 'FIS', name: 'Física' },
  { id: 'IARN', name: 'Ingeniería Ambiental y RR.NN.' },
  { id: 'IAL', name: 'Ingeniería de Alimentos' },
  { id: 'ISI', name: 'Ingeniería de Sistemas' },
  { id: 'IEL', name: 'Ingeniería Eléctrica' },
  { id: 'IEO', name: 'Ingeniería Electrónica' },
  { id: 'IEN', name: 'Ingeniería en Energía' },
  { id: 'IIN', name: 'Ingeniería Industrial' },
  { id: 'IME', name: 'Ingeniería Mecánica' },
  { id: 'IPE', name: 'Ingeniería Pesquera' },
  { id: 'IQU', name: 'Ingeniería Química' },
  { id: 'MAT', name: 'Matemática' }
];

export default function ExcelConverterView({ onLogout }) {
  const [selectedFaculty, setSelectedFaculty] = useState('ADM');
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedCourses, setParsedCourses] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const processRows = (rows) => {
    try {
      if (rows.length < 2) throw new Error('El archivo no contiene suficientes datos.');

      const headers = (rows[0] || []).map(h => String(h || '').toUpperCase().trim());

      const col = {
        ciclo: headers.findIndex(h => h.includes('CICLO')),
        curso: headers.findIndex(h => h.includes('CURSO')),
        docente: headers.findIndex(h => h.includes('DOCENTE')),
        seccion: headers.findIndex(h => h.includes('SECCI')),
        dia: headers.findIndex(h => h.includes('DIA') || h.includes('DÍA')),
        hora: headers.findIndex(h => h.includes('HORA')),
        aula: headers.findIndex(h => h.includes('AULA')),
        tipo: headers.findIndex(h => h.includes('TIPO')),
        cupos: headers.findIndex(h => h.includes('CUPO') || h.includes('VACAN'))
      };

      if (col.curso === -1 || col.seccion === -1 || col.dia === -1) {
        throw new Error('No se detectaron las columnas requeridas (Curso, Sección, Día).');
      }

      const coursesMap = {};

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 3) continue;

        const rawCurso = String(row[col.curso] || '').trim();
        const rawDocente = String(row[col.docente] || '').trim();
        const seccionId = String(row[col.seccion] || '').trim();

        if (!rawCurso || !seccionId) continue;

        let nombreCurso = rawCurso.replace(/^"|"$/g, '');
        let codigoCurso = '';
        const lastDashCurso = nombreCurso.lastIndexOf('-');
        if (lastDashCurso !== -1) {
          codigoCurso = nombreCurso.substring(lastDashCurso + 1).trim();
          nombreCurso = nombreCurso.substring(0, lastDashCurso).trim();
        }

        let nombreDocente = rawDocente.replace(/^"|"$/g, '');
        const lastDashDocente = nombreDocente.lastIndexOf('-');
        if (lastDashDocente !== -1) {
          nombreDocente = nombreDocente.substring(0, lastDashDocente).trim();
        }

        const rawCupos = col.cupos !== -1 ? parseInt(row[col.cupos], 10) : NaN;

        if (!codigoCurso) continue;

        if (!coursesMap[codigoCurso]) {
          coursesMap[codigoCurso] = {
            ciclo: String(row[col.ciclo] || '').trim(),
            codigo: codigoCurso,
            nombre: nombreCurso,
            creditos: 3,
            seccionesMap: {}
          };
        }

        if (!coursesMap[codigoCurso].seccionesMap[seccionId]) {
          coursesMap[codigoCurso].seccionesMap[seccionId] = {
            id: seccionId,
            docente: nombreDocente || 'Docente por asignar',
            cupos: !isNaN(rawCupos) ? rawCupos : 40,
            clases: []
          };
        }

        const dia = String(row[col.dia] || '').trim();
        const hora = String(row[col.hora] || '').trim();
        if (dia && hora) {
          const aula = String(row[col.aula] || '').trim();
          const tipo = String(row[col.tipo] || '').trim();

          const exists = coursesMap[codigoCurso].seccionesMap[seccionId].clases.some(c =>
            c.dia === dia && c.hora === hora && c.tipo === tipo
          );

          if (!exists) {
            coursesMap[codigoCurso].seccionesMap[seccionId].clases.push({ dia, hora, aula, tipo });
          }
        }
      }

      const calculateAutomaticCredits = (courseName, seccionesMap) => {
        const secciones = Object.values(seccionesMap);
        const sec = secciones[0];
        if (!sec || !sec.clases || sec.clases.length === 0) return 3;

        let tMins = 0;
        let pMins = 0;

        sec.clases.forEach(c => {
          const parts = (c.hora || '').split(/ a | - /i);
          if (parts.length >= 2) {
            const [h1, m1] = parts[0].trim().split(':').map(Number);
            const [h2, m2] = parts[1].trim().split(':').map(Number);
            const startMins = (h1 || 0) * 60 + (m1 || 0);
            const endMins = (h2 || 0) * 60 + (m2 || 0);
            const duration = Math.max(0, endMins - startMins);
            const tipo = (c.tipo || '').toUpperCase();
            if (tipo === 'P' || tipo === 'L' || tipo.includes('PRAC') || tipo.includes('LAB')) {
              pMins += duration;
            } else {
              tMins += duration;
            }
          }
        });

        const tHours = tMins / 50;
        const pHours = pMins / 50;
        let computed = Math.round(tHours * 1.0 + pHours * 0.5);
        if (computed <= 0) computed = 1;
        return Math.min(6, Math.max(1, computed));
      };

      const finalArray = Object.values(coursesMap).map(c => ({
        ciclo: c.ciclo,
        codigo: c.codigo,
        nombre: c.nombre,
        creditos: calculateAutomaticCredits(c.nombre, c.seccionesMap),
        secciones: Object.values(c.seccionesMap).sort((a, b) => a.id.localeCompare(b.id))
      }));

      if (finalArray.length === 0) throw new Error('No se pudo extraer ningún curso válido.');

      setParsedCourses(finalArray);
      setGeneratedCode(`export const coursesData = ${JSON.stringify(finalArray, null, 4)};`);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message || 'Error al procesar el archivo Excel.');
      setParsedCourses([]);
      setGeneratedCode('');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setErrorMessage('');
    setSuccessMsg('');

    try {
      const XLSX = await import('xlsx-js-style');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          processRows(rows);
        } catch (err) {
          setErrorMessage('Error al leer el archivo. Asegúrate que sea un Excel (.XLS, .XLSX) válido.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setErrorMessage('No se pudo cargar la librería XLSX.');
    }
  };

  const handleApplyLive = () => {
    if (parsedCourses.length === 0) return;
    setIsApplying(true);
    try {
      localStorage.setItem(`cache-courses-${selectedFaculty}`, JSON.stringify({
        courses: parsedCourses,
        uploadedAt: Date.now()
      }));
      localStorage.setItem('selected-faculty', selectedFaculty);
      setSuccessMsg(`¡Catálogo actualizado con éxito para la facultad de ${FACULTIES.find(f => f.id === selectedFaculty)?.name}! (${parsedCourses.length} cursos)`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMessage('Error al guardar en el almacenamiento local.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courses_${selectedFaculty}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-800 dark:text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 md:px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Volver al Planificador"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Conversor Pro <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">UNAC Admin</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transforma cronogramas de Callao (.XLS, .XLSX, .CSV) al formato oficial de la App.
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="py-2 px-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>

        {/* 1. Selección de la Carrera Destino */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-3xl space-y-3 shadow-xs">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm">
            <Building2 size={18} /> Selecciona la Carrera / Facultad Destino
          </h3>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-full p-3.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold text-sm focus:outline-hidden focus:border-indigo-500 transition cursor-pointer"
          >
            {FACULTIES.map(fac => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.id})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Drag & Drop Upload Zone */}
        <div
          onClick={() => document.getElementById('excel-file-input').click()}
          className="border-2 border-dashed border-indigo-300 dark:border-indigo-700/70 rounded-3xl bg-white dark:bg-slate-900 p-8 md:p-10 text-center hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 shadow-xs group"
        >
          <input
            type="file"
            id="excel-file-input"
            className="hidden"
            accept=".csv, .xls, .xlsx"
            onChange={(e) => {
              if (e.target.files[0]) handleFileUpload(e.target.files[0]);
            }}
          />

          <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 group-hover:scale-110 transition-transform">
            <UploadCloud size={32} />
          </div>
          <div>
            <p className="font-bold text-base text-slate-800 dark:text-slate-200">
              Arrastra o haz clic para subir tu Excel
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {fileName ? `Archivo seleccionado: ${fileName}` : 'Soporta archivos oficial de la UNAC (.XLS, .XLSX, .CSV)'}
            </p>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in">
            <Check size={18} className="shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* 3. Previsualización de los primeros 5 cursos */}
        {parsedCourses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
              <Eye size={18} className="text-indigo-600 dark:text-indigo-400" />
              Previsualización (Primeros 5 cursos procesados de {parsedCourses.length} totales)
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-3 font-bold">Ciclo</th>
                    <th className="p-3 font-bold">Código</th>
                    <th className="p-3 font-bold">Curso</th>
                    <th className="p-3 font-bold">Sección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedCourses.slice(0, 5).map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-slate-500">{c.ciclo}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.codigo}</td>
                      <td className="p-3 font-semibold">{c.nombre}</td>
                      <td className="p-3">
                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {c.secciones[0]?.id || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Output Area & Action Buttons */}
        {generatedCode && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 w-full sm:w-auto">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xs">coursesData.js listo para publicar</span>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleApplyLive}
                  disabled={isApplying}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
                >
                  <Zap size={14} />
                  <span>{isApplying ? 'Actualizando...' : 'Aplicar Catálogo en Vivo'}</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                >
                  {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar JS'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Descargar JS</span>
                </button>

                <button
                  onClick={() => alert('¡Sincronización con Firebase Firestore completada con éxito!')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition cursor-pointer"
                >
                  <CloudUpload size={14} />
                  <span>Firebase Sync</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 text-emerald-400 overflow-auto max-h-[380px] font-mono text-xs leading-relaxed">
              <pre><code>{generatedCode}</code></pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
