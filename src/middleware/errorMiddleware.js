/**
 * Global error handling middleware.
 * All errors passed via next(error) land here.
 * Always returns consistent JSON: { success: false, message: "..." }
 */
const errorHandler = (err, req, res, next) => {
  // If status code hasn't been set to an error code, default to 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Log error details in development only
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${err.message}`);
  }

  // Handle Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0], // Show first validation error
    });
  }

  // Handle invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.',
    });
  }

  // Generic error response — never expose internal stack to client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

/**
 * 404 handler for undefined routes.
 */
const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`Route not found: ${req.originalUrl}`);
  next(error);
};

module.exports = { errorHandler, notFound };
