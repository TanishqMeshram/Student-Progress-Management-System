/**
 * Middleware for handling 404 Not Found errors.
 */
function notFound(req, res, next) {
    res.status(404).json({
        success: false,
        message: 'Not Found',
        error: {}
    });
}

module.exports = notFound;