import React, { useEffect, useState } from 'react';
import { getStudentProblemData } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

function ProblemSolvingStats({ id }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(30);

    useEffect(() => {
        fetchProblemData();
    }, [range]);

    const fetchProblemData = async () => {
        try {
            setLoading(true);
            const res = await getStudentProblemData(id, range);
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching problem solving stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRangeChange = (newRange) => {
        setRange(newRange);
    };

    if (loading) {
        return <div>Loading problem solving stats...</div>;
    }

    if (!stats) {
        return <div>Error loading problem solving stats.</div>;
    }

    return (
        <div className="p-4">
            {/* Header and Filter Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-bold mb-2 md:mb-0">Problem Solving Stats</h2>
                <div className="flex space-x-4">
                    {[7, 30, 90].map((r) => (
                        <button
                            key={r}
                            onClick={() => handleRangeChange(r)}
                            className={`px-4 py-2 rounded ${range === r ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                        >
                            Last {r} days
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-100 rounded">
                    <h3 className="font-semibold mb-1">Total Solved</h3>
                    <p>{stats.totalSolved}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded">
                    <h3 className="font-semibold mb-1">Average Rating</h3>
                    <p>{stats.averageRating}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded">
                    <h3 className="font-semibold mb-1">Average per Day</h3>
                    <p>{stats.averagePerDay}</p>
                </div>
                {stats.mostDifficultProblem ? (
                    <div className="p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold mb-1">Most Difficult Problem</h3>
                        <a href={stats.mostDifficultProblem.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {stats.mostDifficultProblem.name} (Rating: {stats.mostDifficultProblem.rating})
                        </a>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold mb-1">Most Difficult Problem</h3>
                        <p>No problems solved in this range</p>
                    </div>
                )}
            </div>

            {/* Bar Chart and Heatmap Side by Side */}
            <div className="flex flex-col lg:flex-row justify-between gap-8">
                {/* Bar Chart */}
                <div className="flex-1">
                    <h3 className="text-lg font-bold mb-4">Problems Solved per Rating Bucket</h3>
                    {Object.keys(stats.solvedPerRatingBucket).length === 0 ? (
                        <p>No data for bar chart in this range.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={Object.entries(stats.solvedPerRatingBucket).map(([rating, count]) => ({ rating, count }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rating" label={{ value: 'Rating', position: 'insideBottom', offset: -5 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Heatmap */}
                <div className="flex-1">
                    <h3 className="text-lg font-bold mb-4">Submission Heatmap</h3>
                    {stats.submissionHeatmap.length === 0 ? (
                        <p>No submissions in this range.</p>
                    ) : (
                        <div className="overflow-x-auto max-w-full">
                            <CalendarHeatmap
                                startDate={new Date(new Date().setDate(new Date().getDate() - range))}
                                endDate={new Date()}
                                values={stats.submissionHeatmap}
                                transformDayElement={(element, value) => {
                                            let fillColor = '#ebedf0';
                                            if (value && value.count >= 10) fillColor = '#005bb5';
                                            else if (value && value.count >= 5) fillColor = '#338fd4';
                                            else if (value && value.count >= 3) fillColor = '#66b3e1';
                                            else if (value && value.count >= 1) fillColor = '#cce4f6';

                                            return React.cloneElement(element, { style: { fill: fillColor } });
                                        }}
                                gutterSize={2}
                                tooltipDataAttrs={(value) => {
                                    if (!value || !value.date) return { 'data-tip': 'No submissions' };
                                    return { 'data-tip': `${value.date}: ${value.count} submissions` };
                                }}
                                showWeekdayLabels={true}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProblemSolvingStats;
