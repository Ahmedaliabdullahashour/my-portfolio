import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import type { SocialLink } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon';

/**
 * Renders the social links from `PortfolioSettings`.
 *
 * Links without a URL are rendered as buttons that explain the missing
 * configuration instead of pointing at a broken or invented profile.
 */
@Component({
  selector: 'app-social-links',
  imports: [IconComponent],
  template: `
    <ul class="socials" [attr.aria-label]="ariaLabel()">
      @for (link of links(); track link.label) {
        <li>
          @if (link.url) {
            <a
              class="socials__item"
              [href]="link.url"
              [attr.target]="isExternal(link.url) ? '_blank' : null"
              [attr.rel]="isExternal(link.url) ? 'noopener noreferrer' : null"
              [attr.aria-label]="link.label"
              [attr.title]="link.label"
            >
              <app-icon [name]="link.icon" />
            </a>
          } @else {
            <button
              type="button"
              class="socials__item socials__item--pending"
              [attr.aria-label]="link.label + ' — link not configured yet'"
              [attr.title]="link.label + ' — link not configured yet'"
              (click)="notifyMissing(link)"
            >
              <app-icon [name]="link.icon" />
            </button>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .socials {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .socials__item {
      position: relative;
      display: grid;
      place-items: center;
      width: 2.65rem;
      height: 2.65rem;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: rgba(148, 163, 184, 0.04);
      color: var(--muted);
      font-size: 1.05rem;
      transition:
        color 0.3s var(--ease),
        border-color 0.3s var(--ease),
        background-color 0.3s var(--ease),
        transform 0.3s var(--ease);
    }

    .socials__item:hover {
      transform: translateY(-3px);
      color: #fff;
      border-color: var(--accent-line);
      background: var(--accent-soft);
    }

    .socials__item--pending {
      cursor: help;
      border-style: dashed;
      color: var(--faint);
    }

    .socials__item--pending:hover {
      color: #fff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialLinksComponent {
  private readonly toast = inject(ToastService);

  readonly links = input<SocialLink[]>([]);
  readonly ariaLabel = input('Social profiles');

  protected isExternal(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }

  protected notifyMissing(link: SocialLink): void {
    this.toast.show(
      `${link.label} is not configured yet. Add the profile URL in portfolio settings to activate it.`,
      'info',
    );
  }
}
