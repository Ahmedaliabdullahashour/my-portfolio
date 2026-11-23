import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-toast-host',
  imports: [IconComponent],
  template: `
    <div class="toast-region" role="region" aria-label="Notifications">
      <div aria-live="polite" aria-atomic="false" class="toast-stack">
        @for (toast of toastService.toasts(); track toast.id) {
          <div class="toast" [class]="'toast toast--' + toast.kind" role="status">
            <span class="toast__icon">
              <app-icon [name]="iconFor(toast.kind)" />
            </span>
            <p class="toast__text">{{ toast.message }}</p>
            <button
              type="button"
              class="toast__close"
              aria-label="Dismiss notification"
              (click)="toastService.dismiss(toast.id)"
            >
              <app-icon name="close" />
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .toast-region {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 120;
      display: flex;
      justify-content: flex-end;
      padding: clamp(1rem, 3vw, 1.75rem);
      pointer-events: none;
    }

    .toast-stack {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      width: min(24rem, 100%);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      padding: 0.9rem 1rem;
      border: 1px solid var(--line-strong);
      border-radius: var(--r-md);
      background: rgba(10, 16, 30, 0.94);
      backdrop-filter: blur(14px);
      box-shadow: var(--shadow-lg);
      color: var(--text-soft);
      pointer-events: auto;
      animation: scale-in 0.35s var(--ease);
    }

    .toast__icon {
      display: grid;
      place-items: center;
      width: 1.65rem;
      height: 1.65rem;
      border-radius: 50%;
      background: var(--accent-soft);
      color: var(--accent-bright);
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .toast--success .toast__icon {
      background: var(--success-soft);
      color: var(--success);
    }

    .toast--error .toast__icon {
      background: var(--danger-soft);
      color: var(--danger);
    }

    .toast__text {
      flex: 1;
      font-size: 0.86rem;
      line-height: 1.55;
    }

    .toast__close {
      display: grid;
      place-items: center;
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 50%;
      color: var(--faint);
      font-size: 0.9rem;
      transition:
        color 0.25s var(--ease),
        background-color 0.25s var(--ease);
      flex-shrink: 0;
    }

    .toast__close:hover {
      color: var(--text);
      background: rgba(148, 163, 184, 0.12);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);

  protected iconFor(kind: 'info' | 'success' | 'error'): string {
    return kind === 'success' ? 'check-circle' : kind === 'error' ? 'alert-circle' : 'sparkles';
  }
}
