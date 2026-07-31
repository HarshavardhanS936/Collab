import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details || [];
  } else {
    // Log unexpected errors
    console.error('Unexpected Error:', err);
  }

  const response = {
    success: false,
    message,
    ...(details.length > 0 && { details }),
  };

  // Never leak stack traces in production
  if (env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
