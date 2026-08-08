import { TimeUtils } from './timeUtils';

const DEFAULT_LOGO = '/img/Universidad-nacional-del-callao.png';

const PALETTES = {
  'default': {
    light: ['#d1fae5', '#e0f2fe', '#fef3c7', '#fee2e2', '#f3e8ff', '#ffedd5', '#ccfbf1', '#cffafe', '#fef08a', '#fce7f3'],
    dark: ['#065f46', '#075985', '#92400e', '#991b1b', '#6b21a8', '#9a3412', '#115e59', '#155e75', '#854d0e', '#831843']
  },
  'vibrant': {
    light: ['#bef264', '#67e8f9', '#fde047', '#fca5a5', '#d8b4fe', '#fdba74', '#5eead4', '#7dd3fc', '#fef08a', '#fda4af'],
    dark: ['#4d7c0f', '#0e7490', '#a16207', '#b91c1c', '#7e22ce', '#c2410c', '#0f766e', '#0369a1', '#854d0e', '#be123c']
  },
  'pastel': {
    light: ['#bbf7d0', '#bae6fd', '#fef08a', '#fecaca', '#e9d5ff', '#fed7aa', '#99f6e4', '#a5f3fc', '#fde047', '#fbcfe8'],
    dark: ['#166534', '#0369a1', '#854d0e', '#991b1b', '#6b21a8', '#9a3412', '#115e59', '#155e75', '#713f12', '#9d174d']
  }
};

export const getScheduleBounds = (selectedCourses) => {
  if (!selectedCourses || selectedCourses.length === 0) return { start: 8, end: 22 };
  let earliest = 24;
  let latest = 0;
  selectedCourses.forEach(({ seccion }) => {
    seccion?.clases?.forEach(clase => {
      const range = TimeUtils.parseTimeRange(clase.hora);
      const startHour = Math.floor(range.start / 60);
      const endHour = Math.ceil(range.end / 60);
      if (startHour < earliest) earliest = startHour;
      if (endHour > latest) latest = endHour;
    });
  });
  if (earliest === 24) earliest = 8;
  if (latest === 0) latest = 22;
  const start = Math.max(0, earliest);
  const end = Math.min(24, latest);
  return { start, end: end <= start ? start + 1 : end };
};

