'use client';
import { useState, useMemo } from 'react';
import { X, Check, Sparkles, Image as ImageIcon, FileText, Code, FileSpreadsheet, Eye, User } from 'lucide-react';
import { useSchedule } from '@/context/ScheduleContext';
import { exportToExcel } from '@/lib/exportUtils';
import { pdf } from '@react-pdf/renderer';
import { PdfDocument } from './PdfDocument';
import { renderDesignHTML } from '@/lib/designHTMLUtils';

const DESIGNS = [
  {
    id: 'native',
    badge: '⭐ PANTALLA',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    title: 'Mi Horario Actual (Pantalla)',
    desc: 'Exporta el horario exactamente como se visualiza en pantalla, con tu paleta de colores activa y badges interactivos.',
    previewBg: 'bg-slate-50 dark:bg-slate-900',
    tag: 'HD Nativo',
  },
  {
    id: 'palette-suaves',
    badge: '🍃 PALETA',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    title: 'Tonos Suaves (Clásico)',
    desc: 'Paleta clásica de tonos suaves verde, azul, amarillo y rosa de contraste armónico.',
    previewBg: 'bg-emerald-50/50 dark:bg-slate-900',
    tag: 'Tonos Suaves',
  },
  {
    id: 'palette-vibrante',
    badge: '🔥 VIBRANTE',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    title: 'Color Vibrante',
    desc: 'Paleta de colores vivos y de alto contraste para máxima visibilidad de asignaturas.',
    previewBg: 'bg-orange-50/50 dark:bg-slate-900',
    tag: 'Vibrante',
  },
  {
    id: 'palette-pastel',
    badge: '🌸 PASTEL',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
    title: 'Tonos Pastel',
    desc: 'Paleta de colores delicados en tonos pastel elegantes y relajantes visualmente.',
    previewBg: 'bg-pink-50/50 dark:bg-slate-900',
    tag: 'Pastel',
  },
  {
    id: 'formal',
    badge: '🏛️ FORMAL',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    title: 'Institucional UNAC',
    desc: 'Azul marino institucional, membrete académico oficial, bordes limpios y membrete de la Universidad del Callao.',
    previewBg: 'bg-blue-50/50 dark:bg-slate-900',
    tag: 'Oficial UNAC',
  },
  {
    id: 'creative',
    badge: '🎨 CREATIVO',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    title: 'Dinámico & Pastel',
    desc: 'Bloques con colores pastel vivos, bordes muy redondeados, insignias de tipo cápsula y diseño divertido.',
    previewBg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800',
    tag: 'Dinámico',
  },
  {
    id: 'simple',
    badge: '📐 SIMPLE',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    title: 'Minimalista Ultra-Clean',
    desc: 'Diseño escandinavo monocromático ultra limpio, espaciado perfecto y ahorro máximo de tinta al imprimir.',
    previewBg: 'bg-white dark:bg-slate-900',
    tag: 'Minimalista',
  },
  {
    id: 'modern',
    badge: '🌙 MODERNO',
    badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    title: 'Dark Mode Tech UI',
    desc: 'Estilo oscuro Slate futurista, contenedores semi-transparentes tipo glassmorphism y detalles neón.',
    previewBg: 'bg-slate-950',
    tag: 'Dark Mode',
  },
  {
    id: 'executive',
    badge: '👑 EXECUTIVE',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    title: 'Dashboard Académico',
    desc: 'Ficha ejecutiva de lujo con widgets KPI superiores, filigrana de la UNAC y código QR de validación.',
    previewBg: 'bg-slate-100 dark:bg-slate-900',
    tag: 'Executive',
  }
];

