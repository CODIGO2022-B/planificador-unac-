'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TimeUtils } from '@/lib/timeUtils';
import { coursesData } from '@/data/courses';

const ScheduleContext = createContext();

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

export function ScheduleProvider({ children }) {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [historyStack, setHistoryStack] = useState([]);
    const [activePalette, setActivePalette] = useState('default');
    const [customColors, setCustomColors] = useState({});
    const [courseColorIndexMap, setCourseColorIndexMap] = useState({});
    const [colorIndex, setColorIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [previewCourse, setPreviewCourse] = useState(null); // { course, section }
    const [toast, setToast] = useState(null); // { message, type }
    
    const maxHistory = 15;

    // Toast helper
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3500);
    }, []);

    const rebuildColorMap = useCallback((courses) => {
        let newMap = {};
        let newIndex = 0;
        courses.forEach(c => {
            const code = c.curso?.codigo || c.codigo;
            if (code && newMap[code] === undefined) {
                newMap[code] = newIndex;
                newIndex++;
            }
        });
        setCourseColorIndexMap(newMap);
        setColorIndex(newIndex);
    }, []);

    // Load from localStorage & Shared URL on mount
    useEffect(() => {
        const savedPalette = localStorage.getItem('schedule-palette');
        if (savedPalette && PALETTES[savedPalette]) setActivePalette(savedPalette);

        const savedColors = localStorage.getItem('custom-course-colors');
        if (savedColors) setCustomColors(JSON.parse(savedColors));

        const savedSchedulesData = localStorage.getItem('saved-schedules');
        if (savedSchedulesData) {
            try {
                setSavedSchedules(JSON.parse(savedSchedulesData));
            } catch (e) {
                console.error("Error parsing saved schedules:", e);
            }
        }

        // 🔗 Decodificación e importación de horario desde URL (?s=... o ?share=...)
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const sharedParam = urlParams.get('s') || urlParams.get('share') || urlParams.get('data');

            if (sharedParam) {
                try {
                    const jsonStr = decodeURIComponent(atob(sharedParam));
                    const payload = JSON.parse(jsonStr);
                    const items = Array.isArray(payload) ? payload : (payload.items || []);

                    if (Array.isArray(items) && items.length > 0) {
                        const restoredCourses = [];
                        items.forEach(item => {
                            const courseCode = String(item.c || item.codigo);
                            const sectionId = String(item.s || item.seccionId);
                            const targetCourse = coursesData.find(c => String(c.codigo) === courseCode);
                            if (targetCourse && Array.isArray(targetCourse.secciones)) {
                                const targetSection = targetCourse.secciones.find(sec => String(sec.id) === sectionId);
                                if (targetSection) {
                                    restoredCourses.push({
                                        curso: targetCourse,
                                        seccion: targetSection
                                    });
                                }
                            }
                        });

                        if (restoredCourses.length > 0) {
                            setSelectedCourses(restoredCourses);
                            rebuildColorMap(restoredCourses);
                            showToast('¡Horario compartido cargado con éxito!', 'success');
                        }
                    }
                } catch (err) {
                    console.error("Error al decodificar horario compartido desde la URL:", err);
                }
            }
        }

        // Setup dark mode listener
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [rebuildColorMap, showToast]);

    const saveHistory = useCallback((currentCourses) => {
        setHistoryStack(prev => {
            const newHistory = [...prev, currentCourses];
            if (newHistory.length > maxHistory) newHistory.shift();
            return newHistory;
        });
    }, []);

    const addCourse = (courseData) => {
        saveHistory(selectedCourses);
        setSelectedCourses(prev => {
            const filtered = prev.filter(c => c.curso.codigo !== courseData.curso.codigo);
            return [...filtered, courseData];
        });
        
        if (courseColorIndexMap[courseData.curso.codigo] === undefined) {
            setCourseColorIndexMap(prev => ({...prev, [courseData.curso.codigo]: colorIndex}));
            setColorIndex(prev => prev + 1);
        }
        showToast(`Asignatura ${courseData.curso.nombre} (Sec ${courseData.seccion.id}) agregada`, 'success');
    };

    const removeCourse = (courseCode) => {
        saveHistory(selectedCourses);
        setSelectedCourses(prev => prev.filter(c => c.curso.codigo !== courseCode));
        showToast('Asignatura eliminada del horario', 'info');
    };

    const clearSchedule = () => {
        if (selectedCourses.length > 0) saveHistory(selectedCourses);
        setSelectedCourses([]);
        setCourseColorIndexMap({});
        setColorIndex(0);
        showToast('Se vació todo el horario', 'info');
    };

    const undo = () => {
        if (historyStack.length === 0) return false;
        const newHistory = [...historyStack];
        const previousSnapshot = newHistory.pop();
        setHistoryStack(newHistory);
        setSelectedCourses(previousSnapshot || []);
        rebuildColorMap(previousSnapshot || []);
        showToast('Acción deshecha', 'info');
        return true;
    };

    // Guardar Horario en localStorage
    const saveSchedule = async (name, thumbnail = '') => {
        if (!name || selectedCourses.length === 0) return false;
        const newSchedule = {
            id: Date.now(),
            name,
            courses: selectedCourses,
            thumbnail: thumbnail || '',
            date: new Date().toLocaleDateString()
        };
        const updated = [newSchedule, ...savedSchedules];
        setSavedSchedules(updated);
        localStorage.setItem('saved-schedules', JSON.stringify(updated));
        showToast(`Horario "${name}" guardado en favoritos`, 'success');
        return true;
    };

    // Eliminar Horario Guardado
    const deleteSavedSchedule = (id) => {
        const updated = savedSchedules.filter(s => s.id !== id);
        setSavedSchedules(updated);
        localStorage.setItem('saved-schedules', JSON.stringify(updated));
        showToast('Horario guardado eliminado', 'info');
    };

    // Cargar Horario Guardado
    const loadSavedSchedule = (savedItem) => {
        if (!savedItem || !savedItem.courses) return;
        saveHistory(selectedCourses);
        setSelectedCourses(savedItem.courses);
        rebuildColorMap(savedItem.courses);
        showToast(`Horario "${savedItem.name}" cargado`, 'success');
    };

    // 🔗 Compartir Horario via Enlace URL (Formato Vanilla 100% Compatible)
    const getShareableLink = async () => {
        if (selectedCourses.length === 0) return null;
        try {
            const compactItems = selectedCourses.map(sc => ({
                c: sc.curso ? sc.curso.codigo : sc.codigo,
                s: sc.seccion ? sc.seccion.id : sc.seccionId
            }));

            const payload = {
                f: 'ADM',
                items: compactItems
            };

            const jsonStr = JSON.stringify(payload);
            const encoded = btoa(encodeURIComponent(jsonStr));
            const shareUrl = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
            
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
            }

            showToast('¡Enlace de horario copiado al portapapeles!', 'success');
            return shareUrl;
        } catch (err) {
            console.error("Error al generar enlace compartido:", err);
            return null;
        }
    };

    const getColor = (courseCode) => {
        if (customColors[courseCode]) return customColors[courseCode];

        const palette = PALETTES[activePalette] || PALETTES['default'];
        const colors = isDarkMode ? palette.dark : palette.light;

        let index = courseColorIndexMap[courseCode];
        if (index === undefined) {
            index = colorIndex;
        }

        return colors[index % colors.length];
    };

    const setPalette = (paletteName) => {
        if (PALETTES[paletteName]) {
            setActivePalette(paletteName);
            localStorage.setItem('schedule-palette', paletteName);
            showToast(`Paleta ${paletteName} activada`, 'info');
        }
    };

    const setCustomColor = (courseCode, hexColor) => {
        const newColors = { ...customColors, [courseCode]: hexColor };
        setCustomColors(newColors);
        localStorage.setItem('custom-course-colors', JSON.stringify(newColors));
        showToast('Color personalizado guardado', 'info');
    };

    const getConflict = (newClass) => {
        const newRange = TimeUtils.parseTimeRange(newClass.hora);
        for (const selected of selectedCourses) {
            for (const existingClass of selected.seccion.clases) {
                if (existingClass.dia === newClass.dia) {
                    const existingRange = TimeUtils.parseTimeRange(existingClass.hora);
                    if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
                        return {
                            selectedCourse: selected,
                            conflictDetails: {
                                day: existingClass.dia,
                                time: existingClass.hora,
                                courseName: selected.curso.nombre
                            }
                        };
                    }
                }
            }
        }
        return null;
    };

    // Sugerencia Inteligente: Encuentra las secciones del mismo curso que NO se crucen con el horario actual
    const getNonConflictingSections = (course) => {
        if (!course || !course.secciones) return [];

        const otherCourses = selectedCourses.filter(sc => sc.curso.codigo !== course.codigo);

        return course.secciones.filter(sec => {
            for (const clase of sec.clases) {
                const newRange = TimeUtils.parseTimeRange(clase.hora);
                for (const selected of otherCourses) {
                    for (const existingClass of selected.seccion.clases) {
                        if (existingClass.dia === clase.dia) {
                            const existingRange = TimeUtils.parseTimeRange(existingClass.hora);
                            if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
                                return false; // Hay cruce
                            }
                        }
                    }
                }
            }
            return true; // No hay cruce
        });
    };

    const getCourseCredits = (course) => {
        if (!course) return 0;
        return parseFloat(course.creditos || 3);
    };

    const getTotalClassMinutes = useCallback(() => {
        let total = 0;
        selectedCourses.forEach(sc => {
            sc.seccion.clases.forEach(clase => {
                const range = TimeUtils.parseTimeRange(clase.hora);
                total += (range.end - range.start);
            });
        });
        return total;
    }, [selectedCourses]);

    const getFreeGapMinutes = useCallback(() => {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        let freeMinutes = 0;
        days.forEach(day => {
            const dayClasses = [];
            selectedCourses.forEach(sc => {
                sc.seccion.clases.forEach(clase => {
                    if (clase.dia === day) {
                        dayClasses.push(TimeUtils.parseTimeRange(clase.hora));
                    }
                });
            });
            dayClasses.sort((a, b) => a.start - b.start);
            for (let i = 0; i < dayClasses.length - 1; i++) {
                const gap = dayClasses[i + 1].start - dayClasses[i].end;
                if (gap > 0 && gap < 360) freeMinutes += gap;
            }
        });
        return freeMinutes;
    }, [selectedCourses]);

    const formatMinutesToHHMM = (totalMins) => {
        if (!totalMins || totalMins <= 0) return '0h';
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
        if (hours > 0) return `${hours}h`;
        return `${mins}m`;
    };

    return (
        <ScheduleContext.Provider value={{
            selectedCourses, addCourse, removeCourse, clearSchedule, undo, canUndo: historyStack.length > 0,
            searchQuery, setSearchQuery,
            getColor, setPalette, activePalette, setCustomColor,
            getConflict, getNonConflictingSections,
            previewCourse, setPreviewCourse,
            toast, showToast, closeToast: () => setToast(null),
            savedSchedules, saveSchedule, deleteSavedSchedule, loadSavedSchedule, getShareableLink,
            getCourseCredits, getTotalClassMinutes, getFreeGapMinutes, formatMinutesToHHMM,
            setSelectedCourses: (courses) => {
                saveHistory(selectedCourses);
                setSelectedCourses(courses);
                rebuildColorMap(courses);
            }
        }}>
            {children}
        </ScheduleContext.Provider>
    );
}

export const useSchedule = () => useContext(ScheduleContext);
