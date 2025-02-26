module.exports = {
  success: (code = 200, msg, data = null, success = true, extra = {}) => {
    console.log("🚀 ~ data:", data);

    return {
      metadata: {
        status: code,
        message: msg,
        success: success,
        extra: extra,
        timestamp: new Date().toISOString(),
      },
      responseData: data,
    };
  },
  error: (code = 404, msg, data = null, success = false, extra = {}) => {
    return {
      metadata: {
        status: code,
        message: msg,
        success: success,
        extra: extra,
        timestamp: new Date().toISOString(),
      },
      responseData: data,
    };
  },
};