export const buildGridWithRowsAndSlots = (selectedCourses, earliestHour, endHour, options = {}) => {
  const {
    headerBg = '#0a2540',
    headerTextColor = '#ffffff',
    gridBorderColor = '#e2e8f0',
    timeColBg = '#f8fafc',
    timeColText = '#475569',
    cardBgFunc,
    cardTextFunc,
    cardBorderFunc,
    badgeFunc,
    customRowHeight
  } = options;

  const totalHours = Math.max(1, endHour - earliestHour);
  const rowHeight = customRowHeight || Math.max(48, Math.min(75, Math.floor(750 / totalHours)));
  const headerRowHeight = 40;
  const actualGridHeight = headerRowHeight + (totalHours * rowHeight);

  const hasSaturday = selectedCourses.some(sc =>
    sc.seccion?.clases?.some(c => (c.dia || '').toLowerCase().includes('sáb') || (c.dia || '').toLowerCase().includes('sab'))
  );

  const daysShort = hasSaturday ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const daysLabels = hasSaturday ? ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'] : ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  const numDays = daysLabels.length;

  const hourColWidthPct = 10.0;
  const dayColWidthPct = (100.0 - hourColWidthPct) / numDays;

  const dayMap = {};
  daysShort.forEach((_, i) => (dayMap[i] = []));

  selectedCourses.forEach(selected => {
    const { curso, seccion } = selected;
    seccion?.clases?.forEach(clase => {
      const range = TimeUtils.parseTimeRange(clase.hora);
      const dayIndex = daysShort.indexOf(clase.dia);
      if (dayIndex !== -1) {
        dayMap[dayIndex].push({ curso, seccion, clase, range });
      }
    });
  });

  let headerColsHTML = `<th style="width: ${hourColWidthPct}%; border-right: 1px solid ${gridBorderColor}; border-bottom: 2px solid ${gridBorderColor}; text-align: center; padding: 10px 4px;">HORA</th>`;
  daysLabels.forEach((label, idx) => {
    const borderRight = idx === daysLabels.length - 1 ? '' : `border-right: 1px solid ${gridBorderColor};`;
    headerColsHTML += `<th style="width: ${dayColWidthPct}%; ${borderRight} border-bottom: 2px solid ${gridBorderColor}; text-align: center; padding: 10px 4px;">${label}</th>`;
  });

  let hourRowsHTML = '';
  for (let h = earliestHour; h < endHour; h++) {
    const timeStr = `${String(h).padStart(2, '0')}:00`;
    let rowTDs = `<td style="border-right: 1px solid ${gridBorderColor}; border-bottom: 1px solid ${gridBorderColor}; background: ${timeColBg}; text-align: center; font-size: 11px; font-weight: 700; color: ${timeColText}; font-family: monospace; vertical-align: middle;">${timeStr}</td>`;
    for (let d = 0; d < numDays; d++) {
      const borderRight = d === numDays - 1 ? '' : `border-right: 1px solid ${gridBorderColor};`;
      rowTDs += `<td style="${borderRight} border-bottom: 1px solid ${gridBorderColor};"></td>`;
    }
    hourRowsHTML += `<tr style="height: ${rowHeight}px;">${rowTDs}</tr>`;
  }

  const palette = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#db2777', '#7c3aed', '#0d9488', '#ea580c'];
  const titleFontSize = rowHeight >= 65 ? '11.5px' : rowHeight >= 55 ? '10.5px' : '9.5px';
  const subFontSize = rowHeight >= 65 ? '10px' : '9px';
  const badgeFontSize = rowHeight >= 65 ? '9.5px' : '8.5px';

  let slotsHTML = '';
  Object.entries(dayMap).forEach(([dayStr, items]) => {
    const dayIdx = parseInt(dayStr, 10);
    if (items.length === 0) return;

    items.sort((a, b) => a.range.start - b.range.start);

    items.forEach((item, idx) => {
      const startMins = item.range.start - (earliestHour * 60);
      const durationMins = item.range.end - item.range.start;

      const topPx = headerRowHeight + (startMins / 60) * rowHeight;
      const heightPx = Math.max(30, (durationMins / 60) * rowHeight);
      const leftPct = hourColWidthPct + (dayIdx * dayColWidthPct);
      const widthPct = dayColWidthPct - 0.4;

      const color = palette[idx % palette.length];
      const bg = cardBgFunc ? cardBgFunc(color, idx, item) : '#eff6ff';
      const text = cardTextFunc ? cardTextFunc(color, idx, item) : '#0f172a';
      const border = cardBorderFunc ? cardBorderFunc(color, idx, item) : `border-left: 4px solid ${color};`;
      const badge = badgeFunc ? badgeFunc(item.clase, item.seccion) : `<span style="font-size:${badgeFontSize}; font-weight:700;">${item.clase.aula || ''}</span>`;

      const startH = Math.floor(item.range.start / 60);
      const startM = item.range.start % 60;
      const endH = Math.floor(item.range.end / 60);
      const endM = item.range.end % 60;
      const timeFormatted = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} a ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      slotsHTML += `
        <div style="position: absolute; top: ${topPx + 2}px; left: ${leftPct + 0.2}%; width: ${widthPct}%; height: ${heightPx - 4}px; padding: 4px 6px; box-sizing: border-box; z-index: 10; ${border} background: ${bg}; color: ${text}; font-size: 11px; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
            <div style="text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-weight: 800; font-size: ${titleFontSize}; line-height: 1.2; text-transform: uppercase; text-align: center; width: 100%;">${item.curso.nombre}</div>
                <div style="font-size: ${subFontSize}; opacity: 0.88; margin-top: 1px; font-weight: 600; text-align: center; width: 100%;">Sec. ${item.seccion.id} · ${item.clase.tipo === 'T' ? 'Teoría' : 'Práctica'}</div>
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; margin-top: 2px; gap: 2px; text-align: center; width: 100%;">
                <div style="display: flex; justify-content: center; align-items: center; width: 100%; text-align: center;">
                    ${badge}
                </div>
                <div style="font-size: ${badgeFontSize}; font-weight: 700; opacity: 0.88; text-align: center; width: 100%; margin-top: 1px;">${timeFormatted}</div>
            </div>
        </div>
      `;
    });
  });

  return `
    <div style="position: relative; width: 100%; height: ${actualGridHeight}px; background: #ffffff; border: 1px solid ${gridBorderColor}; overflow: hidden; box-sizing: border-box; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed; background: #ffffff;">
            <thead>
                <tr style="height: ${headerRowHeight}px; background: ${headerBg}; color: ${headerTextColor}; font-weight: 800; font-size: 11px; text-align: center;">
                    ${headerColsHTML}
                </tr>
            </thead>
            <tbody>
                ${hourRowsHTML}
            </tbody>
        </table>
        ${slotsHTML}
    </div>
  `;
};

