const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAllStudents);
router.post('/', studentController.addStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.get('/:id', studentController.getStudentById);
router.get('/:id/progress', studentController.getStudentProgress);
router.get('/:id/contest-history', studentController.getContestHistory);
router.get('/:id/problem-solving-stats', studentController.getProblemSolvingStats);
router.put('/:id/toggle-reminder', studentController.toggleReminder);

module.exports = router;
