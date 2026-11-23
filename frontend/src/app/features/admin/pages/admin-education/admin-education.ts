import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PortfolioApiService } from '../../../../core/services/portfolio-api.service';
import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import type { Education } from '../../../../core/models';

@Component({
  selector: 'app-admin-education',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="admin-page">
      <header class="admin-page__head">
        <div>
          <a class="admin-page__back" routerLink="/admin">
            <app-icon name="arrow-right" />
            Back to overview
          </a>
          <h1 class="admin-page__title">Education Management</h1>
          <p class="admin-page__desc">Manage academic qualifications, institutions, faculties, and relevant coursework.</p>
        </div>
        <button type="button" class="btn btn--primary" (click)="openCreateModal()">
          <app-icon name="plus" />
          Add Education
        </button>
      </header>

      @if (loading()) {
        <div class="admin-page__loading">
          <app-icon name="refresh" class="spin" />
          <span>Loading education records...</span>
        </div>
      } @else if (educationList().length === 0) {
        <div class="empty-card glass">
          <app-icon name="graduation-cap" />
          <h3>No education records</h3>
          <p>Add your degrees, certifications, or academic programs.</p>
          <button type="button" class="btn btn--primary btn--sm" (click)="openCreateModal()">
            <app-icon name="plus" />
            Add First Entry
          </button>
        </div>
      } @else {
        <div class="education-grid">
          @for (item of educationList(); track item.id || $index) {
            <article class="edu-card glass">
              <div class="edu-card__head">
                <div class="edu-card__title-wrap">
                  <span class="edu-card__icon"><app-icon name="graduation-cap" /></span>
                  <div>
                    <h2 class="edu-card__degree">{{ item.degree }}</h2>
                    <div class="edu-card__sub">{{ item.faculty }} • {{ item.institution }}</div>
                  </div>
                </div>

                <div class="edu-card__right">
                  <span class="chip chip--year">
                    {{ item.startYear }} — {{ item.endYear || 'Present' }}
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

              <p class="edu-card__desc">{{ item.description }}</p>

              @if (item.relevantCourses && item.relevantCourses.length > 0) {
                <div class="courses-wrap">
                  <span class="courses-label">Key coursework:</span>
                  <div class="courses-chips">
                    @for (course of item.relevantCourses; track course) {
                      <span class="course-chip">{{ course }}</span>
                    }
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }

      <!-- Education Modal Form -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>{{ editingId() ? 'Edit Education' : 'Add Education' }}</h2>
              <button type="button" class="close-btn" (click)="closeModal()">
                <app-icon name="close" />
              </button>
            </header>

            <form [formGroup]="form" (ngSubmit)="saveEducation()" class="modal-form">
              <div class="field">
                <label class="field__label" for="edu-degree">Degree / Qualification *</label>
                <div class="field__control">
                  <input id="edu-degree" type="text" formControlName="degree" placeholder="e.g. Bachelor's Degree in Computer Science" required />
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="edu-faculty">Faculty / Department *</label>
                  <div class="field__control">
                    <input id="edu-faculty" type="text" formControlName="faculty" placeholder="e.g. Faculty of Computer Science" required />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="edu-inst">Institution *</label>
                  <div class="field__control">
                    <input id="edu-inst" type="text" formControlName="institution" placeholder="e.g. Obour University" required />
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="edu-start">Start Year *</label>
                  <div class="field__control">
                    <input id="edu-start" type="text" formControlName="startYear" placeholder="2022" required />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="edu-end">End Year</label>
                  <div class="field__control">
                    <input id="edu-end" type="text" formControlName="endYear" placeholder="Leave empty for Present" />
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="edu-loc">Location</label>
                <div class="field__control">
                  <input id="edu-loc" type="text" formControlName="location" placeholder="e.g. Egypt" />
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="edu-desc">Description *</label>
                <div class="field__control">
                  <textarea id="edu-desc" rows="3" formControlName="description" placeholder="Focus of studies, academic distinctions, and projects" required></textarea>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="edu-courses">Relevant Courses (comma separated)</label>
                <div class="field__control">
                  <input id="edu-courses" type="text" formControlName="coursesInput" placeholder="Data Structures, Algorithms, OOP, Database Systems" />
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
                    Save Education
                  }
                </button>
              </footer>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (eduToDelete(); as target) {
        <div class="modal-backdrop" (click)="eduToDelete.set(null)">
          <div class="modal-card modal-card--sm glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>Confirm Deletion</h2>
              <button type="button" class="close-btn" (click)="eduToDelete.set(null)">
                <app-icon name="close" />
              </button>
            </header>
            <div class="modal-card__body">
              <p>Are you sure you want to delete education record at <strong>{{ target.institution }}</strong>?</p>
            </div>
            <footer class="modal-form__actions">
              <button type="button" class="btn btn--ghost" (click)="eduToDelete.set(null)">Cancel</button>
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

    .education-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .edu-card {
      padding: 1.5rem;
      border-radius: var(--r-md);
      border: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .edu-card__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .edu-card__title-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .edu-card__icon {
      width: 2.5rem;
      height: 2.5rem;
      display: grid;
      place-items: center;
      border-radius: var(--r-xs);
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-bright);
      font-size: 1.15rem;
    }

    .edu-card__degree {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
    }

    .edu-card__sub {
      font-size: 0.85rem;
      color: var(--text-soft);
      margin-top: 0.15rem;
    }

    .edu-card__right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .chip--year {
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }

    .edu-card__desc {
      font-size: 0.88rem;
      color: var(--muted);
      line-height: 1.6;
    }

    .courses-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.25rem;
    }

    .courses-label {
      font-size: 0.75rem;
      color: var(--faint);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .courses-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .course-chip {
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
export class AdminEducationPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PortfolioApiService);
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  protected readonly educationList = signal<Education[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);

  protected readonly showModal = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly eduToDelete = signal<Education | null>(null);

  protected readonly form = this.fb.group({
    degree: ['', Validators.required],
    faculty: ['', Validators.required],
    institution: ['', Validators.required],
    startYear: ['', Validators.required],
    endYear: [''],
    location: [''],
    description: ['', Validators.required],
    coursesInput: [''],
  });

  constructor() {
    this.loadEducation();
  }

  loadEducation(): void {
    this.loading.set(true);
    this.api.getEducation().subscribe({
      next: (data) => {
        this.educationList.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load education records.', 'error');
      },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({
      degree: '',
      faculty: '',
      institution: '',
      startYear: '2022',
      endYear: '',
      location: 'Egypt',
      description: '',
      coursesInput: '',
    });
    this.showModal.set(true);
  }

  openEditModal(item: Education): void {
    const id = item.id || (item as any)._id;
    this.editingId.set(id);
    this.form.patchValue({
      degree: item.degree,
      faculty: item.faculty,
      institution: item.institution,
      startYear: item.startYear,
      endYear: item.endYear || '',
      location: item.location || '',
      description: item.description,
      coursesInput: (item.relevantCourses || []).join(', '),
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveEducation(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.getRawValue();
    const relevantCourses = (val.coursesInput || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload: Partial<Education> = {
      degree: val.degree!,
      faculty: val.faculty!,
      institution: val.institution!,
      startYear: val.startYear!,
      endYear: val.endYear ? val.endYear : null,
      location: val.location || '',
      description: val.description!,
      relevantCourses,
    };

    const id = this.editingId();
    const req$ = id ? this.api.updateEducation(id, payload) : this.api.createEducation(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show(id ? 'Education updated successfully.' : 'Education record added.', 'success');
        this.closeModal();
        this.loadEducation();
        this.store.reloadEducation();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save education record.';
        this.toast.show(msg, 'error');
      },
    });
  }

  confirmDelete(item: Education): void {
    this.eduToDelete.set(item);
  }

  executeDelete(item: Education): void {
    const id = item.id || (item as any)._id;
    this.deleting.set(true);
    this.api.deleteEducation(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.eduToDelete.set(null);
        this.toast.show('Education record deleted.', 'success');
        this.loadEducation();
        this.store.reloadEducation();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message || 'Failed to delete education record.';
        this.toast.show(msg, 'error');
      },
    });
  }
}