export const generateNativeHTML = (facultyName, studentName, totalCredits, selectedCourses, logoSrc = DEFAULT_LOGO, earliestHour, endHour, paletteOverride = 'default') => {
  const paletteObj = PALETTES[paletteOverride] || PALETTES['default'];
  const paletteColors = paletteObj.light;

  const courseColorMap = {};
  let colorIdx = 0;
  selectedCourses.forEach(c => {
    if (!courseColorMap[c.curso.codigo]) {
      courseColorMap[c.curso.codigo] = paletteColors[colorIdx % paletteColors.length];
      colorIdx++;
    }
  });

  const gridHTML = buildGridWithRowsAndSlots(selectedCourses, earliestHour, endHour, {
    headerBg: '#f8fafc',
    headerTextColor: '#0f172a',
    gridBorderColor: '#cbd5e1',
    timeColBg: '#ffffff',
    timeColText: '#0f172a',
    cardBgFunc: (c, idx, item) => (item && item.curso ? (courseColorMap[item.curso.codigo] || c) : c),
    cardTextFunc: () => '#000000',
    cardBorderFunc: (c, idx, item) => {
      const code = item?.curso?.codigo;
      const baseColor = (code && courseColorMap[code]) ? courseColorMap[code] : c;
      return `border: 1.5px solid rgba(0,0,0,0.2); border-left: 5px solid ${baseColor}; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);`;
    },
    badgeFunc: (clase) => {
      const tipo = (clase.tipo || 'T').toUpperCase();
      const aula = clase.aula || 'AULA';
      return `<span style="display: inline-block; background: #ffffff; color: #0f172a; padding: 2px 6px; border-radius: 10px; font-size: 8.5px; font-weight: 800; border: 1px solid rgba(15,23,42,0.18);">${aula} · [${tipo}]</span>`;
    }
  });

  return `
  <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px 24px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; color: #0f172a; font-family: system-ui, -apple-system, sans-serif;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
              <img src="${logoSrc}" style="height: 56px; width: auto;" />
              <div>
                  <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase;">UNIVERSIDAD NACIONAL DEL CALLAO</h1>
                  <p style="font-size: 11px; font-weight: 700; color: #6366f1; margin-top: 2px;">Facultad de ${facultyName} · Planificador de Horarios 2026-B ${studentName ? `· Estudiante: ${studentName}` : ''}</p>
              </div>
          </div>
          <div style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 12px; text-align: center;">
              <div style="font-size: 16px; font-weight: 900; color: #6366f1;">${totalCredits} CRÉDITOS</div>
              <div style="font-size: 8.5px; font-weight: 800; color: #64748b; text-transform: uppercase;">Paleta: ${paletteOverride.toUpperCase()}</div>
          </div>
      </div>
      ${gridHTML}
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; font-weight: 600; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <span>UNIVERSIDAD NACIONAL DEL CALLAO · PLANIFICADOR DE HORARIOS 2026-B</span>
          <span>${selectedCourses.length} Cursos Seleccionados</span>
      </div>
  </div>
  `;
};

