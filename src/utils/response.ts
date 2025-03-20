/**
 * Generates success response.
 *
 * @param {any} data - The data payload to include in the response.
 * @param {string} [message="Success"] - An optional success message.
 * @returns {{ success: true; message: string; data: any }} - A success response object.
 */
export const successResponse = (data: any, message = "Success") => ({
  success: true,
  message,
  data,
});

/**
 * Generates a error response.
 *
 * @param {string} [message="Generic Error"] - An optional error message.
 * @returns {{ success: false; message: string }} - An error response object.
 */
export const errorResponse = (message = "Generic Error") => ({
  success: false,
  message,
});
