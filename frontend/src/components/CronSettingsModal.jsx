// components/CronSettingsModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updateCronTime } from '../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Helper to convert cron to readable text
function getReadableCron(minute, hour, day, month, weekday) {
    // If all fields are numbers (not '*'), show exact date and time
    const isNumber = (val) => !isNaN(val) && val !== '*';
    if (isNumber(minute) && isNumber(hour) && isNumber(day) && isNumber(month)) {
        // Weekday is optional for display
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10) - 1; // cron months are 1-based
        const hourNum = parseInt(hour, 10);
        const minuteNum = parseInt(minute, 10);

        // Format time
        const ampm = hourNum >= 12 ? 'pm' : 'am';
        const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
        const minuteStr = minuteNum.toString().padStart(2, '0');

        // Format day suffix
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

    // Fallbacks for common patterns
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

function onlyInt(val, min, max) {
    // Allow empty string for controlled input, otherwise restrict to integer in range
    if (val === '') return '';
    const num = Number(val);
    if (!Number.isInteger(num)) return '';
    if (typeof min === 'number' && num < min) return '';
    if (typeof max === 'number' && num > max) return '';
    return String(num);
}

function CronSettingsModal({ onClose, currentCron, fetchStudents, refreshCronTime }) {
    const [minute, setMinute] = useState(currentCron.split(' ')[0] || '0');
    const [hour, setHour] = useState(currentCron.split(' ')[1] || '0');
    const [day, setDay] = useState(currentCron.split(' ')[2] || '*');
    const [month, setMonth] = useState(currentCron.split(' ')[3] || '*');
    const [weekday, setWeekday] = useState(currentCron.split(' ')[4] || '*');

    const handleUpdateCron = async () => {
        const newCron = `${minute} ${hour} ${day} ${month} ${weekday}`;
        try {
            await updateCronTime(newCron);
            toast.success('Cron time updated successfully!');
            refreshCronTime();
            fetchStudents();
            setTimeout(() => {
                onClose();
            }, 100);
        } catch (err) {
            console.error('Error updating cron time:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update cron time. Please try again later.';
            setError(msg);
            toast.error(msg);
        }
    };

    const applyPreset = (preset) => {
        if (preset === 'daily') {
            setMinute('0');
            setHour('0');
            setDay('*');
            setMonth('*');
            setWeekday('*');
        } else if (preset === 'hourly') {
            setMinute('0');
            setHour('*');
            setDay('*');
            setMonth('*');
            setWeekday('*');
        } else if (preset === 'weekly') {
            setMinute('0');
            setHour('0');
            setDay('*');
            setMonth('*');
            setWeekday('1'); // Monday
        }
    };

    // Handlers to allow only integer input or '*'
    const handleMinute = (e) => {
        const val = e.target.value;
        setMinute(val === '*' ? '*' : onlyInt(val, 0, 59));
    };
    const handleHour = (e) => {
        const val = e.target.value;
        setHour(val === '*' ? '*' : onlyInt(val, 0, 23));
    };
    const handleDay = (e) => {
        const val = e.target.value;
        setDay(val === '*' ? '*' : onlyInt(val, 1, 31));
    };
    const handleMonth = (e) => {
        const val = e.target.value;
        setMonth(val === '*' ? '*' : onlyInt(val, 1, 12));
    };
    const handleWeekday = (e) => {
        const val = e.target.value;
        setWeekday(val === '*' ? '*' : onlyInt(val, 0, 6));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-blue-50 to-green-50/80 z-50">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white border border-blue-200 p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition cursor-pointer rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Update Cron Time</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Minute</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={minute}
                            onChange={handleMinute}
                            placeholder="0-59 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Hour</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={hour}
                            onChange={handleHour}
                            placeholder="0-23 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Day of Month</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={day}
                            onChange={handleDay}
                            placeholder="1-31 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Month</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={month}
                            onChange={handleMonth}
                            placeholder="1-12 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Day of Week</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={weekday}
                            onChange={handleWeekday}
                            placeholder="0-6 (Sun-Sat) or *"
                        />
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => applyPreset('daily')}
                        className="bg-gradient-to-r from-blue-100 to-green-100 hover:from-blue-200 hover:to-green-200 text-blue-700 px-3 py-1 rounded-lg transition"
                    >
                        Every Day
                    </button>
                    <button
                        onClick={() => applyPreset('hourly')}
                        className="bg-gradient-to-r from-blue-100 to-green-100 hover:from-blue-200 hover:to-green-200 text-blue-700 px-3 py-1 rounded-lg transition"
                    >
                        Every Hour
                    </button>
                    <button
                        onClick={() => applyPreset('weekly')}
                        className="bg-gradient-to-r from-blue-100 to-green-100 hover:from-blue-200 hover:to-green-200 text-blue-700 px-3 py-1 rounded-lg transition"
                    >
                        Every Week
                    </button>
                </div>

                <div className="mb-4 text-sm text-blue-600">
                    <strong>Schedule Preview:</strong>{' '}
                    <span className="font-semibold">
                        {getReadableCron(minute, hour, day, month, weekday)}
                    </span>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                    <button
                        onClick={handleUpdateCron}
                        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                    >
                        Update
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default CronSettingsModal;
