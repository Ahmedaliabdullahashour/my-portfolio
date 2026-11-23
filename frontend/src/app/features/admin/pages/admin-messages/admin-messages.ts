import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { PortfolioApiService, type AdminMessage } from '../../../../core/services/portfolio-api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-admin-messages',
  imports: [RouterLink, IconComponent, DatePipe],
  template: `
    <div class="admin-page">
      <header class="admin-page__head">
        <div>
          <a class="admin-page__back" routerLink="/admin">
            <app-icon name="arrow-right" />
            Back to overview
          </a>
          <h1 class="admin-page__title">Contact Inquiries & Messages</h1>
          <p class="admin-page__desc">Submissions received through the public portfolio contact form.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="admin-page__loading">
          <app-icon name="refresh" class="spin" />
          <span>Loading messages...</span>
        </div>
      } @else if (messages().length === 0) {
        <div class="empty-card glass">
          <app-icon name="mail" />
          <h3>No messages yet</h3>
          <p>When visitors submit inquiries via the contact form, they will appear here.</p>
        </div>
      } @else {
        <div class="messages-list">
          @for (msg of messages(); track msg.id || msg._id) {
            <article class="msg-card glass" [class.is-unread]="!msg.read">
              <div class="msg-card__head">
                <div class="msg-card__sender-info">
                  <span class="status-indicator" [class.is-read]="msg.read"></span>
                  <div>
                    <h2 class="msg-card__sender">{{ msg.name }}</h2>
                    <a [href]="'mailto:' + msg.email" class="msg-card__email">{{ msg.email }}</a>
                  </div>
                </div>

                <div class="msg-card__meta">
                  <span class="msg-card__date">{{ msg.createdAt | date: 'medium' }}</span>
                  <div class="action-buttons">
                    @if (!msg.read) {
                      <button
                        type="button"
                        class="btn btn--ghost btn--sm"
                        title="Mark as read"
                        (click)="markAsRead(msg)"
                      >
                        <app-icon name="check" />
                        Mark Read
                      </button>
                    }
                    <button
                      type="button"
                      class="icon-btn icon-btn--delete"
                      title="Delete message"
                      (click)="confirmDelete(msg)"
                    >
                      <app-icon name="trash" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="msg-card__subject">
                <span class="subject-label">Subject:</span>
                <strong>{{ msg.subject }}</strong>
              </div>

              <p class="msg-card__body">{{ msg.message }}</p>

              <footer class="msg-card__foot">
                <a [href]="'mailto:' + msg.email + '?subject=Re: ' + msg.subject" class="btn btn--primary btn--sm">
                  <app-icon name="mail" />
                  Reply via Email
                </a>
              </footer>
            </article>
          }
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (msgToDelete(); as target) {
        <div class="modal-backdrop" (click)="msgToDelete.set(null)">
          <div class="modal-card modal-card--sm glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>Confirm Deletion</h2>
              <button type="button" class="close-btn" (click)="msgToDelete.set(null)">
                <app-icon name="close" />
              </button>
            </header>
            <div class="modal-card__content">
              <p>Are you sure you want to permanently delete this message from <strong>{{ target.name }}</strong>?</p>
            </div>
            <footer class="modal-card__actions">
              <button type="button" class="btn btn--ghost" (click)="msgToDelete.set(null)">Cancel</button>
              <button type="button" class="btn btn--danger" [disabled]="deleting()" (click)="executeDelete(target)">
                @if (deleting()) {
                  <app-icon name="refresh" class="spin" />
                  Deleting...
                } @else {
                  <app-icon name="trash" />
                  Delete Message
                }
              </button>
            </footer>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .admin-page__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .admin-page__back {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--muted);
      font-size: 0.82rem;
      margin-bottom: 0.5rem;
      transition: color 0.2s var(--ease);
    }

    .admin-page__back:hover {
      color: var(--accent-bright);
    }

    .admin-page__back app-icon {
      transform: rotate(180deg);
    }

    .admin-page__title {
      font-size: clamp(1.4rem, 2.5vw, 1.85rem);
      font-weight: 700;
    }

    .admin-page__desc {
      color: var(--muted);
      font-size: 0.88rem;
      margin-top: 0.25rem;
    }

    .admin-page__loading {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--muted);
      padding: 3rem 0;
    }

    .empty-card {
      padding: 3.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: var(--muted);
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .msg-card {
      padding: 1.5rem;
      border-radius: var(--r-md);
      border: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: border-color 0.2s var(--ease);
    }

    .msg-card.is-unread {
      border-color: rgba(99, 164, 255, 0.4);
      background: linear-gradient(160deg, rgba(29, 78, 216, 0.08), rgba(9, 14, 26, 0.6));
    }

    .msg-card__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .msg-card__sender-info {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .status-indicator {
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 50%;
      background: var(--accent-bright);
      box-shadow: 0 0 0 4px rgba(99, 164, 255, 0.2);
    }

    .status-indicator.is-read {
      background: var(--faint);
      box-shadow: none;
    }

    .msg-card__sender {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
    }

    .msg-card__email {
      font-size: 0.82rem;
      color: var(--accent-bright);
      text-decoration: none;
    }

    .msg-card__email:hover {
      text-decoration: underline;
    }

    .msg-card__meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .msg-card__date {
      font-size: 0.78rem;
      color: var(--faint);
      white-space: nowrap;
    }

    .msg-card__subject {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.95rem;
      color: var(--text);
      padding-block: 0.35rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
    }

    .subject-label {
      color: var(--faint);
      font-size: 0.82rem;
      font-weight: 500;
    }

    .msg-card__body {
      font-size: 0.9rem;
      color: var(--text-soft);
      line-height: 1.65;
      white-space: pre-wrap;
    }

    .msg-card__foot {
      display: flex;
      justify-content: flex-start;
      padding-top: 0.5rem;
    }

    .action-buttons {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: var(--r-xs);
      border: 1px solid var(--line);
      background: rgba(15, 23, 42, 0.5);
      color: var(--muted);
      cursor: pointer;
      transition: all 0.2s var(--ease);
    }

    .icon-btn--delete:hover {
      border-color: rgba(251, 113, 133, 0.4);
      background: var(--danger-soft);
      color: var(--danger);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(4, 6, 12, 0.8);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: grid;
      place-items: center;
      padding: 1.5rem;
    }

    .modal-card {
      width: 100%;
      max-width: 28rem;
      padding: 1.75rem;
      border-radius: var(--r-xl);
      border: 1px solid var(--line-strong);
    }

    .modal-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--line);
    }

    .modal-card__head h2 {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 1.2rem;
    }

    .modal-card__content p {
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.5;
    }

    .modal-card__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--line);
    }

    .btn--danger {
      background: var(--danger);
      color: #fff;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMessagesPage {
  private readonly api = inject(PortfolioApiService);
  private readonly toast = inject(ToastService);

  protected readonly messages = signal<AdminMessage[]>([]);
  protected readonly loading = signal(true);
  protected readonly deleting = signal(false);

  protected readonly msgToDelete = signal<AdminMessage | null>(null);

  constructor() {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.api.getMessages().subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load contact messages.', 'error');
      },
    });
  }

  markAsRead(msg: AdminMessage): void {
    const id = msg.id || msg._id;
    if (!id) return;

    this.api.markMessageRead(id).subscribe({
      next: () => {
        this.messages.update((list) =>
          list.map((m) => ((m.id || m._id) === id ? { ...m, read: true } : m))
        );
        this.toast.show('Message marked as read.', 'success');
      },
      error: () => this.toast.show('Failed to update message status.', 'error'),
    });
  }

  confirmDelete(msg: AdminMessage): void {
    this.msgToDelete.set(msg);
  }

  executeDelete(msg: AdminMessage): void {
    const id = msg.id || msg._id;
    if (!id) return;

    this.deleting.set(true);
    this.api.deleteMessage(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.msgToDelete.set(null);
        this.messages.update((list) => list.filter((m) => (m.id || m._id) !== id));
        this.toast.show('Message deleted successfully.', 'success');
      },
      error: () => {
        this.deleting.set(false);
        this.toast.show('Failed to delete message.', 'error');
      },
    });
  }
}
