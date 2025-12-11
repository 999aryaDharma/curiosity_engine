// src/utils/errorHandler.ts

import { ApiError } from "@type/common.types";
import { ERROR_CODES } from "@constants/config";
import logger from "./logger";

class ErrorHandler {
  handleError(error: any, context?: string): ApiError {
    logger.error(`Error in ${context || "unknown context"}:`, error);

    if (error.code && error.message) {
      return error as ApiError;
    }

    if (error.response) {
      return this.handleApiError(error);
    }

    if (error.message) {
      return {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: error.message,
      };
    }

    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: "An unknown error occurred",
    };
  }

  private handleApiError(error: any): ApiError {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        return {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: message || "Invalid request",
        };

      case 401:
        return {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        };

      case 403:
        return {
          code: "FORBIDDEN",
          message: "Access denied",
        };

      case 404:
        return {
          code: "NOT_FOUND",
          message: "Resource not found",
        };

      case 429:
        return {
          code: "RATE_LIMIT",
          message: "Too many requests",
        };

      case 500:
      case 502:
      case 503:
        return {
          code: "SERVER_ERROR",
          message: "Server error occurred",
        };

      default:
        return {
          code: ERROR_CODES.NETWORK_ERROR,
          message: message || "Network error",
        };
    }
  }

  handleDatabaseError(error: any): ApiError {
    logger.error("Database error:", error);

    return {
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Database operation failed",
    };
  }

  handleLLMError(error: any): ApiError {
    logger.error("LLM error:", error);

    if (error.code === "ECONNABORTED") {
      return {
        code: ERROR_CODES.TIMEOUT_ERROR,
        message: "Request timeout - please try again",
      };
    }

    return {
      code: ERROR_CODES.LLM_ERROR,
      message: error.message || "Failed to generate spark",
    };
  }

  isNetworkError(error: ApiError): boolean {
    return (
      error.code === ERROR_CODES.NETWORK_ERROR ||
      error.code === ERROR_CODES.TIMEOUT_ERROR
    );
  }

  isDatabaseError(error: ApiError): boolean {
    return error.code === ERROR_CODES.DATABASE_ERROR;
  }

  isLLMError(error: ApiError): boolean {
    return error.code === ERROR_CODES.LLM_ERROR;
  }

  getUserFriendlyMessage(error: ApiError): string {
    switch (error.code) {
      case ERROR_CODES.NETWORK_ERROR:
        return "Please check your internet connection and try again.";

      case ERROR_CODES.TIMEOUT_ERROR:
        return "The request took too long. Please try again.";

      case ERROR_CODES.DATABASE_ERROR:
        return "There was a problem saving your data. Please restart the app.";

      case ERROR_CODES.LLM_ERROR:
        return "Failed to generate spark. Please try again.";

      case ERROR_CODES.VALIDATION_ERROR:
        return "Invalid input. Please check your entries.";

      default:
        return error.message || "Something went wrong. Please try again.";
    }
  }
}

export default new ErrorHandler();
