import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, map, of, timeout } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import type { ContactMessage, ContactResponse } from '../models';

/**
 * Contact submission service. Front-end validation lives in the form; this
 * service is already shaped for `POST /api/contact` (the Express route exists
 * in `portfolio-backend/routes/contact.js`).
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  send(message: ContactMessage): Observable<ContactResponse> {
    if (API_CONFIG.useMockData) {
      return of({
        success: true,
        message:
          'Your message has been validated locally. Connect the API to deliver it to the inbox.',
      }).pipe(delay(900));
    }

    return this.http
      .post<{ message?: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.contact}`, message)
      .pipe(
        timeout(API_CONFIG.requestTimeout),
        map((response) => ({
          success: true,
          message: response?.message ?? 'Message sent successfully.',
        })),
        catchError((error: unknown) =>
          of({
            success: false,
            message: extractErrorMessage(error),
          }),
        ),
      );
  }
}

function extractErrorMessage(error: unknown): string {
  const httpError = error as { error?: { message?: string }; name?: string };

  if (httpError?.name === 'TimeoutError') {
    return 'The request timed out. Please try again in a moment.';
  }

  return (
    httpError?.error?.message ??
    'Something went wrong while sending your message. Please try again.'
  );
}
