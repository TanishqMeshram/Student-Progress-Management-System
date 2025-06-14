import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { fetchStudentProgress } from '../api/api';
import { motion } from 'framer-motion';

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
    }, [student]);

    const loadProgressData = async () => {
        try {
            setLoading(true);
            const progress = await fetchStudentProgress(student.cfHandle);
            setRatingData(progress.data.ratingHistory);
            setSubmissionData(progress.data.submissionHistory);
        } catch (error) {
            console.error('Error fetching student progress:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl"
        >
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl md:text-2xl mb-4">
                            {student.name}'s Codeforces Progress
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                        {/* Rating Graph */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Rating Progress</h2>
                            {ratingData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={ratingData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis hide={true} dataKey="contestName" />
                                        <YAxis domain={['auto', 'auto']} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>No rating data available.</p>
                            )}
                        </div>

                        {/* Submission Heatmap */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Submission Heatmap</h2>
                            {submissionData.length > 0 ? (
                                <>
                                    <CalendarHeatmap
                                        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                        endDate={new Date()}
                                        values={submissionData}
                                        classForValue={() => 'color-empty'}
                                        tooltipDataAttrs={value => ({ 'data-tip': `${value.date}: ${value.count} submissions` })}
                                        transformDayElement={(element, value) => {
                                            let fillColor = '#ebedf0';
                                            if (value && value.count >= 10) fillColor = '#005bb5';
                                            else if (value && value.count >= 5) fillColor = '#338fd4';
                                            else if (value && value.count >= 3) fillColor = '#66b3e1';
                                            else if (value && value.count >= 1) fillColor = '#cce4f6';

                                            return React.cloneElement(element, { style: { fill: fillColor } });
                                        }}
                                    />

                                    {/* Color Legend */}
                                    <div className="flex flex-wrap items-center space-x-4 mt-4">
                                        <div className="flex items-center space-x-1 mb-2">
                                            <div className="w-4 h-4 rounded bg-[#cce4f6]"></div>
                                            <span className="text-sm">1-2 submissions</span>
                                        </div>
                                        <div className="flex items-center space-x-1 mb-2">
                                            <div className="w-4 h-4 rounded bg-[#66b3e1]"></div>
                                            <span className="text-sm">3-4 submissions</span>
                                        </div>
                                        <div className="flex items-center space-x-1 mb-2">
                                            <div className="w-4 h-4 rounded bg-[#338fd4]"></div>
                                            <span className="text-sm">5-9 submissions</span>
                                        </div>
                                        <div className="flex items-center space-x-1 mb-2">
                                            <div className="w-4 h-4 rounded bg-[#005bb5]"></div>
                                            <span className="text-sm">10+ submissions</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p>No submission data available.</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default StudentProgressModal;
