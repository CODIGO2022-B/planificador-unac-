import { TimeUtils } from './timeUtils';

const DAY_MAP_RRULE = {
  'Lun': 'MO',
  'Mar': 'TU',
  'Mié': 'WE',
  'Jue': 'TH',
  'Vie': 'FR',
  'Sáb': 'SA'
};

const DAY_MAP_OFFSET = {
  'Lun': 1, // Aug 17, 2026 is Monday
  'Mar': 2,
  'Mié': 3,
  'Jue': 4,
  'Vie': 5,
  'Sáb': 6
};

export const exportToICS = (selectedCourses, options = {}) => {
  if (!selectedCourses || selectedCourses.length === 0) return;

  const { semesterName = '2026-B', faculty = 'UNAC' } = options;

  // Base Semester Start: Monday, August 17, 2026
  const baseYear = 2026;
  const baseMonth = 7; // 0-indexed: August is 7
  const baseDay = 17; // Monday Aug 17, 2026

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UNAC Planificador Horarios 2026-B//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Horario UNAC ' + semesterName,
    'X-WR-TIMEZONE:America/Lima'
  ];

  selectedCourses.forEach(sc => {
    const { curso, seccion } = sc;
    seccion?.clases?.forEach((clase, idx) => {
      const dayShort = clase.dia;
      const rruleDay = DAY_MAP_RRULE[dayShort];
      const offsetDays = DAY_MAP_OFFSET[dayShort] ? DAY_MAP_OFFSET[dayShort] - 1 : 0;

      if (!rruleDay) return;

      const range = TimeUtils.parseTimeRange(clase.hora);
      const startH = Math.floor(range.start / 60);
      const startM = range.start % 60;
      const endH = Math.floor(range.end / 60);
      const endM = range.end % 60;

      // Event First Date
      const eventDate = new Date(baseYear, baseMonth, baseDay + offsetDays);
      const yearStr = eventDate.getFullYear();
      const monthStr = String(eventDate.getMonth() + 1).padStart(2, '0');
      const dateStr = String(eventDate.getDate()).padStart(2, '0');

      const dtStart = `${yearStr}${monthStr}${dateStr}T${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}00`;
      const dtEnd = `${yearStr}${monthStr}${dateStr}T${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`;

      const uid = `unac-2026b-${curso.codigo}-${seccion.id}-${idx}-${Date.now()}@unac.edu.pe`;
      const summary = `${curso.nombre} (Sec. ${seccion.id})`;
      const location = `Aula: ${clase.aula || 'Por Asignar'} · [${clase.tipo === 'T' ? 'Teoría' : 'Práctica'}]`;
      const description = `Docente: ${seccion.docente || 'Por asignar'} | Curso: ${curso.codigo} | Créditos: ${curso.creditos || 3}`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStart}Z`,
        `DTSTART;TZID=America/Lima:${dtStart}`,
        `DTEND;TZID=America/Lima:${dtEnd}`,
        `RRULE:FREQ=WEEKLY;UNTIL=20261220T235959Z;BYDAY=${rruleDay}`,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Horario_UNAC_${semesterName}_GoogleCalendar.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
