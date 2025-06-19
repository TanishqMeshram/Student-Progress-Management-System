import { useEffect, useState } from 'react';
import { getStudents, addStudent, deleteStudent, updateStudent , getCronTime , toggleStudentReminder} from '../api/api';
import StudentForm from '../components/StudentForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import StudentProgressModal from '../components/StudentProgressModal';
import Papa from 'papaparse';
import { Plus, Download, Loader2 , Sun, Moon } from 'lucide-react';
import CronSettingsModal from '../components/CronSettingsModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentTable from '../components/StudentTable';
import { getReadableCron } from '../utils/cronUtils';
import { extractErrorMessage } from '../utils/errorUtils';
import { useTheme } from '../context/ThemeContext';

/**
 * StudentTablePage
 * Main page for listing, adding, editing, and deleting students.
 */
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
    const { theme, toggleTheme } = useTheme();

    // Fetch students and cron time on mount
    useEffect(() => {
        fetchStudents();
        fetchCronTime();
    }, []);

    // Fetch cron time
    const fetchCronTime = async () => {
        try {
            const res = await getCronTime();
            setCronTime(res.data.cronTime);
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        }
    };

    // Fetch all students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await getStudents();
            setStudents(res.data.data); // Use .data.data
            setError(null);
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Add a new student
    const handleAddStudent = async (studentData) => {
        try {
            setLoading(true);
            await addStudent(studentData);
            fetchStudents();
            setError(null);
            toast.success('Student added successfully!');
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Update an existing student
    const handleUpdateStudent = async (studentData) => {
        try {
            setLoading(true);
            await updateStudent(selectedStudent._id, studentData);
            fetchStudents();
            setSelectedStudent(null);
            setError(null);
            toast.success('Student updated successfully!');
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Delete a student
    const handleDeleteStudent = async (id) => {
        try {
            setLoading(true);
            await deleteStudent(id);
            fetchStudents();
            setShowDeleteModal(false);
            setStudentToDelete(null);
            setError(null);
            toast.success('Student deleted successfully!');
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
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

    // Toggle reminder for a student
    const toggleReminder = async (id) => {
        try {
            await toggleStudentReminder(id);
            fetchStudents();
            toast.success('Reminder status updated!');
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        }
    };

    // Get cron preview string
    const getCronPreview = (cronTime) => {
        if (!cronTime) return '';
        const [minute, hour, day, month, weekday] = cronTime.split(' ');
        return getReadableCron(minute, hour, day, month, weekday);
    };

    // Determine if a student is inactive (no problems solved in last 7 days)
    const isInactive = (student) => {
        if (!student.solvedProblems || student.solvedProblems.length === 0) return true;
        const latestProblem = student.solvedProblems.reduce((latest, current) =>
            new Date(current.solvedDate) > new Date(latest.solvedDate) ? current : latest
        );
        const daysSinceSolved = (new Date() - new Date(latestProblem.solvedDate)) / (1000 * 60 * 60 * 24);
        return daysSinceSolved > 7;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 flex flex-col items-center transition-colors duration-300">
            {/* Theme Toggle Button */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={toggleTheme}
                    className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-full p-2 shadow hover:shadow-lg transition-colors cursor-pointer"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun className="text-yellow-400" size={22} />
                    ) : (
                        <Moon className="text-blue-700" size={22} />
                    )}
                </button>
            </div>

            {/* Main Table and Actions */}
            <div className="w-full max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-blue-600 dark:text-cyan-200 mb-4 md:mb-0 drop-shadow-lg tracking-tight">
                        Student Progress Management
                    </h2>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={() => { setShowModal(true); setSelectedStudent(null); }}
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
                            <Loader2 size={18} />
                            <span>Cron Settings</span>
                        </button>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200 mt-2 md:mt-0">
                        <span className="font-semibold">Current Sync Cron Time:</span>
                        <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded text-blue-700 dark:text-cyan-200 font-mono">
                            {cronTime ? getCronPreview(cronTime) : 'Loading...'}
                        </span>
                    </div>
                </div>

                {/* Student Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 shadow-lg p-2 sm:p-4">
                    <StudentTable
                        students={students}
                        isInactive={isInactive}
                        toggleReminder={toggleReminder}
                        setSelectedStudent={setSelectedStudent}
                        setShowModal={setShowModal}
                        setStudentToDelete={setStudentToDelete}
                        setShowDeleteModal={setShowDeleteModal}
                        setProgressStudent={setProgressStudent}
                        setShowProgressModal={setShowProgressModal}
                        setLoading={setLoading}
                    />
                </div>
            </div>

            {/* Modals */}
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
