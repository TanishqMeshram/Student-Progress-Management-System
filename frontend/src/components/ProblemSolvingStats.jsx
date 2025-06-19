import React, { useEffect, useState } from 'react';
import { getStudentProblemData } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomHeatmap from './CustomHeatMap';
import 'react-calendar-heatmap/dist/styles.css';
import { extractErrorMessage } from '../utils/errorUtils';
import { toast } from 'react-toastify';

/**
 * Displays problem-solving statistics for a student, including summary, rating distribution, and activity heatmap.
 * @param {string} id - Student MongoDB ObjectId
 */
function ProblemSolvingStats({ id }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(30);
    const [activeSection, setActiveSection] = useState('summary');

    useEffect(() => {
        fetchProblemData();
        // eslint-disable-next-line
    }, [range]);

    /**
     * Fetches problem-solving stats from the backend.
     */
    const fetchProblemData = async () => {
        try {
            setLoading(true);
            const res = await getStudentProblemData(id, range);
            setStats(res.data.data);
        } catch (err) {
            const msg = extractErrorMessage(err);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRangeChange = (newRange) => {
        setRange(newRange);
    };

    // Tooltip for the bar chart
    const CustomBarChartTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-blue-500/30 shadow-lg">
                    <p className="text-blue-300 dark:text-cyan-200 font-medium">Rating: {label}</p>
                    <p className="text-white font-bold">{payload[0].value} Problems Solved</p>
                </div>
            );
        }
        return null;
    };

    // Returns a style object for a heatmap cell based on submission count and theme.
    const getHeatmapColorStyle = (count) => {
        const isDark = document.documentElement.classList.contains('dark');
        if (!count) return { backgroundColor: isDark ? '#1e293b' : '#e5e7eb' };
        if (count >= 10) return { backgroundColor: isDark ? '#2563eb' : '#1e40af' };
        if (count >= 5) return { backgroundColor: isDark ? '#3b82f6' : '#2563eb' };
        if (count >= 3) return { backgroundColor: isDark ? '#60a5fa' : '#3b82f6' };
        return { backgroundColor: isDark ? '#bae6fd' : '#60a5fa' };
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-slide-up-fade-in flex space-x-1">
                    <div className="w-3 h-8 bg-blue-400 rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-8 bg-blue-500 rounded-full animate-wave" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-3 h-8 bg-blue-600 rounded-full animate-wave" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-3 h-8 bg-blue-700 rounded-full animate-wave" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-3 h-8 bg-blue-600 rounded-full animate-wave" style={{ animationDelay: '400ms' }}></div>
                    <div className="w-3 h-8 bg-blue-500 rounded-full animate-wave" style={{ animationDelay: '500ms' }}></div>
                    <div className="w-3 h-8 bg-blue-400 rounded-full animate-wave" style={{ animationDelay: '600ms' }}></div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-6 text-center">
                <div className="p-6 bg-slate-800/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-red-500/30">
                    <svg className="mx-auto h-12 w-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h3>
                    <p className="text-slate-300 dark:text-slate-200">Could not load problem solving statistics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-7xl">
                {/* Header and Filter Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-center text-blue-600 dark:text-cyan-200 mb-4 md:mb-0 drop-shadow-lg tracking-tight">
                        Problem Solving Stats
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        {[7, 30, 90].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                className={`group relative px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer 
                                    ${range === r 
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                                        : 'bg-slate-700/50 dark:bg-slate-800/80 backdrop-blur-sm text-gray-300 hover:bg-slate-700/80 dark:hover:bg-slate-900/80'}`}
                            >
                                <span className="relative z-10">Last {r} days</span>
                                {range === r && (
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg 
                                        animate-pulse opacity-50 blur-sm"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-6 border-b border-slate-300/50 overflow-x-auto scrollbar-thin">
                    <button 
                        onClick={() => setActiveSection('summary')}
                        className={`px-6 py-3 font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${activeSection === 'summary' 
                            ? 'text-blue-500 border-b-2 border-blue-500' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Summary
                    </button>
                    <button 
                        onClick={() => setActiveSection('distribution')}
                        className={`px-6 py-3 font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${activeSection === 'distribution' 
                            ? 'text-blue-500 border-b-2 border-blue-500' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Rating Distribution
                    </button>
                    <button 
                        onClick={() => setActiveSection('heatmap')}
                        className={`px-6 py-3 font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${activeSection === 'heatmap' 
                            ? 'text-blue-500 border-b-2 border-blue-500' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Activity
                    </button>
                </div>

                {/* Summary Stats */}
                {activeSection === 'summary' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 shadow-lg hover:shadow-blue-200 dark:hover:shadow-cyan-900 transition-all duration-300 transform hover:-translate-y-1 p-6">
                                <div className="flex items-center mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-slate-700 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-blue-400 dark:text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-blue-700 dark:text-cyan-200 font-medium">Total Solved</h3>
                                </div>
                                <div className="text-3xl font-bold text-blue-700 dark:text-cyan-200">{stats.totalSolved}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 shadow-lg hover:shadow-blue-200 dark:hover:shadow-cyan-900 transition-all duration-300 transform hover:-translate-y-1 p-6">
                                <div className="flex items-center mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-slate-700 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-blue-400 dark:text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-blue-700 dark:text-cyan-200 font-medium">Average Rating</h3>
                                </div>
                                <div className="text-3xl font-bold text-blue-700 dark:text-cyan-200">{stats.averageRating}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 shadow-lg hover:shadow-blue-200 dark:hover:shadow-cyan-900 transition-all duration-300 transform hover:-translate-y-1 p-6">
                                <div className="flex items-center mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-slate-700 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-blue-400 dark:text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-blue-700 dark:text-cyan-200 font-medium">Average per Day</h3>
                                </div>
                                <div className="text-3xl font-bold text-blue-700 dark:text-cyan-200">{stats.averagePerDay}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 shadow-lg hover:shadow-blue-200 dark:hover:shadow-cyan-900 transition-all duration-300 transform hover:-translate-y-1 p-6">
                                <div className="flex items-center mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-slate-700 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-blue-400 dark:text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-blue-700 dark:text-cyan-200 font-medium">Most Difficult Problem</h3>
                                </div>
                                {stats.mostDifficultProblem ? (
                                    <a 
                                        href={stats.mostDifficultProblem.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-lg font-medium text-blue-500 dark:text-cyan-200 hover:text-blue-400 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        {stats.mostDifficultProblem.name}
                                        <div className="text-sm text-blue-400 dark:text-cyan-200">Rating: {stats.mostDifficultProblem.rating}</div>
                                    </a>
                                ) : (
                                    <div className="text-lg text-blue-300 dark:text-cyan-200">No problems solved</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Distribution Chart */}
                {activeSection === 'distribution' && (
                    <div className="animate-fade-in">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-5 shadow">
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-cyan-200 mb-4">Problems Solved per Rating Bucket</h3>
                            {Object.keys(stats.solvedPerRatingBucket).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <svg className="h-16 w-16 text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-blue-400 dark:text-cyan-200">No data available for chart.</p>
                                </div>
                            ) : (
                                <div className="transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart
                                            data={Object.entries(stats.solvedPerRatingBucket).map(([rating, count]) => ({ 
                                                rating: rating === '0' ? 'Non Rated' : rating, 
                                                count 
                                            }))}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                        >
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" opacity={0.5} />
                                            <XAxis 
                                                dataKey="rating" 
                                                tick={{fill: "#60a5fa"}} 
                                                label={{ 
                                                    value: 'Problem Rating', 
                                                    position: 'insideBottom', 
                                                    offset: -10, 
                                                    fill: '#60a5fa' 
                                                }} 
                                            />
                                            <YAxis 
                                                allowDecimals={false} 
                                                tick={{fill: "#60a5fa"}}
                                                label={{ 
                                                    value: 'Problems Solved', 
                                                    angle: -90, 
                                                    position: 'insideLeft',
                                                    fill: '#60a5fa' 
                                                }} 
                                            />
                                            <Tooltip content={<CustomBarChartTooltip />} />
                                            <Bar 
                                                dataKey="count" 
                                                fill="url(#barGradient)"
                                                radius={[4, 4, 0, 0]}
                                                animationDuration={1500}
                                                animationEasing="ease-in-out"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Heatmap Activity */}
                {activeSection === 'heatmap' && (
                    <div className="animate-fade-in">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 p-5 shadow">
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-cyan-200 mb-4">Submission Activity</h3>
                            {stats.submissionHeatmap.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <svg className="h-16 w-16 text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-blue-400 dark:text-cyan-200">No submission activity in this period.</p>
                                </div>
                            ) : (
                                <div className="heatmap-wrapper flex flex-col items-center">
                                    <div className="p-3 w-full max-w-10xl overflow-x-auto">
                                        <CustomHeatmap
                                            data={stats.submissionHeatmap}
                                            startDate={new Date(new Date().setDate(new Date().getDate() - range))}
                                            endDate={new Date()}
                                            onCellClick={(day) => { /* handle click or show modal */ }}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end mt-4 w-full max-w-2xl">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-blue-400 dark:text-cyan-200">Less</span>
                                            {[0, 1, 3, 5, 10].map((level) => (
                                                <div
                                                    key={level}
                                                    className="w-3 h-3 rounded-sm"
                                                    style={getHeatmapColorStyle(level)}
                                                />
                                            ))}
                                            <span className="text-xs text-blue-400 dark:text-cyan-200">More</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProblemSolvingStats;