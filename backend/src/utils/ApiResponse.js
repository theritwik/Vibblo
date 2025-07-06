/**
 * ApiResponse Class
 *
 * Standardized response class for API endpoints.
 * Provides consistent response structure across the application.
 */
class ApiResponse {
  /**
   * Constructor for ApiResponse
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message (default: "success")
   * @param {any} data - Response data payload
   */
  constructor(statusCode, message = "success", data) {
    // Initialize response properties
    this._setProperties(statusCode, message, data);
  }

  /**
   * Set the response properties
   * @private
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {any} data - Response data
   */
  _setProperties(statusCode, message, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
