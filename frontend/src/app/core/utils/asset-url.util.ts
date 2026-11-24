import { API_CONFIG } from '../config/api.config';

/**
 * Returns the backend base origin (e.g. "http://localhost:5000") derived from API_CONFIG.baseUrl.
 */
export function getBackendOrigin(): string {
  try {
    return new URL(API_CONFIG.baseUrl).origin;
  } catch {
    return API_CONFIG.baseUrl.replace(/\/api\/?$/, '');
  }
}

/**
 * Centralized, reusable asset URL resolver.
 *
 * Rules:
 * 1. Empty / null / undefined -> returns empty string ''.
 * 2. Accidental frontend origin for uploads (http://localhost:4200/uploads/...) -> rewrites to backend origin.
 * 3. Absolute URLs (http://, https://, data:, blob:) -> returned as-is.
 * 4. Local frontend assets (assets/..., /assets/...) -> returned as /assets/... (served by Angular host).
 * 5. Backend uploads (/uploads/..., uploads/..., /api/uploads/..., api/uploads/...) -> resolved against backend origin (e.g. http://localhost:5000/uploads/...).
 * 6. Bare uploaded filenames (e.g. "1795459752238-381a54cc62f2.jpg") -> resolved to http://localhost:5000/uploads/<filename>.
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  const backendOrigin = getBackendOrigin();

  // Rewrite accidental frontend-origin uploads URLs to backend
  if (
    trimmed.startsWith('http://localhost:4200/uploads/') ||
    trimmed.startsWith('https://localhost:4200/uploads/')
  ) {
    return trimmed.replace(/^https?:\/\/localhost:4200/, backendOrigin);
  }

  // Already absolute or data/blob URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Frontend static assets (e.g. "assets/images/projects/aurora.svg" or "/assets/...")
  if (trimmed.startsWith('assets/') || trimmed.startsWith('/assets/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // Backend uploads (e.g. "/uploads/...", "uploads/...", "/api/uploads/...")
  if (
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('uploads/') ||
    trimmed.startsWith('/api/uploads/') ||
    trimmed.startsWith('api/uploads/')
  ) {
    const cleanPath = trimmed
      .replace(/^\/?(api\/)?uploads\//, 'uploads/')
      .replace(/^\/+/, '');
    return `${backendOrigin}/${cleanPath}`;
  }

  // Bare upload filename with an image or pdf extension (e.g. "1795459752238-381a54cc62f2.jpg")
  if (!trimmed.includes('/') && /\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(trimmed)) {
    return `${backendOrigin}/uploads/${trimmed}`;
  }

  // Fallback: preserve path relative to host
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
