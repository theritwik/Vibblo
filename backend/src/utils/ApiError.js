/**
 * ApiError Class
 *
 * Custom error class for handling API errors with status codes and additional metadata.
 * Extends the built-in Error class to provide standardized error responses.
 */
class ApiError extends Error {
  /**
   * Constructor for ApiError
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message (default: "something went wrong")
   * @param {string} stack - Error stack trace
   * @param {Array} errors - Array of validation errors or detailed error info
   */
  constructor(
    statusCode,
    message = "something went wrong",
    stack = "",
    errors = []
  ) {
    // Call parent Error constructor
    super(message);

    // Initialize error properties
    this._initializeProperties(statusCode, message, errors);

    // Handle stack trace
    this._setStackTrace(stack);
  }

  /**
   * Initialize the error properties
   * @private
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Array of validation errors
   */
  _initializeProperties(statusCode, message, errors) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Set the stack trace for the error
   * @private
   * @param {string} stack - Custom stack trace
   */
  _setStackTrace(stack) {
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get error response object
   * @returns {Object} Formatted error response
   */
  toResponse() {
    return {
      success: this.success,
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      timestamp: this.timestamp,
    };
  }

  /**
   * Check if error is a validation error (4xx status code)
   * @returns {boolean}
   */
  isValidationError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx status code)
   * @returns {boolean}
   */
  isServerError() {
    return this.statusCode >= 500;
  }
}

export { ApiError };
