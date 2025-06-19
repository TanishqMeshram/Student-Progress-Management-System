const Student = require('../models/Student');
const moment = require('moment');
const dataSync = require('../utils/syncStudentData');

/**
 * GET /api/students
 * Fetch all students.
 */
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students.',
            error: { details: error.message }
        });
    }
};

/**
 * POST /api/students
 * Add a new student.
 * Body: { name, email, phone, cfHandle }
 */
const addStudent = async (req, res) => {
    try {
        // Check for duplicate email or handle
        const existing = await Student.findOne({
            $or: [
                { email: req.body.email },
                { cfHandle: req.body.cfHandle }
            ]
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A student with this email or Codeforces handle already exists.',
                error: {}
            });
        }

        // Validate Codeforces handle via external API
        const cfData = await dataSync.fetchCFData(req.body.cfHandle);
        if (!cfData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Codeforces handle',
                error: {}
            });
        }

        // Create and save student
        const student = new Student({ ...req.body, lastUpdated: new Date() });
        student.currentRating = cfData.userRating.rating;
        student.maxRating = cfData.userRating.maxRating;

        await student.save();

        // Sync additional data (contests, problems)
        await dataSync.syncStudentDataForStudent(student.cfHandle);

        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add student.',
            error: { details: error.message }
        });
    }
};

/**
 * PUT /api/students/:id
 * Update a student by ID.
 * Body: { name, email, phone, cfHandle }
 */
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
                error: {}
            });
        }

        // Check for duplicate email or handle (excluding self)
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
            return res.status(400).json({
                success: false,
                message: 'A student with this email or Codeforces handle already exists.',
                error: {}
            });
        }

        // Only assign allowed fields
        const allowedFields = ['name', 'email', 'phone', 'cfHandle'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) student[field] = req.body[field];
        });
        student.lastUpdated = new Date();

        // Optionally re-sync if handle changed
        if (req.body.cfHandle) {
            await dataSync.syncStudentDataForStudent(req.body.cfHandle);
        }

        await student.save();

        res.json({ success: true, data: student });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error.',
                error: { details: error.message }
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update student.',
            error: { details: error.message }
        });
    }
};

/**
 * DELETE /api/students/:id
 * Delete a student by ID.
 */
const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { message: 'Student deleted' } });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete student.',
            error: { details: error.message }
        });
    }
};

/**
 * GET /api/students/:id
 * Get a student by MongoDB ID.
 */
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
                error: {}
            });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: { details: error.message }
        });
    }
};

/**
 * GET /api/students/:id/progress
 * Get student progress (rating/submission history) by Codeforces handle.
 */
const getStudentProgress = async (req, res) => {
    try {
        const { id } = req.params;
        let student = await Student.findOne(
            { cfHandle: id },
            { contests: 1, solvedProblems: 1, _id: 0 }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
                error: {}
            });
        }

        // Build rating and submission history
        const ratingHistory = student.contests.map(contest => ({
            contestName: contest.contestName,
            rating: contest.newRating,
            contestDate: contest.contestDate
        }));

        const submissionCountByDate = {};
        student.solvedProblems.forEach(problem => {
            const dateStr = problem.solvedDate.toISOString().split('T')[0];
            submissionCountByDate[dateStr] = (submissionCountByDate[dateStr] || 0) + 1;
        });

        const submissionHistory = Object.keys(submissionCountByDate).map(date => ({
            date,
            count: submissionCountByDate[date]
        }));

        res.json({ success: true, data: { ratingHistory, submissionHistory } });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching student progress.',
            error: { details: error.message }
        });
    }
};

/**
 * GET /api/students/:id/contest-history
 * Get contest history for a student.
 * Query: range (number of days, default 90)
 */
const getContestHistory = async (req, res) => {
    try {
        const { id } = req.params;
        let { range = 90 } = req.query;
        range = parseInt(range, 10);

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
                error: {}
            });
        }

        const cutoffDate = moment().subtract(range, 'days').toDate();
        const filteredContests = student.contests.filter(contest => new Date(contest.contestDate) >= cutoffDate);

        res.json({ success: true, data: { contests: filteredContests } });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching contest history.',
            error: { details: error.message }
        });
    }
};

/**
 * GET /api/students/:id/problem-solving-stats
 * Get problem solving stats for a student.
 * Query: range (number of days, default 30)
 */
const getProblemSolvingStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { range = 30 } = req.query;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
                error: {}
            });
        }

        const cutoffDate = moment().subtract(range, 'days').toDate();

        const recentSubmissions = student.solvedProblems.filter(sub => new Date(sub.solvedDate) >= cutoffDate);

        if (recentSubmissions.length === 0) {
            return res.json({
                success: true,
                data: {
                    mostDifficultProblem: null,
                    totalSolved: 0,
                    averageRating: 0,
                    averagePerDay: 0,
                    solvedPerRatingBucket: {},
                    submissionHeatmap: []
                }
            });
        }

        // Find most difficult problem
        const mostDifficultProblem = recentSubmissions.reduce((max, curr) => curr.rating > max.rating ? curr : max, recentSubmissions[0]);
        const totalSolved = recentSubmissions.length;
        const averageRating = Math.round(recentSubmissions.reduce((sum, sub) => sum + sub.rating, 0) / totalSolved);
        const averagePerDay = (totalSolved / range).toFixed(2);

        // Bucket by rating
        const solvedPerRatingBucket = {};
        recentSubmissions.forEach(sub => {
            const bucket = Math.floor(sub.rating / 100) * 100;
            solvedPerRatingBucket[bucket] = (solvedPerRatingBucket[bucket] || 0) + 1;
        });

        // Build heatmap
        const heatmapMap = {};
        recentSubmissions.forEach(sub => {
            const date = new Date(sub.solvedDate).toISOString().split('T')[0];
            heatmapMap[date] = (heatmapMap[date] || 0) + 1;
        });
        const submissionHeatmap = Object.entries(heatmapMap).map(([date, count]) => ({ date, count }));

        // Helper to generate Codeforces problem link
        const generateProblemLink = (problemId) => {
            const [contestId, index] = problemId.split('-');
            return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
        };

        res.json({
            success: true,
            data: {
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
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching problem solving stats.',
            error: { details: error.message }
        });
    }
};

/**
 * PUT /api/students/:id/toggle-reminder
 * Toggle auto-reminder for a student.
 */
const toggleReminder = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.',
                error: {}
            });
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { autoReminderEnabled: !student.autoReminderEnabled },
            { new: true }
        );
    
        res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update reminder setting.',
            error: { details: error.message }
        });
    }
};

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