import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { fetchStudentProgress } from '../api/api';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { extractErrorMessage } from '../utils/errorUtils';

/**
 * Modal to display a student's Codeforces rating and submission progress.
 * @param {Object} student - Student object
 * @param {Function} onClose - Close modal handler
 * @param {Function} setLoading - Set loading state
 */
function StudentProgressModal({ student, onClose, setLoading }) {
    const [ratingData, setRatingData] = useState([]);
    const [submissionData, setSubmissionData] = useState([]);

    useEffect(() => {
        if (student) {
            loadProgressData();
        }
        return () => {
            setLoading(false);
        };
        // eslint-disable-next-line
    }, [student]);

    /**
     * Loads rating and submission history for the student.
     */
    const loadProgressData = async () => {
        try {
            setLoading(true);
            const progress = await fetchStudentProgress(student.cfHandle);
            setRatingData(progress.data.data.ratingHistory);
            setSubmissionData(progress.data.data.submissionHistory);
        } catch (err) {
            const msg = extractErrorMessage(err);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Returns a color for the heatmap cell based on submission count and theme.
    const isDark = document.documentElement.classList.contains('dark');
    const getHeatmapColor = (count) => {
        if (!count) return isDark ? "#1e293b" : "#ebedf0";
        if (count >= 10) return isDark ? "#2563eb" : "#005bb5";
        if (count >= 5) return isDark ? "#3b82f6" : "#338fd4";
        if (count >= 3) return isDark ? "#60a5fa" : "#66b3e1";
        return isDark ? "#bae6fd" : "#cce4f6";
    };

    return (
        <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="w-full max-w-4xl"
        >
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-800 border border-blue-200 dark:border-slate-700 shadow-2xl rounded-2xl p-2 sm:p-4 md:p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-blue-400 dark:text-cyan-200 hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        aria-label="Close"
                    >
                        <X size={28} />
                    </button>
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl md:text-3xl text-blue-600 dark:text-cyan-200 font-extrabold mb-4 drop-shadow-lg text-center">
                            {student.name}&apos;s Codeforces Progress
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                        {/* Rating Graph */}
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-blue-700 dark:text-cyan-200 mb-2 text-center sm:text-left">Rating Progress</h2>
                            {ratingData.length > 0 ? (
                                <div className="w-full h-[220px] sm:h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={ratingData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" opacity={0.5} />
                                            <XAxis hide={true} dataKey="contestName" />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-blue-400 dark:text-cyan-200 bg-blue-50 dark:bg-slate-800 rounded p-4 text-center">No rating data available.</div>
                            )}
                        </div>

                        {/* Submission Heatmap */}
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-blue-700 dark:text-cyan-200 mb-2 text-center sm:text-left">Submission Heatmap</h2>
                            {submissionData.length > 0 ? (
                                <>
                                    <div className="w-full overflow-x-auto flex justify-center">
                                        <div className="min-w-[320px] max-w-full sm:max-w-[500px] md:max-w-[700px]">
                                            <CalendarHeatmap
                                                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                                endDate={new Date()}
                                                values={submissionData}
                                                classForValue={v => ''}
                                                tooltipDataAttrs={value => ({ 'data-tip': `${value.date}: ${value.count} submissions` })}
                                                transformDayElement={(element, value) => {
                                                    let fillColor = getHeatmapColor(value && value.count);
                                                    return React.cloneElement(element, { style: { fill: fillColor } });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {/* Color Legend */}
                                    <div className="flex flex-wrap items-center gap-4 mt-4 justify-center">
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-[#cce4f6] dark:bg-[#bae6fd] border border-blue-200 dark:border-slate-700"></div>
                                            <span className="text-xs text-blue-500 dark:text-cyan-200">1-2</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-[#66b3e1] dark:bg-[#60a5fa] border border-blue-200 dark:border-slate-700"></div>
                                            <span className="text-xs text-blue-500 dark:text-cyan-200">3-4</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-[#338fd4] dark:bg-[#3b82f6] border border-blue-200 dark:border-slate-700"></div>
                                            <span className="text-xs text-blue-500 dark:text-cyan-200">5-9</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-[#005bb5] dark:bg-[#2563eb] border border-blue-200 dark:border-slate-700"></div>
                                            <span className="text-xs text-blue-500 dark:text-cyan-200">10+</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-blue-400 dark:text-cyan-200 bg-blue-50 dark:bg-slate-800 rounded p-4 text-center">No submission data available.</div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default StudentProgressModal;
