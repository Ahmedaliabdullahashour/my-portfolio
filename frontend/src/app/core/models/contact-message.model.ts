/** Payload posted to `POST /api/contact`. */
export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Normalised response returned by the contact service. */
export interface ContactResponse {
  success: boolean;
  message: string;
}
