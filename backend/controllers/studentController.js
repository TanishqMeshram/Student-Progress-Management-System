const Student = require('../models/Student');
const moment = require('moment');
const dataSync = require('./syncController');

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addStudent = async (req, res) => {
    try {
        // Check for existing email or cfHandle
        const existing = await Student.findOne({
            $or: [
                { email: req.body.email },
                { cfHandle: req.body.cfHandle }
            ]
        });
        if (existing) {
            return res.status(400).json({ message: 'A student with this email or Codeforces handle already exists.' });
        }

        // Validate the Codeforces handle
        const cfData = await dataSync.fetchCFData(req.body.cfHandle);
        if (!cfData) {
            return res.status(400).json({ message: 'Invalid Codeforces handle' });
        }

        // If valid, save the student
        const student = new Student({ ...req.body, lastUpdated: new Date() });
        student.currentRating = cfData.userRating.rating;
        student.maxRating = cfData.userRating.maxRating;

        await student.save();

        // Sync additional data like contests, problems
        await dataSync.syncStudentDataForStudent(student.cfHandle);

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        // Find the student to update
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if email or cfHandle is being changed to one that already exists (excluding this student)
        const existing = await Student.findOne({
            $and: [
                { _id: { $ne: req.params.id } },
                {
                    $or: [
                        { email: req.body.email },
                        { cfHandle: req.body.cfHandle }
                    ]
                }
            ]
        });
        if (existing) {
            return res.status(400).json({ message: 'A student with this email or Codeforces handle already exists.' });
        }

        // Update the student
        Object.assign(student, req.body);
        student.lastUpdated = new Date();

        // If the Codeforces handle is updated, fetch the new data immediately
        if (req.body.cfHandle) {
            await dataSync.syncStudentDataForStudent(req.body.cfHandle);
        }

        await student.save();

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudentProgress = async (req, res) => {
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

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        res.json(student);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getContestHistory = async (req, res) => {
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

const getProblemSolvingStats = async (req, res) => {
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

const toggleReminder = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }
    
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { autoReminderEnabled: !student.autoReminderEnabled },
            { new: true }
        );
    
        res.status(200).json(updatedStudent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update reminder setting.' });
    }
}

module.exports = {
    getAllStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentProgress,
    getStudentById,
    getContestHistory,
    getProblemSolvingStats,
    toggleReminder
};