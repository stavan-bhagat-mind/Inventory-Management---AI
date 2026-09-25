class ApiResponse {
  static success(res, statusCode, message, data = null, meta = undefined) {
    const payload = {
      success: true,
      statusCode,
      message,
      data
    };

    if (meta !== undefined) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  static error(res, statusCode, message, details = null) {
    const payload = {
      success: false,
      statusCode,
      message
    };

    if (details !== null) {
      payload.error = details;
    }

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
