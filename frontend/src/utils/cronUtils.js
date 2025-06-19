/**
 * Converts a cron expression into a human-readable string.
 * @param {string} minute
 * @param {string} hour
 * @param {string} day
 * @param {string} month
 * @param {string} weekday
 * @returns {string} - Human-readable schedule
 */
export function getReadableCron(minute, hour, day, month, weekday) {
    const isNumber = (val) => !isNaN(val) && val !== '*';
    if (isNumber(minute) && isNumber(hour) && isNumber(day) && isNumber(month)) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10) - 1;
        const hourNum = parseInt(hour, 10);
        const minuteNum = parseInt(minute, 10);

        const ampm = hourNum >= 12 ? 'pm' : 'am';
        const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
        const minuteStr = minuteNum.toString().padStart(2, '0');

        const getDaySuffix = (d) => {
            if (d >= 11 && d <= 13) return 'th';
            switch (d % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `Day: ${dayNum}${getDaySuffix(dayNum)} ${months[monthNum]}, Time: ${hour12}:${minuteStr} ${ampm}`;
    }

    if (minute === '0' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
        return 'Every hour';
    }
    if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
        return `Every day at ${hour.padStart(2, '0')}:00`;
    }
    if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[parseInt(weekday, 10)] || `Day ${weekday}`;
        return `Every ${dayName} at ${hour.padStart(2, '0')}:00`;
    }
    if (minute === '0' && hour !== '*' && day !== '*' && month === '*' && weekday === '*') {
        return `Every month on day ${day} at ${hour.padStart(2, '0')}:00`;
    }
    return 'Custom schedule';
}