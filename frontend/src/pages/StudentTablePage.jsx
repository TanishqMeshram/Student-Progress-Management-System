import React, { useEffect, useState } from 'react';
import { getStudents, addStudent, deleteStudent, updateStudent } from '../api/api';
import StudentForm from '../components/StudentForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import StudentProgressModal from '../components/StudentProgressModal';
import Papa from 'papaparse';
import { Plus, Download, Pencil, Trash2, Info } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toggleStudentReminder } from '../api/api';

function StudentTablePage() {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressStudent, setProgressStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await getStudents();
            setStudents(res.data);
            setError(null); // clear previous errors
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to fetch students. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (studentData) => {
        try {
            setLoading(true);
            await addStudent(studentData);
            fetchStudents();
            setError(null);
        } catch (err) {
            console.error('Error adding student:', err);
            setError('Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStudent = async (studentData) => {
        try {
            setLoading(true);
            await updateStudent(selectedStudent._id, studentData);
            fetchStudents();
            setSelectedStudent(null);
            setError(null);
        } catch (err) {
            console.error('Error updating student:', err);
            setError('Failed to update student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        try {
            setLoading(true);
            await deleteStudent(id);
            fetchStudents();
            setShowDeleteModal(false);
            setStudentToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Error deleting student:', err);
            setError('Failed to delete student. Please try again.');
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
    };

    const toggleReminder = async (id) => {
        try {
            await toggleStudentReminder(id);
            fetchStudents(); // Refresh data
        } catch (err) {
            console.error('Error toggling reminder:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-500 mb-6">Student Table</h1>

            <div className="flex flex-col md:flex-row justify-end items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
                <button onClick={() => setShowModal(true)} className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Add Student</span>
                </button>
                <button onClick={handleDownloadCSV} className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto flex items-center space-x-2">
                    <Download size={16} />
                    <span>Download CSV</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-sm md:text-base">
                            <th className="py-3 px-2 md:px-4 border">Name</th>
                            <th className="py-3 px-2 md:px-4 border">Email</th>
                            <th className="py-3 px-2 md:px-4 border">Phone</th>
                            <th className="py-3 px-2 md:px-4 border">CF Handle</th>
                            <th className="py-3 px-2 md:px-4 border">Current Rating</th>
                            <th className="py-3 px-2 md:px-4 border">Max Rating</th>
                            <th className="py-3 px-2 md:px-4 border">Last Updated</th>
                            <th className="py-3 px-2 md:px-4 border">Reminders Sent</th>
                            <th className="py-3 px-2 md:px-4 border">Auto Reminder</th>
                            <th className="py-3 px-2 md:px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student._id} className={`hover:bg-gray-100 text-sm md:text-base ${isInactive(student) ? 'bg-red-100' : ''}`}
                                onClick={() => window.open(`/student/${student._id}`, '_blank')}
                                >
                                <td className="py-2 px-2 md:px-4 border">{student.name}</td>
                                <td className="py-2 px-2 md:px-4 border">{student.email}</td>
                                <td className="py-2 px-2 md:px-4 border">{student.phone}</td>
                                <td className="py-2 px-2 md:px-4 border">{student.cfHandle}</td>
                                <td className="py-2 px-2 md:px-4 border">{student.currentRating}</td>
                                <td className="py-2 px-2 md:px-4 border">{student.maxRating}</td>
                                <td className="py-2 px-2 md:px-4 border">{new Date(student.lastUpdated).toLocaleString()}</td>
                                <td className="py-2 px-2 md:px-4 border">{student.remindersSent}</td>
                                <td className="py-2 px-2 md:px-4 border" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => toggleReminder(student._id)}
                                        className={`px-2 py-1 rounded ${student.autoReminderEnabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                                    >
                                        {student.autoReminderEnabled ? 'Enabled' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="py-2 px-2 md:px-4 border flex space-x-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => { setSelectedStudent(student); setShowModal(true); }}
                                        className=" text-yellow-500 p-2 rounded flex items-center justify-center"
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setStudentToDelete(student); setShowDeleteModal(true); }}
                                        className=" text-red-500 p-2 rounded flex items-center justify-center"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setProgressStudent(student); setShowProgressModal(true); setLoading(true); }}
                                        className=" text-blue-500 p-2 rounded flex items-center justify-center"
                                        title="More Details"
                                    >
                                        <Info size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        </div>
    );
}

export default StudentTablePage;
