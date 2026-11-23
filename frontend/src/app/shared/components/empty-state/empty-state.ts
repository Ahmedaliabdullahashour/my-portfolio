import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `
    <div class="empty" role="status">
      <span class="empty__icon"><app-icon [name]="icon()" /></span>
      <h3 class="empty__title">{{ title() }}</h3>
      <p class="empty__message">{{ message() }}</p>
      @if (actionLabel()) {
        <button type="button" class="btn btn--ghost btn--sm" (click)="action.emit()">
          <span class="btn__icon"><app-icon name="refresh" /></span>
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: clamp(2rem, 5vw, 3.25rem);
      border: 1px dashed var(--line-strong);
      border-radius: var(--r-lg);
      background: rgba(148, 163, 184, 0.03);
      text-align: center;
    }

    .empty__icon {
      display: grid;
      place-items: center;
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
      background: var(--accent-soft);
      color: var(--accent-bright);
      font-size: 1.4rem;
    }

    .empty__title {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .empty__message {
      max-width: 30rem;
      color: var(--muted);
      font-size: 0.92rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('folder');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input('');
  readonly action = output<void>();
}
