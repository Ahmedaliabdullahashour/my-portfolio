export interface Experience {
  id: string;
  role: string;
  company: string;
  location?: string;
  /** Human readable, e.g. "Jan 2025". */
  startDate: string;
  /** `null` means the role is current. */
  endDate: string | null;
  description: string;
  technologies?: string[];
  /** Placeholder entries are clearly flagged in the UI until real data is added. */
  isPlaceholder?: boolean;
}
