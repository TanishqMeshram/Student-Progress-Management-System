import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentContestData } from '../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ContestHistory({ id }) {
    const [contests, setContests] = useState([]);
    const [range, setRange] = useState(90);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('graph');

    useEffect(() => {
        fetchContestHistory();
        // eslint-disable-next-line
    }, [range]);

    const fetchContestHistory = async () => {
        try {
            setLoading(true);
            const res = await getStudentContestData(id, range || 90);
            setContests(res.data.contests);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contest history:', error);
            toast.error('Failed to fetch contest history.');
            setLoading(false);
        }
    };

    const handleRangeChange = (newRange) => {
        setRange(newRange);
    };

    const formatChartData = () => {
        return contests.map((contest, index) => ({
            name: contest.contestName,
            newRating: contest.newRating,
            contestDate: new Date(contest.contestDate).toLocaleDateString(),
        }));
    };

    // Function to determine rating color based on rating value
    const getRatingColor = (rating) => {
        if (rating >= 2600) return 'text-[#fe0000]';
        if (rating >= 2400) return 'text-[#ff0000]';
        if (rating >= 2100) return 'text-[#ff8c00]';
        if (rating >= 1900) return 'text-[#aa00aa]';
        if (rating >= 1600) return 'text-[#0000ff]';
        if (rating >= 1400) return 'text-[#03A89E]';
        if (rating >= 1200) return 'text-[#008000]';
        return 'text-gray-500';
    };

    // Function to get rating change color and symbol
    const getRatingChangeColor = (change) => {
        if (change > 0) return 'text-green-400';
        if (change < 0) return 'text-red-400';
        return 'text-gray-400';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/30 shadow-lg">
                    <p className="text-cyan-300 font-medium">{label}</p>
                    <p className="text-white font-bold">Rating: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-2 sm:p-4 md:p-8 flex flex-col items-center">
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <div className="w-full max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-blue-600 mb-4 md:mb-0 drop-shadow-lg tracking-tight">
                        Contest History
                    </h2>
                    {/* Filter Buttons */}
                    <div className="flex gap-2 flex-wrap justify-center">
                        {[30, 90, 365].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                className={`group relative px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer
                                    ${range === r 
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                                        : 'bg-slate-700/50 backdrop-blur-sm text-gray-300 hover:bg-slate-700/80'}`}
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

                {/* Tab Selector */}
                <div className="flex mb-6 border-b border-slate-300/50 flex-wrap">
                    <button 
                        onClick={() => setActiveTab('graph')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 cursor-pointer ${activeTab === 'graph' 
                            ? 'text-blue-500 border-b-2 border-blue-500' 
                            : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Rating Graph
                    </button>
                    <button 
                        onClick={() => setActiveTab('table')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 cursor-pointer ${activeTab === 'table' 
                            ? 'text-blue-500 border-b-2 border-blue-500' 
                            : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Contest Details
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-ping h-4 w-4 mr-2 rounded-full bg-blue-400"></div>
                        <div className="animate-ping h-4 w-4 mr-2 rounded-full bg-blue-400" style={{animationDelay: '0.2s'}}></div>
                        <div className="animate-ping h-4 w-4 rounded-full bg-blue-400" style={{animationDelay: '0.4s'}}></div>
                    </div>
                ) : contests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <svg className="h-16 w-16 text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-blue-400">No contests found in this period.</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'graph' && (
                            <div className="animate-fade-in">
                                <div className="bg-white rounded-xl border border-blue-100 p-2 sm:p-4 mb-4 shadow">
                                    <h3 className="text-base sm:text-lg font-medium text-blue-700 mb-4">Rating Progress</h3>
                                    <div className="w-full h-[220px] sm:h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={formatChartData()}>
                                                <defs>
                                                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#0ea5e9" />
                                                        <stop offset="100%" stopColor="#3b82f6" />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" opacity={0.5} />
                                                <XAxis dataKey="contestDate" tick={{fill: "#60a5fa"}} />
                                                <YAxis tick={{fill: "#60a5fa"}} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="newRating" 
                                                    stroke="url(#ratingGradient)" 
                                                    strokeWidth={3}
                                                    dot={{r: 6, strokeWidth: 2, stroke: "#0ea5e9", fill: "#fff"}}
                                                    activeDot={{r: 8, stroke: "#0ea5e9", strokeWidth: 2, fill: "#3b82f6"}}
                                                    animationDuration={1500}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'table' && (
                            <div className="animate-fade-in">
                                <div className="overflow-x-auto w-full">
                                    <table className="min-w-[900px] divide-y divide-blue-100 text-xs sm:text-sm md:text-base rounded-xl overflow-hidden border border-blue-100 bg-white shadow">
                                        <thead className="bg-blue-50">
                                            <tr>
                                                <th scope="col" className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Contest Name</th>
                                                <th scope="col" className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Rating</th>
                                                <th scope="col" className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Change</th>
                                                <th scope="col" className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Rank</th>
                                                <th scope="col" className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Problems Unsolved</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-blue-50">
                                            {contests.map((contest, index) => (
                                                <tr key={contest.contestId}
                                                    className="hover:bg-blue-50 transition-colors duration-150"
                                                    style={{ animationDelay: `${index * 50}ms` }}>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-blue-900">{contest.contestName}</td>
                                                    <td className={`px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center text-sm font-bold ${getRatingColor(contest.newRating)}`}>
                                                        {contest.newRating}
                                                    </td>
                                                    <td className={`px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center text-sm font-medium ${getRatingChangeColor(contest.newRating - contest.oldRating)}`}>
                                                        {contest.newRating - contest.oldRating > 0 ? '+' : ''}
                                                        {contest.newRating - contest.oldRating}
                                                    </td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center text-sm text-blue-700">{contest.rank}</td>
                                                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-center text-sm text-blue-700">
                                                        <span
                                                            className={
                                                                `inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold ` +
                                                                (contest.problemsUnsolved === 0
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : contest.problemsUnsolved <= 2
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-red-100 text-red-500')
                                                            }
                                                        >
                                                            {contest.problemsUnsolved}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ContestHistory;