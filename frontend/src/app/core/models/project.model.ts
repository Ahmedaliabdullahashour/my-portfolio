/**
 * Shape returned by the future `/api/projects` endpoint.
 * Keep this interface in sync with the Express + Mongoose model.
 */
export interface Project {
  /** Database identifier (Mongo `_id` once the API is connected). */
  id: string;
  title: string;
  description: string;
  /** Long-form copy shown inside the project details dialog. */
  longDescription?: string;
  image: string;
  imageAlt?: string;
  technologies: string[];
  category: ProjectCategory;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  order: number;
  year?: string;
  highlights?: string[];
  /** Marks sample content that must be replaced with real work. */
  isDemo?: boolean;
}

export type ProjectCategory = 'Frontend' | 'Full-Stack' | 'UI / UX';
