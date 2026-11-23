import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

/** Lightweight, accessible toast queue rendered by `<app-toast-host>`. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = signal<Toast[]>([]);

  show(message: string, kind: ToastKind = 'info', duration = 4600): void {
    const id = ++this.counter;
    this.toasts.update((toasts) => [...toasts, { id, message, kind }]);

    this.timeouts.set(
      id,
      setTimeout(() => this.dismiss(id), duration),
    );
  }

  dismiss(id: number): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
