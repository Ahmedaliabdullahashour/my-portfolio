import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon';

interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  template: `
    <div class="admin">
      <aside class="admin__sidebar">
        <a class="admin__brand" routerLink="/">
          <span class="admin__mark">AA</span>
          <span>
            <span class="admin__brand-name">Portfolio Admin</span>
            <span class="admin__brand-sub">Ahmed Ashour</span>
          </span>
        </a>

        <nav class="admin__nav" aria-label="Admin navigation">
          @for (item of nav; track item.path) {
            <a
              class="admin__nav-link"
              [routerLink]="item.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.path === '/admin' }"
            >
              <app-icon [name]="item.icon" />
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="admin__sidebar-foot">
          <button type="button" class="admin__signout" (click)="signOut()">
            <app-icon name="shield" />
            Sign Out
          </button>
          <a class="admin__back" routerLink="/">
            <app-icon name="arrow-right" />
            View Public Site
          </a>
        </div>
      </aside>

      <div class="admin__main">
        <header class="admin__topbar">
          <span class="admin__topbar-label">Admin Area</span>
          <span class="admin__topbar-note">
            <span class="status-dot"></span>
            Authenticated Session Active
          </span>
        </header>
        <div class="admin__content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly nav: AdminNavItem[] = [
    { label: 'Overview', path: '/admin', icon: 'grid' },
    { label: 'Projects', path: '/admin/projects', icon: 'folder' },
    { label: 'Skills', path: '/admin/skills', icon: 'target' },
    { label: 'Experience', path: '/admin/experience', icon: 'briefcase' },
    { label: 'Education', path: '/admin/education', icon: 'graduation-cap' },
    { label: 'Settings & Bio', path: '/admin/settings', icon: 'sparkles' },
    { label: 'Messages', path: '/admin/messages', icon: 'mail' },
  ];

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/admin/login');
  }
}
