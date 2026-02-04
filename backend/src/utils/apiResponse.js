// backend/utils/apiResponse.js
// Make sure your ApiResponse can include additional data:

class ApiResponse {
  static success(message, data = null) {
    return {
      success: true,
      message,
      ...(data && { data })
    };
  }

  static error(message, additionalData = null) {
    const response = {
      success: false,
      message
    };
    
    if (additionalData) {
      response.data = additionalData;
    }
    
    return response;
  }
}

module.exports = ApiResponse;