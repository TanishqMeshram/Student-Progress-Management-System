const { body, validationResult } = require('express-validator');

/**
 * Validation rules for student creation and update.
 */
const studentValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('cfHandle').notEmpty().withMessage('Codeforces handle is required'),
];

/**
 * Middleware to handle validation errors.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().map(e => e.msg).join(', '),
            error: { details: errors.array() }
        });
    }
    next();
};

module.exports = {
    studentValidationRules,
    validate,
};