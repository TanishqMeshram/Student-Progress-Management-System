// studentRoute.js - Routes for managing students and their progress data

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { studentValidationRules, validate } = require('../middlewares/validation');

/**
 * @route PUT /students/:id/toggle-reminder
 * @desc Toggle automatic email reminders for a student.
 * @params id - Student ID
 */
router.put('/:id/toggle-reminder', studentController.toggleReminder);

/**
 * @route GET /students/:id/problem-solving-stats
 * @desc Get problem-solving statistics for a student.
 * @params id - Student ID
 */
router.get('/:id/problem-solving-stats', studentController.getProblemSolvingStats);

/**
 * @route GET /students/:id/contest-history
 * @desc Get contest history for a student.
 * @params id - Student ID
 */
router.get('/:id/contest-history', studentController.getContestHistory);

/**
 * @route GET /students/:id/progress
 * @desc Get full progress overview for a student.
 * @params id - Student ID
 */
router.get('/:id/progress', studentController.getStudentProgress);

/**
 * @route PUT /students/:id
 * @desc Update student details.
 * @params id - Student ID
 * @body Updated student object.
 */
router.put('/:id', studentValidationRules, validate, studentController.updateStudent);

/**
 * @route DELETE /students/:id
 * @desc Delete a student.
 * @params id - Student ID
 */
router.delete('/:id', studentController.deleteStudent);

/**
 * @route GET /students/:id
 * @desc Get details of a student by ID.
 * @params id - Student ID
 */
router.get('/:id', studentController.getStudentById);

/**
 * @route GET /students
 * @desc Get a list of all students.
 */
router.get('/', studentController.getAllStudents);

/**
 * @route POST /students
 * @desc Add a new student.
 * @body New student object.
 */
router.post('/', studentValidationRules, validate, studentController.addStudent);

module.exports = router;
