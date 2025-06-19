/**
 * Global error handler middleware.
 */
function errorHandler(err, req, res, next) {
    console.error(err.stack || err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: err.errors || {}
    });
}

module.exports = errorHandler;