import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContestHistory from '../components/ContestHistory';
import ProblemSolvingStats from '../components/ProblemSolvingStats';
import { getStudentById } from '../api/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { extractErrorMessage } from '../utils/errorUtils';

/**
 * StudentProfilePage
 * Displays a student's profile, contest history, and problem-solving stats.
 */
function StudentProfilePage() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch student data on mount
    useEffect(() => {
        async function fetchStudent() {
            try {
                const res = await getStudentById(id);
                setStudent(res.data.data);
            } catch (err) {
                const msg = extractErrorMessage(err);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        }
        fetchStudent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-24 w-24 mb-4 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500 animate-spin"></div>
                    <div className="text-xl text-cyan-300 font-medium">Loading profile data...</div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div>
                <div className="text-center mt-10 p-6 bg-red-900/30 dark:bg-red-950/60 backdrop-blur-md rounded-xl border border-red-500/50 shadow-lg animate-fade-in">
                    <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-red-400">Student Not Found</h2>
                    <p className="mt-2 text-red-300">The student profile you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-900 dark:to-blue-900 transform -skew-y-1 rounded-2xl opacity-80 blur-sm"></div>
                <div className="relative p-8 text-center">
                    {/* Name and Icon */}
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4 mb-2 animate-fade-in">
                        <span className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-700 dark:to-blue-800 rounded-full p-2 shadow-lg shadow-blue-500/30">
                            <div className="bg-slate-900 rounded-full p-2 flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform transform hover:scale-110">
                                {/* Profile Icon */}
                                <svg className="h-10 w-10 text-cyan-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </span>
                        <h1
                            className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 dark:from-cyan-100 dark:to-cyan-400 drop-shadow-lg transition-all duration-700"
                            style={{ letterSpacing: '0.02em' }}
                        >
                            {student.name}
                        </h1>
                        {/* Optional: Add a badge */}
                        {student.rank && (
                            <span className="ml-2 px-3 py-1 rounded-full bg-blue-900/70 text-cyan-200 text-xs font-semibold shadow">
                                {student.rank}
                            </span>
                        )}
                    </div>
                    {student.rating && (
                        <div className="text-lg sm:text-xl text-blue-200 dark:text-cyan-200 font-medium mt-1">Rating: {student.rating}</div>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                <div className="group">
                    <div className="backdrop-blur-lg bg-slate-800/50 dark:bg-slate-900/60 rounded-2xl border border-cyan-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-cyan-500/20">
                        <ContestHistory id={id} />
                    </div>
                </div>
                
                <div className="group">
                    <div className="backdrop-blur-lg bg-slate-800/50 dark:bg-slate-900/60 rounded-2xl border border-blue-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-blue-500/20">
                        <ProblemSolvingStats id={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;