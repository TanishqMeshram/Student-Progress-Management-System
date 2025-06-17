// components/CronSettingsModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updateCronTime } from '../api/api';

function CronSettingsModal({ onClose, currentCron, fetchStudents, refreshCronTime }) {
    const [minute, setMinute] = useState(currentCron.split(' ')[0] || '0');
    const [hour, setHour] = useState(currentCron.split(' ')[1] || '0');
    const [day, setDay] = useState(currentCron.split(' ')[2] || '*');
    const [month, setMonth] = useState(currentCron.split(' ')[3] || '*');
    const [weekday, setWeekday] = useState(currentCron.split(' ')[4] || '*');
    const [message, setMessage] = useState('');

    const handleUpdateCron = async () => {
        const newCron = `${minute} ${hour} ${day} ${month} ${weekday}`;
        try {
            await updateCronTime(newCron);
            setMessage('Cron time updated successfully.');
            alert('Cron time updated successfully!');
            refreshCronTime();
            fetchStudents();
        } catch (err) {
            console.error('Error updating cron time:', err);
            setMessage('Failed to update cron time.');
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Update Cron Time</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 font-medium">Minute</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            placeholder="0-59 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Hour</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            placeholder="0-23 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Day of Month</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            placeholder="1-31 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Month</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            placeholder="1-12 or *"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Day of Week</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={weekday}
                            onChange={(e) => setWeekday(e.target.value)}
                            placeholder="0-6 (Sun-Sat) or *"
                        />
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    <button onClick={() => applyPreset('daily')} className="bg-gray-200 px-2 py-1 rounded">Every Day</button>
                    <button onClick={() => applyPreset('hourly')} className="bg-gray-200 px-2 py-1 rounded">Every Hour</button>
                    <button onClick={() => applyPreset('weekly')} className="bg-gray-200 px-2 py-1 rounded">Every Week</button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                    <strong>Current Cron Preview:</strong> {`${minute} ${hour} ${day} ${month} ${weekday}`}
                </div>

                {message && <div className="mb-4 text-blue-500">{message}</div>}

                <div className="flex justify-end space-x-4">
                    <button onClick={handleUpdateCron} className="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
                    <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default CronSettingsModal;
