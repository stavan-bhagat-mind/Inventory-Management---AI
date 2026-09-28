export const formatErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // If already a string
  if (typeof error === 'string') return error;

  // Axios response error
  if (error.response?.data) {
    const data = error.response.data;

    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.message || e).join(', ');
    }

    if (data.message) {
      return data.message;
    }
  }

  if (error.message) {
    return error.message;
  }

  return 'Network error or server unreachable.';
};