export const generateFormalHTML = (facultyName, studentName, totalCredits, selectedCourses, logoSrc = DEFAULT_LOGO, earliestHour, endHour) => {
  const gridHTML = buildGridWithRowsAndSlots(selectedCourses, earliestHour, endHour, {
    headerBg: '#0a2540',
    headerTextColor: '#ffffff',
    gridBorderColor: '#0a2540',
    timeColBg: '#f8fafc',
    timeColText: '#0a2540',
    cardBgFunc: () => '#ffffff',
    cardTextFunc: () => '#0a2540',
    cardBorderFunc: (c) => `border: 1.5px solid #0a2540; border-left: 5px solid ${c};`,
    badgeFunc: (clase) => `<span style="background: #0a2540; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-size: 8.5px; font-weight: 700;">AULA ${clase.aula || '---'}</span>`
  });

  return `
  <div style="background: #ffffff; border-radius: 8px; border: 3px double #0a2540; padding: 20px 26px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; font-family: 'Times New Roman', Times, serif;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0a2540; padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
              <img src="${logoSrc}" style="height: 56px; width: auto;" />
              <div>
                  <h1 style="font-size: 20px; font-weight: 900; color: #0a2540; margin: 0; text-transform: uppercase;">UNIVERSIDAD NACIONAL DEL CALLAO</h1>
                  <h2 style="font-size: 11.5px; font-weight: 700; color: #854d0e; margin: 2px 0 0 0; text-transform: uppercase;">FACULTAD DE ${facultyName} · PLANIFICADOR DE HORARIOS 2026-B</h2>
                  ${studentName ? `<p style="font-size: 11px; color: #1e293b; margin: 2px 0 0 0; font-weight: 700; font-family: sans-serif;">ESTUDIANTE: ${studentName.toUpperCase()}</p>` : ''}
              </div>
          </div>
          <div style="border: 1.5px solid #0a2540; padding: 6px 14px; border-radius: 4px; background: #fcfcfc; text-align: center;">
              <div style="font-size: 16px; font-weight: 900; color: #0a2540; font-family: sans-serif;">${totalCredits} CRÉDITOS</div>
              <div style="font-size: 8.5px; font-weight: 700; color: #854d0e;">CARGA TOTAL MATRICULADA</div>
          </div>
      </div>
      <div style="font-family: sans-serif;">
          ${gridHTML}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #475569; font-family: sans-serif; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <span style="font-weight: 700; color: #0a2540;">UNIVERSIDAD NACIONAL DEL CALLAO · PLANIFICADOR DE CURSOS Y HORARIOS</span>
          <span>Semestre Académico 2026-B</span>
      </div>
  </div>
  `;
};

export const generateCreativeHTML = (facultyName, studentName, totalCredits, selectedCourses, logoSrc = DEFAULT_LOGO, earliestHour, endHour) => {
  const gridHTML = buildGridWithRowsAndSlots(selectedCourses, earliestHour, endHour, {
    headerBg: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
    headerTextColor: '#ffffff',
    gridBorderColor: '#ddd6fe',
    timeColBg: 'rgba(237, 233, 254, 0.5)',
    timeColText: '#581c87',
    cardBgFunc: (c) => `${c}22`,
    cardTextFunc: () => '#1e1b4b',
    cardBorderFunc: (c) => `border: 2px solid ${c}; border-radius: 12px; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.12);`,
    badgeFunc: (clase) => `<span style="background: rgba(255,255,255,0.95); padding: 2px 8px; border-radius: 12px; font-size: 8.5px; font-weight: 800; color: #4338ca; border: 1.5px solid #c7d2fe;">AULA ${clase.aula || '---'}</span>`
  });

  return `
  <div style="background: linear-gradient(135deg, #ede9fe 0%, #fbcfe8 50%, #bae6fd 100%); border-radius: 24px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); padding: 12px 18px; border-radius: 18px; border: 1.5px solid rgba(255, 255, 255, 0.8);">
          <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${logoSrc}" style="height: 50px; width: auto;" />
              <div>
                  <h1 style="font-size: 20px; font-weight: 900; background: linear-gradient(to right, #6366f1, #d946ef); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">✨ MI PLANNER UNAC 2026-B</h1>
                  <p style="font-size: 11px; font-weight: 700; color: #6b21a8; margin-top: 2px;">Universidad Nacional del Callao · Facultad de ${facultyName} ${studentName ? `· ${studentName}` : ''}</p>
              </div>
          </div>
          <div style="background: #f3e8ff; border: 2px solid #d8b4fe; padding: 6px 14px; border-radius: 18px; font-weight: 800; color: #6b21a8; font-size: 12px;">
              🎯 ${totalCredits} Créditos
          </div>
      </div>
      ${gridHTML}
  </div>
  `;
};