function MiniPreview({ designId }) {
  switch (designId) {
    case 'native':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <div className="border-b border-indigo-200 dark:border-indigo-800 pb-1 flex justify-between items-center font-bold">
            <span>UNAC · HORARIO 2026-B</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-[7px]">ESTILO PANTALLA</span>
          </div>
          <div className="space-y-1 my-1">
            <div className="bg-emerald-200 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-l-2 border-emerald-600 p-1 rounded font-bold flex justify-between">
              <span>ORATORIA</span>
              <span>📍 FCA2A02 • Sec 01A</span>
            </div>
            <div className="bg-amber-200 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-l-2 border-amber-600 p-1 rounded font-bold flex justify-between">
              <span>ÉTICA Y CIUDADANÍA</span>
              <span>⏰ 08:00 a 09:40</span>
            </div>
          </div>
          <div className="text-[7px] text-slate-400 text-center">Formato HD Idéntico a Pantalla</div>
        </div>
      );

    case 'palette-suaves':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-emerald-50/50 dark:bg-slate-900">
          <div className="font-bold text-emerald-950 dark:text-emerald-300">🍃 PALETA TONOS SUAVES</div>
          <div className="space-y-1">
            <div className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 p-1 rounded font-bold">Verde Suave</div>
            <div className="bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 p-1 rounded font-bold">Azul Suave</div>
            <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 p-1 rounded font-bold">Amarillo Suave</div>
          </div>
          <div className="text-[7px] text-slate-400 text-center">Colores Suaves Clásicos</div>
        </div>
      );

    case 'palette-vibrante':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-orange-50/50 dark:bg-slate-900">
          <div className="font-bold text-orange-950 dark:text-orange-300">🔥 PALETA VIBRANTE</div>
          <div className="space-y-1">
            <div className="bg-lime-300 dark:bg-lime-800 text-lime-950 dark:text-lime-100 p-1 rounded font-bold">Lima Vívido</div>
            <div className="bg-cyan-300 dark:bg-cyan-800 text-cyan-950 dark:text-cyan-100 p-1 rounded font-bold">Cian Vívido</div>
            <div className="bg-yellow-300 dark:bg-yellow-800 text-yellow-950 dark:text-yellow-100 p-1 rounded font-bold">Amarillo Vívido</div>
          </div>
          <div className="text-[7px] text-slate-400 text-center">Alto Contraste</div>
        </div>
      );

    case 'palette-pastel':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-pink-50/50 dark:bg-slate-900">
          <div className="font-bold text-pink-950 dark:text-pink-300">🌸 PALETA TONOS PASTEL</div>
          <div className="space-y-1">
            <div className="bg-pink-100 dark:bg-pink-900/60 text-pink-900 dark:text-pink-200 p-1 rounded font-bold">Rosa Pastel</div>
            <div className="bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 p-1 rounded font-bold">Púrpura Pastel</div>
            <div className="bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 p-1 rounded font-bold">Cielo Pastel</div>
          </div>
          <div className="text-[7px] text-slate-400 text-center">Tonos Relajantes</div>
        </div>
      );

    case 'formal':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-slate-50 dark:bg-slate-900">
          <div className="border-b border-blue-950 dark:border-blue-700 pb-1 flex justify-between items-center">
            <div className="font-bold text-blue-950 dark:text-blue-300">🏛️ UNAC · FACULTAD ADM</div>
            <div className="text-[7px] text-slate-500">2026-B</div>
          </div>
          <div className="grid grid-cols-6 gap-0.5 my-1 text-center font-mono">
            <div className="bg-blue-900 text-white rounded-[2px] p-0.5 text-[6px]">LUN</div>
            <div className="bg-blue-900 text-white rounded-[2px] p-0.5 text-[6px]">MAR</div>
            <div className="bg-blue-900 text-white rounded-[2px] p-0.5 text-[6px]">MIÉ</div>
            <div className="bg-blue-900 text-white rounded-[2px] p-0.5 text-[6px]">JUE</div>
            <div className="bg-blue-900 text-white rounded-[2px] p-0.5 text-[6px]">VIE</div>
            <div className="bg-blue-900 text-white rounded-[2px] p-0.5 text-[6px]">SÁB</div>
          </div>
          <div className="space-y-1 flex-1">
            <div className="bg-blue-50 dark:bg-slate-800 border-l-2 border-blue-900 dark:border-blue-400 p-1 text-blue-950 dark:text-blue-200 font-semibold rounded-[2px]">Admin I · Aula 204</div>
          </div>
          <div className="text-[7px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-0.5 text-center">Formato Oficial UNAC</div>
        </div>
      );

    case 'creative':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
          <div className="flex justify-between items-center font-bold text-purple-900 dark:text-purple-300">
            <span>✨ Horario 2026-B</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-[7px]">UNAC</span>
          </div>
          <div className="space-y-1 my-1">
            <div className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 p-1.5 rounded-xl font-semibold flex justify-between">
              <span>Finanzas II</span>
              <span className="bg-indigo-200 dark:bg-indigo-800 px-1 rounded-full text-[7px]">08:00 - 10:00</span>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 p-1.5 rounded-xl font-semibold flex justify-between">
              <span>Estadística</span>
              <span className="bg-emerald-200 dark:bg-emerald-800 px-1 rounded-full text-[7px]">10:00 - 12:00</span>
            </div>
          </div>
          <div className="flex gap-1 text-[7px]">
            <div className="flex-1 bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 p-1 rounded-lg text-center font-bold">22 Créditos</div>
            <div className="flex-1 bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200 p-1 rounded-lg text-center font-bold">6 Cursos</div>
          </div>
        </div>
      );

    case 'simple':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] font-sans bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-1 flex justify-between">
            <span className="font-bold tracking-widest uppercase">HORARIO DE CLASES</span>
            <span className="text-slate-400">UNAC 2026</span>
          </div>
          <div className="space-y-1 my-1">
            <div className="border border-slate-300 dark:border-slate-700 p-1 rounded font-medium flex justify-between">
              <span>MKT DIGITAL</span>
              <span className="text-slate-400">AULA 102</span>
            </div>
            <div className="border border-slate-300 dark:border-slate-700 p-1 rounded font-medium flex justify-between">
              <span>CONTABILIDAD</span>
              <span className="text-slate-400">AULA 304</span>
            </div>
          </div>
          <div className="text-[7px] text-slate-400 text-right">Impresión Monocromática</div>
        </div>
      );

    case 'modern':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-slate-950 text-slate-200">
          <div className="flex justify-between items-center text-cyan-400 font-mono font-bold">
            <span>⚡ SCHEDULE_2026.SYS</span>
            <span className="text-violet-400">UNAC</span>
          </div>
          <div className="space-y-1 my-1">
            <div className="bg-slate-900 border border-cyan-500/50 p-1 rounded font-mono text-cyan-300 flex justify-between">
              <span>ALGORITMOS</span>
              <span className="text-cyan-400">08:00</span>
            </div>
            <div className="bg-slate-900 border border-violet-500/50 p-1 rounded font-mono text-violet-300 flex justify-between">
              <span>SISTEMAS</span>
              <span className="text-violet-400">10:00</span>
            </div>
          </div>
          <div className="flex gap-1 text-[7px]">
            <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-mono">NEON READY</span>
          </div>
        </div>
      );

    case 'executive':
      return (
        <div className="w-full h-full p-2 flex flex-col justify-between text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-white dark:bg-slate-800 p-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-700 text-center font-bold text-[7px]">22 Créditos</div>
            <div className="bg-white dark:bg-slate-800 p-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-700 text-center font-bold text-[7px]">18 Horas</div>
            <div className="bg-white dark:bg-slate-800 p-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-700 text-center font-bold text-[7px]">6 Cursos</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-1 rounded border border-slate-200 dark:border-slate-700 my-1 space-y-0.5">
            <div className="flex justify-between font-bold text-indigo-950 dark:text-indigo-300">
              <span>LIDERAZGO Y GESTIÓN</span>
              <span className="text-amber-600 text-[6.5px]">QR VERIFIED</span>
            </div>
            <div className="text-[6.5px] text-slate-500 dark:text-slate-400">Prof. Dr. Misael Erik · Aula A-301</div>
          </div>
          <div className="flex justify-between items-center text-[6.5px] text-slate-500 border-t border-slate-300 dark:border-slate-800 pt-0.5">
            <span>DOCUMENTO OFICIAL DIGITAL</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">#2026-UNAC</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function DesignPickerModal({ isOpen, onClose }) {
  const { selectedCourses, getColor } = useSchedule();
  const [selectedDesign, setSelectedDesign] = useState('native');
  const [studentName, setStudentName] = useState('');
  const [isDefaultDesign, setIsDefaultDesign] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Live preview HTML calculation matching Vanilla 100%
  const livePreviewHTML = useMemo(() => {
    if (!selectedCourses || selectedCourses.length === 0) return '';
    return renderDesignHTML(selectedDesign, selectedCourses, {
      facultyName: 'ADMINISTRACIÓN',
      studentName: studentName || 'Estudiante',
      logoSrc: '/img/Universidad-nacional-del-callao.png'
    });
  }, [selectedDesign, selectedCourses, studentName]);

  if (!isOpen) return null;

  const currentDesignObj = DESIGNS.find(d => d.id === selectedDesign) || DESIGNS[0];

  // 1. Descarga PDF Vectorial
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const blob = await pdf(<PdfDocument courses={selectedCourses} getCourseColor={getColor} studentName={studentName} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Horario_UNAC_2026-B_${selectedDesign}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar el PDF:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  // 2. Descarga PNG usando modern-screenshot (Sin scrollbars ni cortes verticales)
  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      const { domToPng } = await import('modern-screenshot');
      const container = document.getElementById('design-live-preview-container');
      if (!container) return;

      // Guardar estilos originales
      const originalMaxHeight = container.style.maxHeight;
      const originalOverflow = container.style.overflow;
      const originalOverflowY = container.style.overflowY;
      const originalOverflowX = container.style.overflowX;

      // Expandir temporalmente a la altura completa sin scrollbars
      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';
      container.style.overflowY = 'visible';
      container.style.overflowX = 'visible';

      const dataUrl = await domToPng(container, {
        scale: 2.5,
        backgroundColor: '#ffffff'
      });

      // Restaurar estilos
      container.style.maxHeight = originalMaxHeight;
      container.style.overflow = originalOverflow;
      container.style.overflowY = originalOverflowY;
      container.style.overflowX = originalOverflowX;

      const link = document.createElement('a');
      link.download = `Horario_UNAC_2026-B_${selectedDesign}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen PNG:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  // 3. Descarga SVG Vectorial
  const handleExportSVG = () => {
    try {
      const container = document.getElementById('design-live-preview-container');
      if (!container) return;

      const originalMaxHeight = container.style.maxHeight;
      const originalOverflow = container.style.overflow;

      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';

      const rawHTML = container.innerHTML;

      container.style.maxHeight = originalMaxHeight;
      container.style.overflow = originalOverflow;

      const xmlSafeContent = rawHTML
        .replace(/&nbsp;/gi, '&#160;')
        .replace(/<img([^>]*?)>/gi, (m, g) => (g.trim().endsWith('/') ? m : `<img${g} />`))
        .replace(/<br([^>]*?)>/gi, (m, g) => (g.trim().endsWith('/') ? m : `<br${g} />`))
        .replace(/<hr([^>]*?)>/gi, (m, g) => (g.trim().endsWith('/') ? m : `<hr${g} />`));

      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
      ${xmlSafeContent}
    </div>
  </foreignObject>
</svg>`;

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Horario_UNAC_2026-B_${selectedDesign}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar archivo SVG:', err);
    } finally {
      onClose();
    }
  };

  // 4. Descarga Excel
  const handleExportExcel = () => {
    exportToExcel(selectedCourses);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[250] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado del Modal */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Elige el Diseño de tu Horario
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                  9 Estilos UNAC
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona tu plantilla favorita y descárgala en formato PNG, PDF, SVG o Excel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Campo Opcional para Añadir Nombre */}
            <div className="relative flex items-center">
              <User size={14} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tu Nombre (Opcional)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido del Modal (Grid de 9 Plantillas + Vista Previa Real) */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[72vh]">
          
          {/* 1. Modelos de Plantilla */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <Sparkles size={14} />
              Elige un Modelo de Plantilla (9 Diseños Disponibles)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DESIGNS.map(design => {
                const isSelected = selectedDesign === design.id;
                return (
                  <div
                    key={design.id}
                    onClick={() => setSelectedDesign(design.id)}
                    className={`group relative bg-white dark:bg-slate-800 border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-lg ${
                      isSelected 
                        ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-xl font-bold text-[11px] ${design.badgeClass}`}>
                            {design.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            <Check size={14} />
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {design.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {design.desc}
                      </p>

                      {/* Unique Mini Preview Container for each Design */}
                      <div className={`w-full h-44 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner`}>
                        <MiniPreview designId={design.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Sección Vista Previa Real en Vivo */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Eye size={16} />
                Vista Previa Real del Horario Generado
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-xs">
                Diseño Seleccionado: {currentDesignObj.title}
              </span>
            </div>

            {/* Live Interactive Preview Box */}
            <div 
              id="design-live-preview-container"
              className="w-full max-h-[420px] overflow-y-auto overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-inner"
            >
              {selectedCourses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  Aún no has seleccionado cursos en el catálogo. Agrega cursos para ver la vista previa en vivo.
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: livePreviewHTML }} />
              )}
            </div>
          </div>

        </div>

        {/* Sticky Footer Bar with 4 Export Buttons */}
        <div className="p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 z-40 shadow-2xl">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isDefaultDesign}
              onChange={(e) => setIsDefaultDesign(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer" 
            />
            <span>Establecer como mi <strong>diseño por defecto</strong></span>
          </label>

          {/* Botones de Descarga Adaptativos en los 4 Formatos Elegidos */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button 
              onClick={handleExportPNG}
              disabled={isExporting}
              className="py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
            >
              <ImageIcon size={16} /> {isExporting ? 'Generando PNG...' : 'Descargar PNG'}
            </button>

            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="py-2.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
            >
              <FileText size={16} /> {isExporting ? 'Generando PDF...' : 'Descargar PDF'}
            </button>

            <button 
              onClick={handleExportSVG}
              className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
            >
              <Code size={16} /> SVG Vector
            </button>

            <button 
              onClick={handleExportExcel}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[42px]"
            >
              <FileSpreadsheet size={16} /> Excel XLSX
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
