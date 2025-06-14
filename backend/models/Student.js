const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    cfHandle: String,
    currentRating: Number,
    maxRating: Number,
    lastUpdated: Date,

    contests: [
        {
            contestId: Number,
            contestName: String,
            contestDate: Date,
            rank: Number,
            oldRating: Number,
            newRating: Number,
            problemsUnsolved: Number
        }
    ],

    solvedProblems: [
        {
            problemId: String,
            problemName: String,
            rating: Number,
            solvedDate: Date
        }
    ],

    lastActivityDate: Date,
    remindersSent: {
        type: Number,
        default: 0
    },
    autoReminderEnabled: {
        type: Boolean,
        default: true
    },

    lastSynced: Date
});

module.exports = mongoose.model('Student', StudentSchema);
