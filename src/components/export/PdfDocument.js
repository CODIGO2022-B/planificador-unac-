import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { TimeUtils } from '@/lib/timeUtils';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: 'contain',
  },
  titleGroup: {
    flexDirection: 'column',
  },
  univTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  facultySubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 2,
  },
  creditsBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  creditsSubText: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  timeColumn: {
    width: 50,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  timeCell: {
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    fontFamily: 'Courier',
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  dayHeader: {
    height: 24,
    backgroundColor: '#0a2540',
    borderBottomWidth: 1,
    borderBottomColor: '#0a2540',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dayBody: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  classBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 4,
    padding: 3,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 1,
  },
  classSub: {
    fontSize: 6.5,
    color: '#1e293b',
    textAlign: 'center',
  }
});

const ROW_HEIGHT = 36;

const getScheduleBounds = (selectedCourses) => {
  if (!selectedCourses || selectedCourses.length === 0) return { start: 8, end: 22 };
  let earliest = 23;
  let latest = 8;
  selectedCourses.forEach(({ seccion }) => {
    seccion?.clases?.forEach(clase => {
      const range = TimeUtils.parseTimeRange(clase.hora);
      const startHour = Math.floor(range.start / 60);
      const endHour = Math.ceil(range.end / 60);
      if (startHour < earliest) earliest = startHour;
      if (endHour > latest) latest = endHour;
    });
  });
  if (earliest === 23) earliest = 8;
  if (latest === 8) latest = 22;
  const start = Math.max(0, earliest);
  const end = Math.min(24, latest);
  return { start, end: end <= start ? start + 1 : end };
};

const getTopAndHeight = (horaStr, startHour) => {
  const range = TimeUtils.parseTimeRange(horaStr);
  if (!range) return null;
  const top = ((range.start - (startHour * 60)) / 60) * ROW_HEIGHT;
  const height = Math.max(20, ((range.end - range.start) / 60) * ROW_HEIGHT);
  return { top, height };
};

export const PdfDocument = ({ courses, getCourseColor, studentName = '' }) => {
  const totalCredits = (courses || []).reduce((acc, sc) => acc + (sc.curso.creditos || 3), 0);

  const bounds = getScheduleBounds(courses);
  const startHour = bounds.start;
  const endHour = bounds.end;
  const totalHours = Math.max(1, endHour - startHour);

  // Recorte inteligente de días: Sábado se muestra ÚNICAMENTE si hay clases en sábado
  const hasSaturday = (courses || []).some(sc =>
    sc.seccion?.clases?.some(c => (c.dia || '').toLowerCase().includes('sáb') || (c.dia || '').toLowerCase().includes('sab'))
  );
  const days = hasSaturday ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header con Membrete Oficial UNAC */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src="/img/Universidad-nacional-del-callao.png" style={styles.logo} />
            <View style={styles.titleGroup}>
              <Text style={styles.univTitle}>UNIVERSIDAD NACIONAL DEL CALLAO</Text>
              <Text style={styles.facultySubtitle}>
                Facultad de Administración • Horario 2026-B {studentName ? `• Estudiante: ${studentName.toUpperCase()}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsText}>{totalCredits} CRÉDITOS</Text>
            <Text style={styles.creditsSubText}>CARGA MATRICULADA</Text>
          </View>
        </View>

        {/* Timetable Grid con Recorte Inteligente de Horas y Días */}
        <View style={styles.grid}>
          {/* Time Column */}
          <View style={styles.timeColumn}>
            <View style={[styles.dayHeader, { backgroundColor: '#f8fafc' }]}>
              <Text style={[styles.dayHeaderText, { color: '#0f172a' }]}>HORA</Text>
            </View>
            {Array.from({ length: totalHours }, (_, i) => startHour + i).map(hour => (
              <View key={hour} style={styles.timeCell}>
                <Text style={styles.timeText}>{`${hour.toString().padStart(2, '0')}:00`}</Text>
              </View>
            ))}
          </View>

          {/* Days Columns */}
          <View style={styles.daysContainer}>
            {days.map((day, idx) => (
              <View key={day} style={[styles.dayColumn, idx === days.length - 1 ? { borderRightWidth: 0 } : {}]}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{day.toUpperCase()}</Text>
                </View>
                <View style={styles.dayBody}>
                  {courses?.map(sc =>
                    sc.seccion.clases?.map((clase, cIdx) => {
                      if (clase.dia !== day) return null;
                      const pos = getTopAndHeight(clase.hora, startHour);
                      if (!pos) return null;

                      const color = getCourseColor ? getCourseColor(sc.curso.codigo) : '#e0e7ff';

                      return (
                        <View
                          key={`${sc.curso.codigo}-${cIdx}`}
                          style={[
                            styles.classBlock,
                            {
                              top: pos.top + 2,
                              height: pos.height - 4,
                              backgroundColor: color,
                            }
                          ]}
                        >
                          <Text style={styles.classTitle}>{sc.curso.nombre}</Text>
                          <Text style={styles.classSub}>
                            Sec. {sc.seccion.id} • {clase.aula}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 4 }}>
          <Text style={{ fontSize: 8, color: '#64748b' }}>UNIVERSIDAD NACIONAL DEL CALLAO • PLANIFICADOR DE HORARIOS 2026-B</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>Documento Oficial Académico</Text>
        </View>
      </Page>
    </Document>
  );
};
