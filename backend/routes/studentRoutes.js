const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const studentController = require('../controllers/studentController');

// CRUD Routes
router.get('/', studentController.getAllStudents);
router.post('/', studentController.addStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

router.get('/:id', studentController.getStudentById);

// Manual Sync Route
// router.get('/sync', studentController.manualSync);

// route to get student progress
router.get('/:id/progress', studentController.getStudentProgress);

// Contest History Route
router.get('/:id/contest-history', studentController.getContestHistory);

// Problem Solving Stats Route
router.get('/:id/problem-solving-stats', studentController.getProblemSolvingStats);

router.put('/:id/toggle-reminder', async (req, res) => {
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
});

module.exports = router;
