import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PortfolioApiService, type AuthResponse } from './portfolio-api.service';

const TOKEN_KEY = 'portfolio.admin.token';
const USER_KEY = 'portfolio.admin.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(PortfolioApiService);
  private readonly token = signal<string | null>(readToken());
  readonly currentUser = signal<{ email: string; id?: string } | null>(readUser());

  readonly isAuthenticated = computed(() => Boolean(this.token()));

  getToken(): string | null {
    return this.token();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.login(credentials).pipe(
      tap((res) => {
        this.setToken(res.token);
        const user = { email: res.email, id: res.id };
        this.currentUser.set(user);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  setToken(token: string | null): void {
    this.token.set(token);

    if (typeof localStorage === 'undefined') {
      return;
    }

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.currentUser.set(null);
    }
  }

  logout(): void {
    this.setToken(null);
  }
}

function readToken(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

function readUser(): { email: string; id?: string } | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const saved = localStorage.getItem(USER_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
