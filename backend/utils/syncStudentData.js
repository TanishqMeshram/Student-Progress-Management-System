/**
 * Utilities for syncing student data from Codeforces.
 * - fetchCFData: Fetches user info, contest history, and submissions from Codeforces API.
 * - syncStudentDataForStudent: Updates a single student's data in the DB.
 * - syncStudentData: Updates all students' data in the DB.
 */

const Student = require('../models/Student');
const axios = require('axios');

/**
 * Fetch Codeforces data for a given handle.
 * @param {string} handle - Codeforces handle
 * @returns {Object|null} { userRating, contestHistory, submissions }
 */
const fetchCFData = async (handle) => {
    try {
        const userInfo = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
        const contestHistory = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
        const submissions = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);

        const allSubmissions = submissions.data.result;

        // Track attempted and solved problems per contest
        const attemptedProblemsMap = {};
        const solvedProblemsMap = {};

        allSubmissions.forEach(submission => {
            if (submission.contestId) {
                const contestId = submission.contestId;
                const problemIndex = submission.problem.index;

                if (!attemptedProblemsMap[contestId]) {
                    attemptedProblemsMap[contestId] = new Set();
                }
                attemptedProblemsMap[contestId].add(problemIndex);

                if (submission.verdict === "OK") {
                    if (!solvedProblemsMap[contestId]) {
                        solvedProblemsMap[contestId] = new Set();
                    }
                    solvedProblemsMap[contestId].add(problemIndex);
                }
            }
        });

        // Add unsolved count to contest history
        const UpdatedContestHistory = contestHistory.data.result.map(contest => {
            const contestId = contest.contestId;
            const solvedCount = solvedProblemsMap[contestId] ? solvedProblemsMap[contestId].size : 0;
            const attemptedCount = attemptedProblemsMap[contestId] ? attemptedProblemsMap[contestId].size : 0;
            const unsolvedCount = attemptedCount - solvedCount;

            return {
                ...contest,
                problemsUnsolved: unsolvedCount
            };
        });

        return {
            userRating: userInfo.data.result[0],
            contestHistory: UpdatedContestHistory,
            submissions: allSubmissions
        };
    } catch (err) {
        console.error('Error fetching CF data for handle', handle, ':', err.message);
        return null;
    }
};

/**
 * Sync a single student's data from Codeforces and update in DB.
 * @param {string} handle - Codeforces handle
 */
const syncStudentDataForStudent = async (handle) => {
    const student = await Student.findOne({ cfHandle: handle });
    if (!student) return;

    const cfData = await fetchCFData(handle);
    if (!cfData) return;

    student.currentRating = cfData.userRating.rating;
    student.maxRating = cfData.userRating.maxRating;
    student.lastUpdated = new Date();

    student.contests = cfData.contestHistory.map(contest => ({
        contestId: contest.contestId,
        contestName: contest.contestName,
        contestDate: new Date(contest.ratingUpdateTimeSeconds * 1000),
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        problemsUnsolved: contest.problemsUnsolved
    }));

    // Only keep unique solved problems (by problemId)
    const solvedProblems = {};
    cfData.submissions.forEach(sub => {
        if (sub.verdict === 'OK') {
            const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
            if (!solvedProblems[problemId]) {
                solvedProblems[problemId] = {
                    problemId,
                    problemName: sub.problem.name,
                    rating: sub.problem.rating || 0,
                    solvedDate: new Date(sub.creationTimeSeconds * 1000)
                };
            }
        }
    });

    student.solvedProblems = Object.values(solvedProblems);

    // Update last activity date
    const lastSubmission = cfData.submissions[0];
    student.lastActivityDate = lastSubmission ? new Date(lastSubmission.creationTimeSeconds * 1000) : null;

    student.lastSynced = new Date();

    await student.save();
};

/**
 * Sync all students' data from Codeforces.
 */
const syncStudentData = async () => {
    const students = await Student.find();
    for (let student of students) {
        await syncStudentDataForStudent(student.cfHandle);
    }
    console.log('Student data synced at', new Date());
};

module.exports = {
    syncStudentData,
    syncStudentDataForStudent,
    fetchCFData,
};