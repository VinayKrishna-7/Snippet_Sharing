/**
 * Centralized error handling middleware.
 * Formats errors into clean JSON responses and prevents leaking internal stack traces in production.
 */
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log error details for server debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  // Handle Mongoose / MongoDB validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: messages,
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId/type)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}'`,
    });
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record already exists.',
    });
  }

  // Handle JSON parse error from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided.',
    });
  }

  // Default to err.statusCode or 500
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * 404 handler for undefined API routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
}
