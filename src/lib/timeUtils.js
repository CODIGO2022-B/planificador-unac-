export const TimeUtils = {
    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    },

    parseTimeRange(horaStr) {
        if (!horaStr) return { start: 0, end: 0 };
        const [startStr, endStr] = horaStr.split(' a ');
        return {
            start: this.timeToMinutes(startStr.trim()),
            end: this.timeToMinutes(endStr.trim().replace('.', '')),
        };
    }
};