export const generateSimpleHTML = (facultyName, studentName, totalCredits, selectedCourses, logoSrc = DEFAULT_LOGO, earliestHour, endHour) => {
  const gridHTML = buildGridWithRowsAndSlots(selectedCourses, earliestHour, endHour, {
    headerBg: '#ffffff',
    headerTextColor: '#020617',
    gridBorderColor: '#020617',
    timeColBg: '#ffffff',
    timeColText: '#020617',
    cardBgFunc: () => '#ffffff',
    cardTextFunc: () => '#020617',
    cardBorderFunc: () => `border: 1.5px solid #020617; border-radius: 2px;`,
    badgeFunc: (clase) => `<span style="font-size: 8.5px; font-weight: 800; color: #020617; font-family: monospace;">AULA ${clase.aula || '---'}</span>`
  });

  return `
  <div style="background: #ffffff; padding: 20px 26px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; color: #020617; font-family: sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #020617; padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
              <img src="${logoSrc}" style="height: 48px; width: auto;" />
              <div>
                  <h1 style="font-size: 20px; font-weight: 900; margin: 0;">HORARIO DE CLASES</h1>
                  <p style="font-size: 10.5px; font-weight: 600; margin-top: 2px; color: #475569;">UNIVERSIDAD NACIONAL DEL CALLAO · FACULTAD DE ${facultyName} ${studentName ? `· ${studentName.toUpperCase()}` : ''}</p>
              </div>
          </div>
          <div style="font-size: 13px; font-weight: 900; font-family: monospace;">${totalCredits} CRÉDITOS · SEMESTRE 2026-B</div>
      </div>
      ${gridHTML}
  </div>
  `;
};

export const generateModernHTML = (facultyName, studentName, totalCredits, selectedCourses, logoSrc = DEFAULT_LOGO, earliestHour, endHour) => {
  const neonColors = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];
  const gridHTML = buildGridWithRowsAndSlots(selectedCourses, earliestHour, endHour, {
    headerBg: '#0b0f19',
    headerTextColor: '#38bdf8',
    gridBorderColor: '#1e293b',
    timeColBg: '#0f172a',
    timeColText: '#38bdf8',
    cardBgFunc: () => '#0f172a',
    cardTextFunc: () => '#f8fafc',
    cardBorderFunc: (c, idx) => {
      const neon = neonColors[idx % neonColors.length];
      return `border: 1.5px solid ${neon}; border-left: 5px solid ${neon}; border-radius: 8px;`;
    },
    badgeFunc: (clase) => `<span style="background: rgba(6, 182, 212, 0.15); color: #38bdf8; border: 1px solid #0284c7; padding: 1px 6px; border-radius: 4px; font-size: 8.5px; font-weight: 700;">AULA: ${clase.aula || 'ONLINE'}</span>`
  });

  return `
  <div style="background: #0b0f19; border-radius: 18px; border: 1px solid #1e293b; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; color: #f8fafc; font-family: monospace;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${logoSrc}" style="height: 48px; width: auto; filter: brightness(1.2);" />
              <div>
                  <h1 style="font-size: 18px; font-weight: 900; color: #38bdf8; margin: 0;">[SYSTEM_SCHEDULE // UNAC]</h1>
                  <p style="font-size: 10px; color: #94a3b8; margin-top: 2px;">UNIVERSIDAD NACIONAL DEL CALLAO // FACULTAD DE ${facultyName.toUpperCase()} // USER: ${studentName ? studentName.toUpperCase() : 'GUEST'}</p>
              </div>
          </div>
          <div style="background: #1e293b; border: 1px solid #38bdf8; padding: 6px 14px; border-radius: 10px; text-align: right;">
              <div style="font-size: 16px; font-weight: 900; color: #38bdf8;">${totalCredits} CREDITS</div>
          </div>
      </div>
      ${gridHTML}
  </div>
  `;
};

