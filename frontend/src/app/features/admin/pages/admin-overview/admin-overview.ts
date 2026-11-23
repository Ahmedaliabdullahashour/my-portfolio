import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { PortfolioApiService, type AdminMessage } from '../../../../core/services/portfolio-api.service';
import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-admin-overview',
  imports: [RouterLink, IconComponent, DatePipe],
  template: `
    <div class="overview">
      <header class="overview__head">
        <div>
          <span class="eyebrow">Dashboard</span>
          <h1 class="overview__title">Content Overview</h1>
          <p class="overview__subtitle">
            Manage your developer portfolio content, track live submissions, and keep your records updated.
          </p>
        </div>
      </header>

      <div class="overview__stats">
        @for (stat of stats(); track stat.label) {
          <div class="stat">
            <span class="stat__icon"><app-icon [name]="stat.icon" /></span>
            <span class="stat__value">{{ stat.value }}</span>
            <span class="stat__label">{{ stat.label }}</span>
          </div>
        }
      </div>

      <!-- Recent Messages Section -->
      <section class="overview__section">
        <div class="overview__section-head">
          <div>
            <h2 class="overview__section-title">Recent Contact Inquiries</h2>
            <p class="overview__section-sub">Direct messages sent through your public portfolio form</p>
          </div>
          <a routerLink="/admin/messages" class="btn btn--ghost btn--sm">
            View All Messages
            <app-icon name="arrow-right" />
          </a>
        </div>

        @if (loadingMessages()) {
          <div class="overview__loading">
            <app-icon name="refresh" class="spin" />
            <span>Loading recent activity...</span>
          </div>
        } @else if (recentMessages().length === 0) {
          <div class="overview__empty glass">
            <app-icon name="mail" />
            <p>No messages received yet.</p>
          </div>
        } @else {
          <div class="overview__messages glass">
            @for (msg of recentMessages(); track msg.id || msg._id) {
              <div class="msg-row" [class.is-unread]="!msg.read">
                <div class="msg-row__dot"></div>
                <div class="msg-row__info">
                  <span class="msg-row__sender">{{ msg.name }}</span>
                  <span class="msg-row__email">{{ msg.email }}</span>
                </div>
                <div class="msg-row__subject">{{ msg.subject }}</div>
                <div class="msg-row__date">{{ msg.createdAt | date: 'mediumDate' }}</div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Modules Navigation -->
      <section class="overview__section">
        <h2 class="overview__section-title">Management Modules</h2>
        <div class="overview__modules">
          @for (module of modules; track module.path) {
            <a class="module" [routerLink]="module.path">
              <span class="module__icon"><app-icon [name]="module.icon" /></span>
              <span class="module__name">{{ module.label }}</span>
              <span class="module__desc">{{ module.description }}</span>
              <span class="module__arrow"><app-icon name="arrow-up-right" /></span>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styleUrl: './admin-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOverviewPage {
  private readonly store = inject(PortfolioStore);
  private readonly api = inject(PortfolioApiService);

  protected readonly messages = signal<AdminMessage[]>([]);
  protected readonly loadingMessages = signal(true);

  protected readonly recentMessages = computed(() => this.messages().slice(0, 5));

  protected readonly stats = computed(() => [
    { label: 'Projects', value: this.store.projects().length, icon: 'folder' },
    { label: 'Skills', value: this.store.skills().length, icon: 'target' },
    { label: 'Experience Entries', value: this.store.experience().length, icon: 'briefcase' },
    { label: 'Total Inquiries', value: this.messages().length, icon: 'mail' },
  ]);

  protected readonly modules = [
    { label: 'Projects', path: '/admin/projects', icon: 'folder', description: 'Create, edit, reorder and delete projects.' },
    { label: 'Skills', path: '/admin/skills', icon: 'target', description: 'Manage skills and proficiency levels.' },
    { label: 'Experience', path: '/admin/experience', icon: 'briefcase', description: 'Maintain the professional timeline.' },
    { label: 'Education', path: '/admin/education', icon: 'graduation-cap', description: 'Degrees, institutions and coursework.' },
    { label: 'Settings & Bio', path: '/admin/settings', icon: 'sparkles', description: 'Identity, bio, contact details, social links & CV.' },
    { label: 'Messages', path: '/admin/messages', icon: 'mail', description: 'Read, mark and delete contact form submissions.' },
  ];

  constructor() {
    this.store.load();
    this.fetchMessages();
  }

  private fetchMessages(): void {
    this.api.getMessages().subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loadingMessages.set(false);
      },
      error: () => this.loadingMessages.set(false),
    });
  }
}
