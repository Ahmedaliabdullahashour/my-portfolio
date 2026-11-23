import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <main class="login-page">
      <div class="login-card glass">
        <header class="login-card__head">
          <div class="login-card__mark">
            <app-icon name="shield" />
          </div>
          <span class="eyebrow">Portfolio Admin</span>
          <h1 class="login-card__title">Authentication</h1>
          <p class="login-card__desc">Sign in to manage projects, skills, messages, and settings.</p>
        </header>

        @if (errorMessage()) {
          <div class="login-card__alert">
            <app-icon name="alert-circle" />
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-card__form" novalidate>
          <div class="field">
            <label class="field__label" for="admin-email">Email Address</label>
            <div class="field__control" [class.is-invalid]="showError('email')">
              <input
                id="admin-email"
                type="email"
                formControlName="email"
                placeholder="admin@portfolio.local"
                autocomplete="email"
                required
              />
            </div>
            @if (showError('email')) {
              <span class="field__error">Please provide a valid email address.</span>
            }
          </div>

          <div class="field">
            <label class="field__label" for="admin-password">Password</label>
            <div class="field__control" [class.is-invalid]="showError('password')">
              <input
                id="admin-password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>
            @if (showError('password')) {
              <span class="field__error">Password must be at least 6 characters long.</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn--primary btn--block"
            [disabled]="loading() || form.invalid"
          >
            @if (loading()) {
              <app-icon name="refresh" class="spin" />
              <span>Authenticating...</span>
            } @else {
              <app-icon name="shield" />
              <span>Sign In to Dashboard</span>
            }
          </button>
        </form>

        <footer class="login-card__foot">
          <a routerLink="/" class="btn btn--quiet btn--sm">
            <app-icon name="arrow-right" />
            Return to public portfolio
          </a>
        </footer>
      </div>
    </main>
  `,
  styles: `
    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
      background:
        radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.12), transparent 60%),
        var(--bg-0);
    }

    .login-card {
      width: 100%;
      max-width: 27rem;
      padding: clamp(2rem, 5vw, 2.75rem);
      border-radius: var(--r-xl);
    }

    .login-card__head {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-card__mark {
      width: 3.5rem;
      height: 3.5rem;
      margin: 0 auto 1.25rem;
      display: grid;
      place-items: center;
      border-radius: var(--r-lg);
      border: 1px solid var(--accent-line);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(15, 23, 42, 0.6));
      color: var(--accent-bright);
      font-size: 1.5rem;
    }

    .login-card__title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text);
      margin: 0.5rem 0 0.4rem;
    }

    .login-card__desc {
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.5;
    }

    .login-card__alert {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.8rem 1rem;
      margin-bottom: 1.5rem;
      border-radius: var(--r-sm);
      border: 1px solid rgba(251, 113, 133, 0.3);
      background: var(--danger-soft);
      color: #fda4af;
      font-size: 0.85rem;
    }

    .login-card__form {
      display: grid;
      gap: 1.25rem;
    }

    .field__control input {
      width: 100%;
      height: 2.85rem;
      padding: 0 1rem;
      border-radius: var(--r-sm);
      border: 1px solid var(--line);
      background: rgba(15, 23, 42, 0.6);
      color: var(--text);
      font-family: inherit;
      font-size: 0.92rem;
      transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
    }

    .field__control input:focus {
      outline: none;
      border-color: var(--accent-bright);
      box-shadow: 0 0 0 3px rgba(99, 164, 255, 0.15);
    }

    .field__control.is-invalid input {
      border-color: var(--danger);
    }

    .field__error {
      font-size: 0.78rem;
      color: var(--danger);
      margin-top: 0.25rem;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-card__foot {
      margin-top: 2rem;
      text-align: center;
      border-top: 1px solid var(--line);
      padding-top: 1.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/admin');
    }
  }

  protected showError(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const credentials = this.form.getRawValue();

    this.auth.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.show('Signed in successfully.', 'success');
        void this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Invalid email or password. Please verify credentials.';
        this.errorMessage.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }
}
