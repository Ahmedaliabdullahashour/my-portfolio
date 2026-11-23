export type SkillCategory = 'Frontend' | 'Backend' | 'Programming' | 'Computer Science';

/**
 * Mirrors the `Skill` Mongoose schema in the backend
 * (`name`, `level`, `category`, `icon`).
 */
export interface Skill {
  id: string;
  name: string;
  /** Proficiency from 0 to 100. */
  level: number;
  category: SkillCategory;
  /** Icon key resolved by the shared `<app-icon>` component. */
  icon: string;
  /** Optional short label describing how the skill is used. */
  note?: string;
}
