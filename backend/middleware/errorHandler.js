// Catches any error passed to next(err) (or thrown in an async route wrapped
// with a try/catch) and sends back a clean, consistent JSON error response.
function errorHandler(err, req, res, next) {
  console.error('🔥', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong on our end.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