export const generateExecutiveHTML = (facultyName, studentName, totalCredits, selectedCourses, logoSrc = DEFAULT_LOGO, earliestHour, endHour) => {
  const gridHTML = buildGridWithRowsAndSlots(selectedCourses, earliestHour, endHour, {
    headerBg: '#0f172a',
    headerTextColor: '#ffffff',
    gridBorderColor: '#cbd5e1',
    timeColBg: '#f8fafc',
    timeColText: '#334155',
    cardBgFunc: () => '#ffffff',
    cardTextFunc: () => '#0f172a',
    cardBorderFunc: (c) => `border: 1px solid #cbd5e1; border-left: 5px solid ${c}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);`,
    badgeFunc: (clase) => `<span style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 6px; font-size: 8.5px; font-weight: 700;">📍 ${clase.aula || 'AULA'}</span>`
  });

  const fichaRowsHTML = selectedCourses.map(sc => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 9.5px;">
          <td style="padding: 5px 6px; font-weight: 800; font-family: monospace; color: #4338ca;">${sc.curso.codigo}</td>
          <td style="padding: 5px 6px; font-weight: 700; color: #0f172a;">${sc.curso.nombre}</td>
          <td style="padding: 5px 6px; font-weight: 800; text-align: center; color: #047857;">${sc.seccion.id}</td>
          <td style="padding: 5px 6px; font-weight: 800; text-align: center;">${sc.curso.creditos || 3}</td>
      </tr>
  `).join('');

  return `
  <div style="background: #f8fafc; border-radius: 18px; border: 1px solid #cbd5e1; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; color: #0f172a; position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; z-index: 10; background: #ffffff; padding: 10px 16px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${logoSrc}" style="height: 52px; width: auto;" />
              <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                      <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0;">DASHBOARD HORARIO ACADÉMICO</h1>
                      <span style="background: #dcfce7; color: #166534; font-size: 9.5px; font-weight: 800; padding: 2px 8px; border-radius: 10px; border: 1px solid #86efac;">UNAC 2026-B</span>
                  </div>
                  <p style="font-size: 10.5px; font-weight: 600; color: #64748b; margin-top: 2px;">Universidad Nacional del Callao · Facultad de ${facultyName} ${studentName ? `· ${studentName}` : ''}</p>
              </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
              <div style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 14px; font-weight: 900; color: #4f46e5;">${totalCredits}</div>
                  <div style="font-size: 8px; font-weight: 700; color: #64748b;">CRÉDITOS</div>
              </div>
              <div style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 14px; font-weight: 900; color: #0284c7;">${selectedCourses.length}</div>
                  <div style="font-size: 8px; font-weight: 700; color: #64748b;">CURSOS</div>
              </div>
          </div>
      </div>

      <div style="display: flex; gap: 14px; z-index: 10;">
          <div style="flex: 1;">
              ${gridHTML}
          </div>

          <div style="width: 280px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; shrink: 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);">
              <div>
                  <div style="font-size: 11px; font-weight: 900; color: #0f172a; border-bottom: 2px solid #4f46e5; padding-bottom: 4px; margin-bottom: 6px; text-transform: uppercase;">
                      📋 Ficha de Asignaturas
                  </div>
                  <table style="width: 100%; border-collapse: collapse; text-align: left;">
                      <thead>
                          <tr style="background: #f1f5f9; font-size: 8.5px; font-weight: 800; color: #475569;">
                              <th style="padding: 4px 6px;">CÓD.</th>
                              <th style="padding: 4px 6px;">CURSO</th>
                              <th style="padding: 4px 6px; text-align: center;">SEC.</th>
                              <th style="padding: 4px 6px; text-align: center;">CR.</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${fichaRowsHTML}
                      </tbody>
                  </table>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; font-size: 9px; color: #64748b; text-align: center; margin-top: 10px;">
                  <div style="font-weight: 800; color: #0f172a; margin-bottom: 1px;">PLANIFICADOR UNAC 2026-B</div>
                  <span>Organización personal de horarios</span>
              </div>
          </div>
      </div>
  </div>
  `;
};

export const renderDesignHTML = (designId, selectedCourses, options = {}) => {
  const { facultyName = 'ADMINISTRACIÓN', studentName = 'Estudiante', logoSrc = DEFAULT_LOGO } = options;
  const { start: earliestHour, end: endHour } = getScheduleBounds(selectedCourses);
  const totalCredits = selectedCourses.reduce((acc, c) => acc + (c.curso.creditos || 3), 0);

  switch (designId) {
    case 'native':
      return generateNativeHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour, 'default');
    case 'palette-suaves':
      return generateNativeHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour, 'default');
    case 'palette-vibrante':
      return generateNativeHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour, 'vibrant');
    case 'palette-pastel':
      return generateNativeHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour, 'pastel');
    case 'formal':
      return generateFormalHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour);
    case 'creative':
      return generateCreativeHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour);
    case 'simple':
      return generateSimpleHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour);
    case 'modern':
      return generateModernHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour);
    case 'executive':
      return generateExecutiveHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour);
    default:
      return generateNativeHTML(facultyName, studentName, totalCredits, selectedCourses, logoSrc, earliestHour, endHour, 'default');
  }
};
