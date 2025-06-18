import React, { useEffect, useState } from 'react';
import { getStudents, addStudent, deleteStudent, updateStudent , getCronTime } from '../api/api';
import StudentForm from '../components/StudentForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import StudentProgressModal from '../components/StudentProgressModal';
import Papa from 'papaparse';
import { Plus, Download, Pencil, Trash2, Info } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toggleStudentReminder } from '../api/api';
import CronSettingsModal from '../components/CronSettingsModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to convert cron to readable text
function getReadableCron(minute, hour, day, month, weekday) {
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

function getRatingColor(rating) {
    if (rating >= 2600) return 'text-[#fe0000]';
    if (rating >= 2400) return 'text-[#ff0000]';
    if (rating >= 2100) return 'text-[#ff8c00]';
    if (rating >= 1900) return 'text-[#aa00aa]';
    if (rating >= 1600) return 'text-[#0000ff]';
    if (rating >= 1400) return 'text-[#03A89E]';
    if (rating >= 1200) return 'text-[#008000]';
    return 'text-gray-500';
}

function StudentTablePage() {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressStudent, setProgressStudent] = useState(null);
    const [showCronModal, setShowCronModal] = useState(false);
    const [cronTime, setCronTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudents();
        fetchCronTime();
    }, []);

    const fetchCronTime = async () => {
        try {
            const res = await getCronTime();
            setCronTime(res.data.cronTime);
        } catch (err) {
            console.error('Error fetching cron time:', err);
            toast.error('Failed to fetch cron time.');
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch cron time. Please try again later.';
            setError(msg);
            toast.error(msg);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await getStudents();
            setStudents(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching students:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch students. Please try again later.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (studentData) => {
        try {
            setLoading(true);
            const res = await addStudent(studentData);
            fetchStudents();
            setError(null);
            toast.success('Student added successfully!');
        } catch (err) {
            console.error('Error adding student:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to add student. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStudent = async (studentData) => {
        try {
            setLoading(true);
            const res = await updateStudent(selectedStudent._id, studentData);
            fetchStudents();
            setSelectedStudent(null);
            setError(null);
            toast.success('Student updated successfully!');
        } catch (err) {
            console.error('Error updating student:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update student. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        try {
            setLoading(true);
            const res = await deleteStudent(id);
            fetchStudents();
            setShowDeleteModal(false);
            setStudentToDelete(null);
            setError(null);
            toast.success('Student deleted successfully!');
        } catch (err) {
            console.error('Error deleting student:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to delete student. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const isInactive = (student) => {
        if (!student.solvedProblems || student.solvedProblems.length === 0) return true;

        const latestProblem = student.solvedProblems.reduce((latest, current) => {
            return new Date(current.solvedDate) > new Date(latest.solvedDate) ? current : latest;
        });

        const daysSinceSolved = (new Date() - new Date(latestProblem.solvedDate)) / (1000 * 60 * 60 * 24);

        return daysSinceSolved > 7;
    };

    const handleDownloadCSV = () => {
        const csvData = students.map(student => ({
            Name: student.name,
            Email: student.email,
            Phone: student.phone,
            'CF Handle': student.cfHandle,
            'Current Rating': student.currentRating,
            'Max Rating': student.maxRating,
            'Last Updated': new Date(student.lastUpdated).toLocaleString(),
            'Reminders Sent': student.remindersSent,
            'Auto Reminder Status': (student.autoReminderEnabled ? 'ENABLED' : 'DISABLED'),
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'students.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('CSV downloaded!');
    };

    const toggleReminder = async (id) => {
        try {
            await toggleStudentReminder(id);
            fetchStudents();
            toast.success('Reminder status updated!');
        } catch (err) {
            console.error('Error toggling reminder:', err);
            const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update reminder status. Please try again later.';
            setError(msg);
            toast.error(msg);
        }
    };

    // Helper to parse cronTime string
    const getCronPreview = (cronTime) => {
        if (!cronTime) return '';
        const [minute, hour, day, month, weekday] = cronTime.split(' ');

        // Helper for ordinal suffix
        const getDaySuffix = (d) => {
            const n = Number(d);
            if (n >= 11 && n <= 13) return 'th';
            switch (n % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Format time
        const formatTime = (h, m) => {
            const hourNum = Number(h);
            const minuteNum = Number(m);
            const ampm = hourNum >= 12 ? 'pm' : 'am';
            const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
            return `${hour12}:${minuteNum.toString().padStart(2, '0')} ${ampm}`;
        };

        // All wildcards: every minute
        if ([minute, hour, day, month, weekday].every(v => v === '*')) {
            return 'Every minute';
        }

        // Every hour at specific minute
        if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return `Every hour at minute ${minute}`;
        }

        // Every day at specific time
        if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
            return `Every day at ${formatTime(hour, minute)}`;
        }

        // Every month on specific day and time
        if (minute !== '*' && hour !== '*' && day !== '*' && month === '*' && weekday === '*') {
            return `Every month on the ${day}${getDaySuffix(day)} at ${formatTime(hour, minute)}`;
        }

        // Every year on specific date and time
        if (minute !== '*' && hour !== '*' && day !== '*' && month !== '*' && weekday === '*') {
            return `Every year on ${day}${getDaySuffix(day)} ${months[Number(month) - 1]} at ${formatTime(hour, minute)}`;
        }

        // Every week on specific weekday and time
        if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday !== '*') {
            const weekdayStr = weekday === '0' ? 'Sunday' : days[Number(weekday)];
            return `Every week on ${weekdayStr} at ${formatTime(hour, minute)}`;
        }

        // Every month on specific weekday and time
        if (minute !== '*' && hour !== '*' && day === '*' && month !== '*' && weekday !== '*') {
            const weekdayStr = weekday === '0' ? 'Sunday' : days[Number(weekday)];
            return `Every year on every ${weekdayStr} of ${months[Number(month) - 1]} at ${formatTime(hour, minute)}`;
        }

        // Every day of specific month at specific time
        if (minute !== '*' && hour !== '*' && day !== '*' && month !== '*' && weekday === '*') {
            return `Every year on ${day}${getDaySuffix(day)} ${months[Number(month) - 1]} at ${formatTime(hour, minute)}`;
        }

        // Every weekday at specific time
        if (minute !== '*' && hour !== '*' && day === '*' && month === '*' && weekday === '1-5') {
            return `Every weekday at ${formatTime(hour, minute)}`;
        }

        // If only weekday is set
        if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday !== '*') {
            const weekdayStr = weekday === '0' ? 'Sunday' : days[Number(weekday)];
            return `Every ${weekdayStr}`;
        }

        // If only month is set
        if (minute === '*' && hour === '*' && day === '*' && month !== '*' && weekday === '*') {
            return `Every day in ${months[Number(month) - 1]}`;
        }

        // If only day is set
        if (minute === '*' && hour === '*' && day !== '*' && month === '*' && weekday === '*') {
            return `Every month on the ${day}${getDaySuffix(day)}`;
        }

        // If only hour is set
        if (minute === '*' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
            return `Every day at hour ${hour}:00`;
        }

        // If only minute is set
        if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return `Every hour at minute ${minute}`;
        }

        // Fallback to raw cron
        return `Custom schedule: ${cronTime}`;
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8 flex flex-col items-center">
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        {loading && (
            <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        )}

        <div className="w-full max-w-10xl">
            <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-8 drop-shadow-lg tracking-tight">
                Student Progress Dashboard
            </h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 transition cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Add Student</span>
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 transition cursor-pointer"
                    >
                        <Download size={18} />
                        <span>Download CSV</span>
                    </button>
                    <button
                        onClick={() => setShowCronModal(true)}
                        className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 transition cursor-pointer"
                    >
                        <span>Cron Settings</span>
                    </button>
                </div>
                <div className="text-sm text-gray-700 mt-2 md:mt-0">
                    <span className="font-semibold">Current Sync Cron Time:</span>
                    <span className="ml-2 px-2 py-1 bg-gray-200 rounded text-blue-700 font-mono">
                        {cronTime ? getCronPreview(cronTime) : 'Loading...'}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <div className="min-w-full">
                    <table className="min-w-full text-sm md:text-base table-fixed">
                        <thead className="bg-blue-300 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 border-b font-semibold">Name</th>
                                <th className="py-3 px-4 border-b font-semibold">Email</th>
                                <th className="py-3 px-4 border-b font-semibold">Phone</th>
                                <th className="py-3 px-4 border-b font-semibold">CF Handle</th>
                                <th className="py-3 px-4 border-b font-semibold">Current Rating</th>
                                <th className="py-3 px-4 border-b font-semibold">Max Rating</th>
                                <th className="py-3 px-4 border-b font-semibold">Last Updated</th>
                                <th className="py-3 px-4 border-b font-semibold">Reminders Sent</th>
                                <th className="py-3 px-4 border-b font-semibold">Auto Reminder</th>
                                <th className="py-3 px-4 border-b font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr
                                    key={student._id}
                                    className={`transition-all duration-200 ${isInactive(student) ? 'hover:bg-red-100' : 'hover:bg-blue-100'} ${isInactive(student) ? 'bg-red-100' : ''} cursor-pointer hover:shadow-lg hover:-translate-y-1`}
                                    style={{
                                        transition: 'background 0.2s, box-shadow 0.2s, transform 0.18s',
                                        willChange: 'transform',
                                    }}
                                    onClick={() => window.open(`/student/${student._id}`, '_blank')}
                                >
                                    <td className="py-2 px-4 border-b truncate max-w-[180px]">{student.name}</td>
                                    <td className="py-2 px-4 border-b truncate max-w-[200px]">{student.email}</td>
                                    <td className="py-2 px-4 border-b truncate max-w-[120px]">{student.phone}</td>
                                    <td className="py-2 px-4 border-b">
                                        {/* <span className={
                                            `bg-blue-100 px-2 py-1 rounded font-mono truncate max-w-[120px] inline-block relative group ` +
                                            getRatingColor(student.currentRating)
                                        }>
                                            {student.cfHandle}
                                        </span> */}
                                        <span
                                            className={
                                                `bg-blue-100 px-2 py-1 rounded font-mono truncate max-w-[120px] inline-block relative group ` +
                                                getRatingColor(student.currentRating)
                                            }
                                            tabIndex={0}
                                        >
                                            {/* If rating >= 3000, first letter black, rest red; else normal */}
                                            {student.currentRating >= 3000 ? (
                                                <>
                                                    <span className="text-black">{student.cfHandle.charAt(0)}</span>
                                                    <span className="text-[#fe0000]">{student.cfHandle.slice(1)}</span>
                                                </>
                                            ) : (
                                                student.cfHandle
                                            )}
                                            {/* Tooltip on hover */}
                                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity duration-200 z-20
                                                bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                                {student.cfHandle}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="py-2 px-4 border-b">{student.currentRating}</td>
                                    <td className="py-2 px-4 border-b">{student.maxRating}</td>
                                    <td className="py-2 px-4 border-b truncate max-w-[160px]">{new Date(student.lastUpdated).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b">{student.remindersSent}</td>
                                    <td className="py-2 px-4 border-b" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => toggleReminder(student._id)}
                                            className={`px-3 py-1 rounded-full font-semibold shadow transition cursor-pointer ${
                                                student.autoReminderEnabled
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                            title={student.autoReminderEnabled ? 'Disable Auto Reminder' : 'Enable Auto Reminder'}
                                        >
                                            {student.autoReminderEnabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex gap-2 justify-center" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setSelectedStudent(student); setShowModal(true); }}
                                                className="p-2 rounded-full hover:bg-yellow-100 transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <Pencil size={18} className="text-yellow-500" />
                                            </button>
                                            <button
                                                onClick={() => { setStudentToDelete(student); setShowDeleteModal(true); }}
                                                className="p-2 rounded-full hover:bg-red-100 transition cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} className="text-red-500" />
                                            </button>
                                            <button
                                                onClick={() => { setProgressStudent(student); setShowProgressModal(true); setLoading(true); }}
                                                className="p-2 rounded-full hover:bg-blue-200 transition cursor-pointer"
                                                title="More Details"
                                            >
                                                <Info size={20} className="text-blue-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {showModal && (
            <StudentForm
                onClose={() => { setShowModal(false); setSelectedStudent(null); }}
                onSave={selectedStudent ? handleUpdateStudent : handleAddStudent}
                initialData={selectedStudent}
            />
        )}

        {showDeleteModal && (
            <DeleteConfirmModal
                student={studentToDelete}
                onClose={() => { setShowDeleteModal(false); setStudentToDelete(null); }}
                onConfirm={() => handleDeleteStudent(studentToDelete._id)}
            />
        )}

        {showProgressModal && (
            <StudentProgressModal
                student={progressStudent}
                onClose={() => { setShowProgressModal(false); setProgressStudent(null); }}
                setLoading={setLoading}
            />
        )}

        {showCronModal && (
            <CronSettingsModal
                onClose={() => setShowCronModal(false)}
                currentCron={cronTime}
                fetchStudents={fetchStudents}
                refreshCronTime={fetchCronTime}
            />
        )}
    </div>
);
}

export default StudentTablePage;
