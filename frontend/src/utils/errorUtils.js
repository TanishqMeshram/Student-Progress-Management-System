/**
 * Extracts a user-friendly error message from an error object.
 * @param {any} err - Error object (from axios or JS)
 * @returns {string} - Error message for display
 */
export function extractErrorMessage(err) {
  return err?.response?.data?.message ||
         err?.response?.data?.error?.details ||
         err.message ||
         'An error occurred. Please try again.';
}