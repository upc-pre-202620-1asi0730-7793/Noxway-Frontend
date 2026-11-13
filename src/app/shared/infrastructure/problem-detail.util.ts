import { HttpErrorResponse } from '@angular/common/http';

export interface ProblemDetailPayload {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errorKey?: string;
  errors?: Record<string, string>;
  message?: string;
}

/**
 * Extracts a human-readable message from RFC 9457 ProblemDetail or legacy error envelopes.
 */
export function extractProblemMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as ProblemDetailPayload | string | null | undefined;
    if (body && typeof body === 'object') {
      if (body.errors && typeof body.errors === 'object') {
        const pairs = Object.entries(body.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('; ');
        if (pairs) {
          return body.detail ? `${body.detail} (${pairs})` : pairs;
        }
      }
      if (body.detail) {
        return body.detail;
      }
      if (body.title) {
        return body.title;
      }
      if (body.message) {
        return body.message;
      }
    }
    if (typeof body === 'string' && body.trim().length > 0) {
      return body.trim();
    }
    if (error.status === 0) {
      return fallback;
    }
  }
  return fallback;
}
