const Student = require('../models/Student');
const axios = require('axios');
const moment = require('moment');

// ------------------ CRUD OPERATIONS ------------------

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addStudent = async (req, res) => {
    try {
        // Validate the Codeforces handle
        const cfData = await fetchCFData(req.body.cfHandle);
        if (!cfData) {
            return res.status(400).json({ message: 'Invalid Codeforces handle' });
        }

        // If valid, save the student
        const student = new Student({ ...req.body, lastUpdated: new Date() });
        student.currentRating = cfData.userRating.rating;
        student.maxRating = cfData.userRating.maxRating;

        await student.save();

        // Sync additional data like contests, problems
        await syncStudentDataForStudent(student.cfHandle);

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // If the Codeforces handle is updated, fetch the new data immediately
        if (req.body.cfHandle) {
            await syncStudentDataForStudent(req.body.cfHandle);
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentProgress = async (req, res) => {
    try {
        const { id } = req.params;

        let student = await Student.findOne(
            { cfHandle: id },
            { contests: 1, solvedProblems: 1, _id: 0 } // fetch only required fields
        );

        if (!student) {
            console.log('Student not found');
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Student found successfully');

        // Prepare rating history (contest timeline)
        const ratingHistory = student.contests.map(contest => ({
            contestName: contest.contestName,
            rating: contest.newRating
        }));

        // Prepare submission history (heatmap: date -> submission count)
        const submissionCountByDate = {};

        student.solvedProblems.forEach(problem => {
            const dateStr = problem.solvedDate.toISOString().split('T')[0]; // YYYY-MM-DD
            if (submissionCountByDate[dateStr]) {
                submissionCountByDate[dateStr]++;
            } else {
                submissionCountByDate[dateStr] = 1;
            }
        });

        const submissionHistory = Object.keys(submissionCountByDate).map(date => ({
            date,
            count: submissionCountByDate[date]
        }));

        res.json({
            ratingHistory,
            submissionHistory
        });
    } catch (error) {
        console.error('Error fetching student progress:', error.message);
        res.status(500).json({ message: 'Server error while fetching student progress' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log(req.params)
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        res.json(student);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.getContestHistory = async (req, res) => {
    try {
        const { id } = req.params;
        let { range = 90 } = req.query;
        range = parseInt(range, 10);

        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const cutoffDate = moment().subtract(range, 'days').toDate();
        const filteredContests = student.contests.filter(contest => new Date(contest.contestDate) >= cutoffDate);

        res.json({ contests: filteredContests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Problem Solving Stats
exports.getProblemSolvingStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { range = 30 } = req.query;

        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const cutoffDate = moment().subtract(range, 'days').toDate();

        const recentSubmissions = student.solvedProblems.filter(sub => new Date(sub.solvedDate) >= cutoffDate);

        if (recentSubmissions.length === 0) {
            return res.json({
                mostDifficultProblem: null,
                totalSolved: 0,
                averageRating: 0,
                averagePerDay: 0,
                solvedPerRatingBucket: {},
                submissionHeatmap: []
            });
        }

        // Find most difficult problem
        const mostDifficultProblem = recentSubmissions.reduce((max, curr) => curr.rating > max.rating ? curr : max, recentSubmissions[0]);

        const totalSolved = recentSubmissions.length;
        const averageRating = Math.round(recentSubmissions.reduce((sum, sub) => sum + sub.rating, 0) / totalSolved);
        const averagePerDay = (totalSolved / range).toFixed(2);

        // Problems solved per rating bucket
        const solvedPerRatingBucket = {};
        recentSubmissions.forEach(sub => {
            const bucket = Math.floor(sub.rating / 100) * 100;
            solvedPerRatingBucket[bucket] = (solvedPerRatingBucket[bucket] || 0) + 1;
        });

        // Submission heatmap
        const heatmapMap = {};
        recentSubmissions.forEach(sub => {
            const date = new Date(sub.solvedDate).toISOString().split('T')[0];
            heatmapMap[date] = (heatmapMap[date] || 0) + 1;
        });
        const submissionHeatmap = Object.entries(heatmapMap).map(([date, count]) => ({ date, count }));

        // Dynamically generate the problem link
        const generateProblemLink = (problemId) => {
            // Assuming problemId format: "1234-A"
            const [contestId, index] = problemId.split('-');
            return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
        };

        res.json({
            mostDifficultProblem: {
                name: mostDifficultProblem.problemName,
                rating: mostDifficultProblem.rating,
                link: generateProblemLink(mostDifficultProblem.problemId)
            },
            totalSolved,
            averageRating,
            averagePerDay,
            solvedPerRatingBucket,
            submissionHeatmap
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};



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

// Auto sync every second (for now)
setInterval(syncStudentData, 100000);

// Manual sync trigger
exports.manualSync = async (req, res) => {
    await syncStudentData();
    res.send('Manual sync completed successfully.');
};
