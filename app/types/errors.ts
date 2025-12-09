/**
 * Type definitions for API error handling
 */

export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
    };
  };
  message?: string;
}

export interface StandardError {
  message?: string;
}
