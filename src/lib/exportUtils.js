import * as XLSX from 'xlsx-js-style';
import { TimeUtils } from './timeUtils';

const hexToRgbStr = (hex) => {
  if (!hex) return '1F4E79';
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  return clean.toUpperCase();
};

const DEFAULT_COURSE_COLORS = [
  '1F4E79', '548235', '7030A0', 'C55A11', 'BF8F00', 'C00000', '008080', '2F4F4F'
];

export const exportToExcel = (selectedCourses, studentName = 'Estudiante', facultyName = 'ADMINISTRACIÓN') => {
  if (!selectedCourses || selectedCourses.length === 0) return;

  const wb = XLSX.utils.book_new();
  const ws = {};
  const merges = [];

  // Check if Saturday has classes
  const hasSaturday = selectedCourses.some(sc =>
    sc.seccion?.clases?.some(c => (c.dia || '').toLowerCase().includes('sáb') || (c.dia || '').toLowerCase().includes('sab'))
  );

  const daysConfig = hasSaturday
    ? ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
    : ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  
  const totalCols = daysConfig.length + 1; // HORA + days
  const maxColChar = String.fromCharCode(64 + totalCols);

  // Dynamic Hour Bounds
  let earliestHour = 22;
  let latestHour = 8;
  selectedCourses.forEach(({ seccion }) => {
    seccion?.clases?.forEach(clase => {
      const range = TimeUtils.parseTimeRange(clase.hora);
      const startH = Math.floor(range.start / 60);
      const endH = Math.round(range.end / 60);
      if (startH < earliestHour) earliestHour = startH;
      if (endH > latestHour) latestHour = endH;
    });
  });

  const startHour = Math.max(7, earliestHour);
  const endHour = Math.min(23, Math.max(startHour + 1, latestHour));
  const totalCredits = selectedCourses.reduce((acc, sc) => acc + (parseFloat(sc.curso.creditos) || 3), 0);

  // Course Color Mapping
  const courseColorsMap = {};
  selectedCourses.forEach((sc, idx) => {
    courseColorsMap[sc.curso.codigo] = DEFAULT_COURSE_COLORS[idx % DEFAULT_COURSE_COLORS.length];
  });

  // Borders
  const thinBorder = {
    top: { style: 'thin', color: { rgb: 'D9D9D9' } },
    bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
    left: { style: 'thin', color: { rgb: 'D9D9D9' } },
    right: { style: 'thin', color: { rgb: 'D9D9D9' } }
  };

  // Helper to set cell
  const setCell = (r, c, value, style) => {
    const colName = String.fromCharCode(65 + c);
    const cellRef = `${colName}${r}`;
    ws[cellRef] = { v: value, s: style };
  };

  // 1. Header Banner (Row 1)
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });
  for (let c = 0; c < totalCols; c++) {
    setCell(1, c, c === 0 ? '📅  PLANIFICADOR DE HORARIOS — UNAC 2026-B' : '', {
      fill: { fgColor: { rgb: '0D1B2A' } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 12, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' }
    });
  }

  // 2. Subheader Info (Row 2)
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });
  const subheaderText = `FACULTAD DE ${facultyName.toUpperCase()}  |  ${studentName.toUpperCase()}  |  ${totalCredits} CRÉDITOS`;
  for (let c = 0; c < totalCols; c++) {
    setCell(2, c, c === 0 ? subheaderText : '', {
      fill: { fgColor: { rgb: '13294B' } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 9.5, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' }
    });
  }

  // 3. Row 3: Blank spacing

  // 4. Table Header (Row 4)
  setCell(4, 0, 'HORA', {
    fill: { fgColor: { rgb: '13294B' } },
    font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: thinBorder
  });
  daysConfig.forEach((day, idx) => {
    setCell(4, idx + 1, day, {
      fill: { fgColor: { rgb: '13294B' } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 10, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    });
  });

  // 5. Grid Rows (Row 5 onwards)
  let currentRow = 5;
  const rowHeights = [
    { hpt: 26 }, // R1
    { hpt: 22 }, // R2
    { hpt: 10 }, // R3
    { hpt: 24 }  // R4
  ];

  const dayShortMap = { 'LUNES': 'Lun', 'MARTES': 'Mar', 'MIÉRCOLES': 'Mié', 'JUEVES': 'Jue', 'VIERNES': 'Vie', 'SÁBADO': 'Sáb' };

  for (let hour = startHour; hour < endHour; hour++) {
    rowHeights.push({ hpt: 52 }); // Grid row height
    const hStartStr = `${String(hour).padStart(2, '0')}:00`;
    const hEndStr = `${String(hour + 1).padStart(2, '0')}:00`;
    const timeLabel = `${hStartStr} - ${hEndStr}`;

    // Col A: HORA
    setCell(currentRow, 0, timeLabel, {
      fill: { fgColor: { rgb: 'F4F6F8' } },
      font: { bold: true, sz: 9, color: { rgb: '333333' }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: thinBorder
    });

    // Days Cols (B to G)
    daysConfig.forEach((dayLong, dayIdx) => {
      const dayShort = dayShortMap[dayLong];
      const slotStart = hour * 60;
      const slotEnd = (hour + 1) * 60;

      // Find matching classes in this hour slot
      const classesInSlot = [];
      selectedCourses.forEach(sc => {
        sc.seccion?.clases?.forEach(clase => {
          if (clase.dia === dayShort) {
            const range = TimeUtils.parseTimeRange(clase.hora);
            if (slotStart < range.end && slotEnd > range.start) {
              classesInSlot.push({ curso: sc.curso, seccion: sc.seccion, clase });
            }
          }
        });
      });

      if (classesInSlot.length > 0) {
        const item = classesInSlot[0];
        const tipoLabel = (item.clase.tipo || 'T').toUpperCase() === 'T' ? 'TEORÍA' : (item.clase.tipo || '').toUpperCase() === 'P' ? 'PRÁCTICA' : 'LABORATORIO';
        const teacherShort = (item.seccion.docente || 'Por designar').split(' ').slice(0, 2).join(' ');
        const cellText = `${item.curso.nombre.toUpperCase()}\n[${tipoLabel}] · ${item.clase.aula || 'Aula'}\n${teacherShort}`;
        const bgRgb = courseColorsMap[item.curso.codigo] || '1F4E79';

        setCell(currentRow, dayIdx + 1, cellText, {
          fill: { fgColor: { rgb: bgRgb } },
          font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 8.5, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: thinBorder
        });
      } else {
        setCell(currentRow, dayIdx + 1, '—', {
          fill: { fgColor: { rgb: 'F4F6F8' } },
          font: { color: { rgb: 'A0AEC0' }, sz: 9, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: thinBorder
        });
      }
    });

    currentRow++;
  }

  // 6. Blank spacing row
  currentRow++;
  rowHeights.push({ hpt: 12 });

  // 7. Legend Banner
  merges.push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: totalCols - 1 } });
  for (let c = 0; c < totalCols; c++) {
    setCell(currentRow, c, c === 0 ? 'LEYENDA DE CURSOS' : '', {
      fill: { fgColor: { rgb: '0D1B2A' } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 10, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' }
    });
  }
  rowHeights.push({ hpt: 22 });
  currentRow++;

  // 8. Legend Items (2 per row)
  for (let i = 0; i < selectedCourses.length; i += 2) {
    rowHeights.push({ hpt: 20 });
    const sc1 = selectedCourses[i];
    const bg1 = courseColorsMap[sc1.curso.codigo] || '1F4E79';

    // Swatch 1
    setCell(currentRow, 0, '', {
      fill: { fgColor: { rgb: bg1 } },
      border: thinBorder
    });

    // Name 1 (Merged B:C)
    merges.push({ s: { r: currentRow - 1, c: 1 }, e: { r: currentRow - 1, c: 2 } });
    setCell(currentRow, 1, sc1.curso.nombre, {
      font: { bold: true, sz: 9, name: 'Calibri' },
      alignment: { vertical: 'center' }
    });
    setCell(currentRow, 2, '', {});

    // Swatch & Name 2 if exists
    if (i + 1 < selectedCourses.length) {
      const sc2 = selectedCourses[i + 1];
      const bg2 = courseColorsMap[sc2.curso.codigo] || '548235';

      setCell(currentRow, 3, '', {
        fill: { fgColor: { rgb: bg2 } },
        border: thinBorder
      });

      merges.push({ s: { r: currentRow - 1, c: 4 }, e: { r: currentRow - 1, c: Math.min(5, totalCols - 1) } });
      setCell(currentRow, 4, sc2.curso.nombre, {
        font: { bold: true, sz: 9, name: 'Calibri' },
        alignment: { vertical: 'center' }
      });
      if (totalCols > 5) setCell(currentRow, 5, '', {});
    }

    currentRow++;
  }

  // 9. Footer Note
  currentRow++;
  rowHeights.push({ hpt: 12 });
  merges.push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: totalCols - 1 } });
  const footerText = 'Generado a partir de la ficha de matrícula oficial UNAC 2026-B. Verificar cualquier cambio de aula en el sistema institucional.';
  for (let c = 0; c < totalCols; c++) {
    setCell(currentRow, c, c === 0 ? footerText : '', {
      font: { italic: true, sz: 8.5, color: { rgb: '718096' }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' }
    });
  }

  // Final sheet configuration
  ws['!ref'] = `A1:${maxColChar}${currentRow}`;
  ws['!merges'] = merges;
  ws['!rows'] = rowHeights;
  ws['!cols'] = [
    { wch: 15 }, // HORA
    { wch: 28 }, // LUNES
    { wch: 28 }, // MARTES
    { wch: 28 }, // MIÉRCOLES
    { wch: 28 }, // JUEVES
    { wch: 28 }, // VIERNES
    ...(hasSaturday ? [{ wch: 28 }] : []) // SÁBADO
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Horario 2026-B');
  XLSX.writeFile(wb, `Horario_UNAC_2026-B_${studentName.replace(/\s+/g, '_')}.xlsx`);
};
