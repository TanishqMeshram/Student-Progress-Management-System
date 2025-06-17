const axios = require('axios');
const Student = require('../models/Student');

// ------------------ CODEFORCES DATA SYNC ------------------

const fetchCFData = async (handle) => {
    try {
        const userInfo = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
        const contestHistory = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
        const submissions = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);

        return {
            userRating: userInfo.data.result[0],
            contestHistory: contestHistory.data.result,
            submissions: submissions.data.result
        };
    } catch (err) {
        console.error('Error fetching CF data for handle', handle, ':', err.message);
        return null;
    }
};

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
        problemsUnsolved: 0 // Placeholder
    }));

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

    const lastSubmission = cfData.submissions[0];
    student.lastActivityDate = lastSubmission ? new Date(lastSubmission.creationTimeSeconds * 1000) : null;

    student.lastSynced = new Date();

    await student.save();
};

const syncStudentData = async () => {
    const students = await Student.find();
    for (let student of students) {
        await syncStudentDataForStudent(student.cfHandle);
    }
    console.log('Student data synced at', new Date());
};

const manualSync = async (req, res) => {
    await syncStudentData();
    res.send('Manual sync completed successfully.');
};

module.exports = {
    fetchCFData,
    syncStudentDataForStudent,
    syncStudentData,
    manualSync,
};