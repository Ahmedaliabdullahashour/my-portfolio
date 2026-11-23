export interface Education {
  id: string;
  institution: string;
  faculty: string;
  degree: string;
  startYear: string;
  /** `null` means "present". */
  endYear: string | null;
  location?: string;
  description: string;
  relevantCourses?: string[];
  isPlaceholder?: boolean;
}
