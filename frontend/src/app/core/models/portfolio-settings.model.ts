export interface SocialLink {
  label: string;
  /** Icon key resolved by `<app-icon>`. */
  icon: string;
  /**
   * Leave empty until the real profile exists. The UI shows the icon and
   * explains that the link still needs to be configured instead of shipping
   * a broken/fake URL.
   */
  url: string;
}

export interface PortfolioSettings {
  name: string;
  shortName: string;
  title: string;
  tagline: string;
  intro: string;
  /** Biography paragraphs rendered in the About section. */
  bio: string[];
  careerGoals: string[];
  email: string;
  phone?: string;
  location: string;
  availability: string;
  /** Public path to the downloadable CV. */
  cvUrl: string;
  profileImage: string;
  /** Relative path used for the `og:image` / social card. */
  socialImage?: string;
  socials: SocialLink[];
}
