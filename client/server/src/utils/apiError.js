export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.success = false;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
