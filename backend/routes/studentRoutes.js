const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// CRUD Routes
router.get('/', studentController.getAllStudents);
router.post('/', studentController.addStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

router.get('/:id', studentController.getStudentById);

// Manual Sync Route
router.get('/sync', studentController.manualSync);

// route to get student progress
router.get('/:id/progress', studentController.getStudentProgress);

// Contest History Route
router.get('/:id/contest-history', studentController.getContestHistory);

// Problem Solving Stats Route
router.get('/:id/problem-solving-stats', studentController.getProblemSolvingStats);

module.exports = router;
