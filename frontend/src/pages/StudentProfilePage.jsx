import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContestHistory from '../components/ContestHistory';
import ProblemSolvingStats from '../components/ProblemSolvingStats';
import { getStudentById } from '../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StudentProfilePage() {
    const { id } = useParams(); // Get the student ID from URL
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudent() {
            try {
                const res = await getStudentById(id);
                setStudent(res.data);
            } catch (err) {
                console.error('Error fetching student', err);
                const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch student profile. Please try again later.';
                setError(msg);
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
                <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
                <div className="text-center mt-10 p-6 bg-red-900/30 backdrop-blur-md rounded-xl border border-red-500/50 shadow-lg animate-fade-in">
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
        <div className="animate-fade-in-up">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transform -skew-y-1 rounded-2xl opacity-80 blur-sm"></div>
                <div className="relative p-8 text-center">
                    <div className="inline-block p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 shadow-lg shadow-blue-500/30">
                        <div className="bg-slate-900 rounded-full p-3">
                            <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">{student.name}</h1>
                    {student.rank && (
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-900/50 text-cyan-300 text-sm font-semibold mb-2">
                            {student.rank}
                        </div>
                    )}
                    {student.rating && (
                        <div className="text-xl text-blue-300 font-medium">Rating: {student.rating}</div>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                <div className="group">
                    <div className="backdrop-blur-lg bg-slate-800/50 rounded-2xl border border-cyan-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-cyan-500/20">
                        <ContestHistory id={id} />
                    </div>
                </div>
                
                <div className="group">
                    <div className="backdrop-blur-lg bg-slate-800/50 rounded-2xl border border-blue-500/30 overflow-hidden transition-all duration-500 shadow-lg hover:shadow-blue-500/20">
                        <ProblemSolvingStats id={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;
