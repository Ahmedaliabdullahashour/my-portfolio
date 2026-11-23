import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import type { Education, Experience, PortfolioSettings, Project, Skill } from '../models';
import { PortfolioApiService } from './portfolio-api.service';

/**
 * Application-level store for public portfolio content.
 *
 * Components read signals from this store. It also provides reload and mutation
 * methods so when changes happen via Admin or data refreshes, all views stay synchronized.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly api = inject(PortfolioApiService);

  private loaded = false;

  readonly settings = signal<PortfolioSettings | null>(null);
  readonly skills = signal<Skill[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly experience = signal<Experience[]>([]);
  readonly education = signal<Education[]>([]);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly featuredProjects = computed(() =>
    this.projects()
      .filter((project) => project.featured)
      .sort((a, b) => a.order - b.order),
  );

  readonly socials = computed(() => this.settings()?.socials ?? []);

  /** Loads every public dataset once, unless `force` is requested. */
  load(force = false): void {
    if (this.loaded && !force) {
      return;
    }

    this.loaded = true;
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      settings: this.api.getSettings(),
      skills: this.api.getSkills(),
      projects: this.api.getProjects(),
      experience: this.api.getExperience(),
      education: this.api.getEducation(),
    }).subscribe({
      next: (data) => {
        this.settings.set(data.settings);
        this.skills.set(data.skills);
        this.projects.set(data.projects);
        this.experience.set(data.experience);
        this.education.set(data.education);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[PortfolioStore] Error loading portfolio data:', err);
        this.error.set('Portfolio content could not be loaded from API. Please try again.');
        this.loading.set(false);
      },
    });
  }

  retry(): void {
    this.load(true);
  }

  refresh(): void {
    this.load(true);
  }

  reloadProjects(): void {
    this.api.getProjects().subscribe({
      next: (projects) => this.projects.set(projects),
      error: (err) => console.error('[PortfolioStore] Reload projects failed:', err),
    });
  }

  reloadSkills(): void {
    this.api.getSkills().subscribe({
      next: (skills) => this.skills.set(skills),
      error: (err) => console.error('[PortfolioStore] Reload skills failed:', err),
    });
  }

  reloadExperience(): void {
    this.api.getExperience().subscribe({
      next: (exp) => this.experience.set(exp),
      error: (err) => console.error('[PortfolioStore] Reload experience failed:', err),
    });
  }

  reloadEducation(): void {
    this.api.getEducation().subscribe({
      next: (edu) => this.education.set(edu),
      error: (err) => console.error('[PortfolioStore] Reload education failed:', err),
    });
  }

  reloadSettings(): void {
    this.api.getSettings().subscribe({
      next: (settings) => this.settings.set(settings),
      error: (err) => console.error('[PortfolioStore] Reload settings failed:', err),
    });
  }
}
