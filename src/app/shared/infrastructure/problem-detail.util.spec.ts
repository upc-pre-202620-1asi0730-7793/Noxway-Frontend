import '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { extractProblemMessage } from './problem-detail.util';

describe('extractProblemMessage', () => {
  it('formats RFC 9457 detail and field validation errors', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'Validation Failed',
        detail: 'Request validation failed',
        errors: { phone: 'must match +51 format' },
      },
    });
    expect(extractProblemMessage(err, 'Fallback')).toBe(
      'Request validation failed (phone: must match +51 format)',
    );
  });

  it('returns detail, title, or fallback cleanly', () => {
    const err501 = new HttpErrorResponse({
      status: 501,
      error: { title: 'Not Implemented', detail: 'IAM auth is deferred in demo mode' },
    });
    expect(extractProblemMessage(err501, 'Fallback')).toBe('IAM auth is deferred in demo mode');
    expect(extractProblemMessage(new Error('boom'), 'Fallback')).toBe('Fallback');
  });
});
