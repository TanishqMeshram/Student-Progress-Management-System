import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentContestData } from '../api/api';
function ContestHistory({ id }) {
    
    const [contests, setContests] = useState([]);
    const [range, setRange] = useState(90);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContestHistory();
    }, [range]);

    const fetchContestHistory = async () => {
        try {
            setLoading(true);
            const res = await getStudentContestData(id, range || 90);
            setContests(res.data.contests);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contest history:', error);
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

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Contest History</h2>

            {/* Filter Buttons */}
            <div className="flex space-x-4 mb-4">
                {[30, 90, 365].map((r) => (
                    <button
                        key={r}
                        onClick={() => handleRangeChange(r)}
                        className={`px-4 py-2 rounded ${range === r ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Last {r} days
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : contests.length === 0 ? (
                <p>No contests in this period.</p>
            ) : (
                <>
                    {/* Rating Graph */}
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formatChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="contestDate" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="newRating" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Contest Table */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full table-auto border-collapse border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-4 py-2">Contest Name</th>
                                    <th className="border px-4 py-2">Rating Change</th>
                                    <th className="border px-4 py-2">Rank</th>
                                    <th className="border px-4 py-2">Problems Unsolved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contests.map((contest) => (
                                    <tr key={contest.contestId}>
                                        <td className="border px-4 py-2">{contest.contestName}</td>
                                        <td className="border px-4 py-2">
                                            {contest.newRating - contest.oldRating > 0 ? '+' : ''}
                                            {contest.newRating - contest.oldRating}
                                        </td>
                                        <td className="border px-4 py-2">{contest.rank}</td>
                                        <td className="border px-4 py-2">{contest.problemsUnsolved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ContestHistory;
