import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PortfolioApiService } from '../../../../core/services/portfolio-api.service';
import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import type { Experience } from '../../../../core/models';

@Component({
  selector: 'app-admin-experience',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="admin-page">
      <header class="admin-page__head">
        <div>
          <a class="admin-page__back" routerLink="/admin">
            <app-icon name="arrow-right" />
            Back to overview
          </a>
          <h1 class="admin-page__title">Experience Management</h1>
          <p class="admin-page__desc">Maintain professional career history, roles, companies, dates, and achievements.</p>
        </div>
        <button type="button" class="btn btn--primary" (click)="openCreateModal()">
          <app-icon name="plus" />
          Add Experience
        </button>
      </header>

      @if (loading()) {
        <div class="admin-page__loading">
          <app-icon name="refresh" class="spin" />
          <span>Loading experience...</span>
        </div>
      } @else if (experienceList().length === 0) {
        <div class="empty-card glass">
          <app-icon name="briefcase" />
          <h3>No experience entries</h3>
          <p>Add your work experience, internships, or freelance roles.</p>
          <button type="button" class="btn btn--primary btn--sm" (click)="openCreateModal()">
            <app-icon name="plus" />
            Add First Entry
          </button>
        </div>
      } @else {
        <div class="timeline-list">
          @for (item of experienceList(); track item.id || $index) {
            <article class="exp-card glass">
              <div class="exp-card__head">
                <div class="exp-card__role-wrap">
                  <span class="exp-card__icon"><app-icon name="briefcase" /></span>
                  <div>
                    <h2 class="exp-card__role">{{ item.role }}</h2>
                    <div class="exp-card__company">
                      {{ item.company }}
                      @if (item.location) {
                        <span class="exp-card__location">• {{ item.location }}</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="exp-card__right">
                  <span class="chip chip--date">
                    {{ item.startDate }} — {{ item.endDate || 'Present' }}
                  </span>
                  <div class="action-buttons">
                    <button type="button" class="icon-btn icon-btn--edit" title="Edit" (click)="openEditModal(item)">
                      <app-icon name="edit" />
                    </button>
                    <button type="button" class="icon-btn icon-btn--delete" title="Delete" (click)="confirmDelete(item)">
                      <app-icon name="trash" />
                    </button>
                  </div>
                </div>
              </div>

              <p class="exp-card__desc">{{ item.description }}</p>

              @if (item.technologies && item.technologies.length > 0) {
                <div class="tech-chips">
                  @for (t of item.technologies; track t) {
                    <span class="tech-chip">{{ t }}</span>
                  }
                </div>
              }
            </article>
          }
        </div>
      }

      <!-- Experience Modal Form -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>{{ editingId() ? 'Edit Experience' : 'Add Experience' }}</h2>
              <button type="button" class="close-btn" (click)="closeModal()">
                <app-icon name="close" />
              </button>
            </header>

            <form [formGroup]="form" (ngSubmit)="saveExperience()" class="modal-form">
              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="exp-role">Job Title / Role *</label>
                  <div class="field__control">
                    <input id="exp-role" type="text" formControlName="role" placeholder="e.g. Front-End Developer" required />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="exp-company">Company / Organization *</label>
                  <div class="field__control">
                    <input id="exp-company" type="text" formControlName="company" placeholder="e.g. Tech Solutions Co." required />
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="exp-loc">Location</label>
                  <div class="field__control">
                    <input id="exp-loc" type="text" formControlName="location" placeholder="e.g. Cairo, Egypt (or Remote)" />
                  </div>
                </div>

                <div class="form-row form-row--dates">
                  <div class="field">
                    <label class="field__label" for="exp-start">Start Date *</label>
                    <div class="field__control">
                      <input id="exp-start" type="text" formControlName="startDate" placeholder="e.g. Jan 2024" required />
                    </div>
                  </div>

                  <div class="field">
                    <label class="field__label" for="exp-end">End Date</label>
                    <div class="field__control">
                      <input id="exp-end" type="text" formControlName="endDate" placeholder="Leave empty for Present" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="exp-desc">Description of Responsibilities & Achievements *</label>
                <div class="field__control">
                  <textarea id="exp-desc" rows="4" formControlName="description" placeholder="Describe the interfaces you built, business outcomes delivered, and team contributions" required></textarea>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="exp-tech">Technologies Used (comma separated)</label>
                <div class="field__control">
                  <input id="exp-tech" type="text" formControlName="technologiesInput" placeholder="Angular, TypeScript, RxJS, CSS" />
                </div>
              </div>

              <footer class="modal-form__actions">
                <button type="button" class="btn btn--ghost" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn--primary" [disabled]="saving() || form.invalid">
                  @if (saving()) {
                    <app-icon name="refresh" class="spin" />
                    Saving...
                  } @else {
                    <app-icon name="check" />
                    Save Experience
                  }
                </button>
              </footer>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (expToDelete(); as target) {
        <div class="modal-backdrop" (click)="expToDelete.set(null)">
          <div class="modal-card modal-card--sm glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>Confirm Deletion</h2>
              <button type="button" class="close-btn" (click)="expToDelete.set(null)">
                <app-icon name="close" />
              </button>
            </header>
            <div class="modal-card__body">
              <p>Are you sure you want to delete experience at <strong>{{ target.company }}</strong>?</p>
            </div>
            <footer class="modal-form__actions">
              <button type="button" class="btn btn--ghost" (click)="expToDelete.set(null)">Cancel</button>
              <button type="button" class="btn btn--danger" [disabled]="deleting()" (click)="executeDelete(target)">
                @if (deleting()) {
                  <app-icon name="refresh" class="spin" />
                  Deleting...
                } @else {
                  <app-icon name="trash" />
                  Delete Entry
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

    .timeline-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .exp-card {
      padding: 1.5rem;
      border-radius: var(--r-md);
      border: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .exp-card__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .exp-card__role-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .exp-card__icon {
      width: 2.5rem;
      height: 2.5rem;
      display: grid;
      place-items: center;
      border-radius: var(--r-xs);
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-bright);
      font-size: 1.15rem;
    }

    .exp-card__role {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
    }

    .exp-card__company {
      font-size: 0.85rem;
      color: var(--text-soft);
      margin-top: 0.15rem;
    }

    .exp-card__location {
      color: var(--faint);
    }

    .exp-card__right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .chip--date {
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }

    .exp-card__desc {
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.6;
    }

    .tech-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .tech-chip {
      font-size: 0.72rem;
      padding: 0.15rem 0.5rem;
      border-radius: var(--r-pill);
      background: rgba(148, 163, 184, 0.08);
      color: var(--text-soft);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .action-buttons {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
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

    .icon-btn--edit:hover {
      border-color: var(--accent-line);
      background: var(--accent-soft);
      color: var(--accent-bright);
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
      overflow-y: auto;
    }

    .modal-card {
      width: 100%;
      max-width: 38rem;
      padding: 1.75rem;
      border-radius: var(--r-xl);
      border: 1px solid var(--line-strong);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-card--sm {
      max-width: 28rem;
    }

    .modal-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 0.85rem;
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

    .modal-form {
      display: grid;
      gap: 1.15rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-row--dates {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .field__control input,
    .field__control textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: var(--r-sm);
      border: 1px solid var(--line);
      background: rgba(15, 23, 42, 0.6);
      color: var(--text);
      font-family: inherit;
      font-size: 0.88rem;
    }

    .field__control input:focus,
    .field__control textarea:focus {
      outline: none;
      border-color: var(--accent-bright);
      box-shadow: 0 0 0 3px rgba(99, 164, 255, 0.15);
    }

    .modal-form__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
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

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminExperiencePage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PortfolioApiService);
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  protected readonly experienceList = signal<Experience[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);

  protected readonly showModal = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly expToDelete = signal<Experience | null>(null);

  protected readonly form = this.fb.group({
    role: ['', Validators.required],
    company: ['', Validators.required],
    location: [''],
    startDate: ['', Validators.required],
    endDate: [''],
    description: ['', Validators.required],
    technologiesInput: [''],
  });

  constructor() {
    this.loadExperience();
  }

  loadExperience(): void {
    this.loading.set(true);
    this.api.getExperience().subscribe({
      next: (data) => {
        this.experienceList.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load experience records.', 'error');
      },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({
      role: '',
      company: '',
      location: 'Egypt',
      startDate: '',
      endDate: '',
      description: '',
      technologiesInput: '',
    });
    this.showModal.set(true);
  }

  openEditModal(item: Experience): void {
    const id = item.id || (item as any)._id;
    this.editingId.set(id);
    this.form.patchValue({
      role: item.role,
      company: item.company,
      location: item.location || '',
      startDate: item.startDate,
      endDate: item.endDate || '',
      description: item.description,
      technologiesInput: (item.technologies || []).join(', '),
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveExperience(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.getRawValue();
    const technologies = (val.technologiesInput || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<Experience> = {
      role: val.role!,
      company: val.company!,
      location: val.location || '',
      startDate: val.startDate!,
      endDate: val.endDate ? val.endDate : null,
      description: val.description!,
      technologies,
    };

    const id = this.editingId();
    const req$ = id ? this.api.updateExperience(id, payload) : this.api.createExperience(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show(id ? 'Experience updated successfully.' : 'Experience added successfully.', 'success');
        this.closeModal();
        this.loadExperience();
        this.store.reloadExperience();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save experience.';
        this.toast.show(msg, 'error');
      },
    });
  }

  confirmDelete(item: Experience): void {
    this.expToDelete.set(item);
  }

  executeDelete(item: Experience): void {
    const id = item.id || (item as any)._id;
    this.deleting.set(true);
    this.api.deleteExperience(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.expToDelete.set(null);
        this.toast.show('Experience deleted successfully.', 'success');
        this.loadExperience();
        this.store.reloadExperience();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message || 'Failed to delete experience.';
        this.toast.show(msg, 'error');
      },
    });
  }
}
