import { useState } from 'react';
import { X } from 'lucide-react';
import { updateCronTime } from '../api/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { getReadableCron } from '../utils/cronUtils';
import { extractErrorMessage } from '../utils/errorUtils';

/**
 * Modal for updating the cron schedule for student data sync.
 * @param {Function} onClose - Close modal handler
 * @param {string} currentCron - Current cron string
 * @param {Function} fetchStudents - Refresh students after update
 * @param {Function} refreshCronTime - Refresh cron time after update
 */

function onlyInt(val, min, max) {
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
            const msg = extractErrorMessage(err);
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
            setWeekday('1');
        }
    };

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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-blue-50 to-green-50/80 dark:from-slate-900 dark:to-slate-800/80 z-50">
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-blue-400 dark:text-cyan-200 hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-blue-600 dark:text-cyan-200 mb-6">Update Cron Time</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 font-medium text-blue-700 dark:text-cyan-200">Minute</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={minute}
                            onChange={handleMinute}
                            placeholder="0-59 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700 dark:text-cyan-200">Hour</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={hour}
                            onChange={handleHour}
                            placeholder="0-23 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700 dark:text-cyan-200">Day of Month</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={day}
                            onChange={handleDay}
                            placeholder="1-31 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700 dark:text-cyan-200">Month</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={month}
                            onChange={handleMonth}
                            placeholder="1-12 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700 dark:text-cyan-200">Day of Week</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9*]*"
                            className="w-full border border-blue-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            value={weekday}
                            onChange={handleWeekday}
                            placeholder="0-6 (Sun-Sat) or *"
                        />
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => applyPreset('daily')}
                        className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-slate-700 dark:to-green-900 hover:from-blue-200 hover:to-green-200 dark:hover:from-slate-600 dark:hover:to-green-800 text-blue-700 dark:text-cyan-200 px-3 py-1 rounded-lg transition cursor-pointer"
                    >
                        Every Day
                    </button>
                    <button
                        onClick={() => applyPreset('hourly')}
                        className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-slate-700 dark:to-green-900 hover:from-blue-200 hover:to-green-200 dark:hover:from-slate-600 dark:hover:to-green-800 text-blue-700 dark:text-cyan-200 px-3 py-1 rounded-lg transition cursor-pointer"
                    >
                        Every Hour
                    </button>
                    <button
                        onClick={() => applyPreset('weekly')}
                        className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-slate-700 dark:to-green-900 hover:from-blue-200 hover:to-green-200 dark:hover:from-slate-600 dark:hover:to-green-800 text-blue-700 dark:text-cyan-200 px-3 py-1 rounded-lg transition cursor-pointer"
                    >
                        Every Week
                    </button>
                </div>

                <div className="mb-4 text-sm text-blue-600 dark:text-cyan-200">
                    <strong>Schedule Preview:</strong>{' '}
                    <span className="font-semibold">
                        {getReadableCron(minute, hour, day, month, weekday)}
                    </span>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                    <button
                        onClick={handleUpdateCron}
                        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition cursor-pointer"
                    >
                        Update
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-400 dark:bg-slate-700 hover:bg-gray-500 dark:hover:bg-slate-600 text-white px-5 py-2 rounded-lg transition cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default CronSettingsModal;