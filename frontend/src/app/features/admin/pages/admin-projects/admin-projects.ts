import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  PortfolioApiService,
  type UploadResponse,
} from '../../../../core/services/portfolio-api.service';
import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { AssetUrlPipe } from '../../../../shared/pipes/asset-url.pipe';
import type { Project, ProjectCategory } from '../../../../core/models';

@Component({
  selector: 'app-admin-projects',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, AssetUrlPipe],
  template: `
    <div class="admin-page">
      <header class="admin-page__head">
        <div>
          <a class="admin-page__back" routerLink="/admin">
            <app-icon name="arrow-right" />
            Back to overview
          </a>
          <h1 class="admin-page__title">Project Management</h1>
          <p class="admin-page__desc">
            Add, edit, reorder, or delete projects featured in your developer portfolio.
          </p>
        </div>
        <button type="button" class="btn btn--primary" (click)="openCreateModal()">
          <app-icon name="plus" />
          Add Project
        </button>
      </header>

      @if (loading()) {
        <div class="admin-page__loading">
          <app-icon name="refresh" class="spin" />
          <span>Loading projects...</span>
        </div>
      } @else if (projects().length === 0) {
        <div class="empty-card glass">
          <app-icon name="folder" />
          <h3>No projects found</h3>
          <p>Create your first project to showcase your work.</p>
          <button type="button" class="btn btn--primary btn--sm" (click)="openCreateModal()">
            <app-icon name="plus" />
            Add First Project
          </button>
        </div>
      } @else {
        <div class="projects-table-wrap glass">
          <table class="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Technologies</th>
                <th>Order</th>
                <th>Featured</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (proj of projects(); track proj.id || $index) {
                <tr>
                  <td>
                    <div class="table-proj-cell">
                      @if (proj.image) {
                        <img
                          [src]="proj.image | assetUrl"
                          (error)="onImageError($event)"
                          [alt]="proj.title"
                          class="table-proj-thumb"
                        />
                      } @else {
                        <div class="table-proj-placeholder"><app-icon name="folder" /></div>
                      }
                      <div>
                        <div class="table-proj-title">{{ proj.title }}</div>
                        <div class="table-proj-desc">{{ proj.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="chip">{{ proj.category }}</span>
                  </td>
                  <td>
                    <div class="tech-chips">
                      @for (t of proj.technologies; track t) {
                        <span class="tech-chip">{{ t }}</span>
                      }
                    </div>
                  </td>
                  <td>{{ proj.order }}</td>
                  <td>
                    @if (proj.featured) {
                      <span class="badge badge--success">Featured</span>
                    } @else {
                      <span class="badge">Standard</span>
                    }
                  </td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="icon-btn icon-btn--edit"
                        title="Edit project"
                        (click)="openEditModal(proj)"
                      >
                        <app-icon name="edit" />
                      </button>
                      <button
                        type="button"
                        class="icon-btn icon-btn--delete"
                        title="Delete project"
                        (click)="confirmDelete(proj)"
                      >
                        <app-icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Project Modal Form -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>{{ editingId() ? 'Edit Project' : 'Add New Project' }}</h2>
              <button type="button" class="close-btn" (click)="closeModal()">
                <app-icon name="close" />
              </button>
            </header>

            <form [formGroup]="form" (ngSubmit)="saveProject()" class="modal-form">
              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="proj-title">Project Title *</label>
                  <div class="field__control">
                    <input
                      id="proj-title"
                      type="text"
                      formControlName="title"
                      placeholder="e.g. Aurora Analytics"
                      required
                    />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="proj-category">Category *</label>
                  <div class="field__control">
                    <select id="proj-category" formControlName="category" required>
                      <option value="Frontend">Frontend</option>
                      <option value="Full-Stack">Full-Stack</option>
                      <option value="UI / UX">UI / UX</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="proj-desc">Short Description *</label>
                <div class="field__control">
                  <textarea
                    id="proj-desc"
                    rows="2"
                    formControlName="description"
                    placeholder="Short summary displayed on cards"
                    required
                  ></textarea>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="proj-long-desc">Detailed Description</label>
                <div class="field__control">
                  <textarea
                    id="proj-long-desc"
                    rows="3"
                    formControlName="longDescription"
                    placeholder="Full details displayed in project dialog modal"
                  ></textarea>
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="proj-tech">Technologies (comma separated)</label>
                  <div class="field__control">
                    <input
                      id="proj-tech"
                      type="text"
                      formControlName="technologiesInput"
                      placeholder="Angular, TypeScript, CSS, Signals"
                    />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="proj-year">Year</label>
                  <div class="field__control">
                    <input id="proj-year" type="text" formControlName="year" placeholder="2026" />
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="proj-live">Live Demo URL</label>
                  <div class="field__control">
                    <input
                      id="proj-live"
                      type="url"
                      formControlName="liveUrl"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="proj-github">GitHub Repository URL</label>
                  <div class="field__control">
                    <input
                      id="proj-github"
                      type="url"
                      formControlName="githubUrl"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>

              <!-- Image & File Upload -->
              <div class="field">
                <label class="field__label">Project Image</label>
                <div class="upload-control">
                  <div class="field__control flex-1">
                    <input
                      type="text"
                      formControlName="image"
                      placeholder="Image URL or upload a file"
                    />
                  </div>
                  <label class="btn btn--ghost btn--sm upload-btn">
                    @if (uploading()) {
                      <app-icon name="refresh" class="spin" />
                      Uploading...
                    } @else {
                      <app-icon name="upload" />
                      Upload File
                    }
                    <input
                      type="file"
                      (change)="onFileSelected($event)"
                      accept="image/*"
                      [disabled]="uploading()"
                      hidden
                    />
                  </label>
                </div>
                @if (form.get('image')?.value) {
                  <div class="image-preview" style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.6rem;">
                    <img [src]="form.get('image')?.value | assetUrl" (error)="onImageError($event)" alt="Preview" class="table-proj-thumb" />
                    <span style="font-size: 0.75rem; color: var(--muted); word-break: break-all;">{{ form.get('image')?.value }}</span>
                  </div>
                }
              </div>

              <div class="form-row form-row--inline">
                <div class="field">
                  <label class="field__label" for="proj-order">Display Order</label>
                  <div class="field__control">
                    <input
                      id="proj-order"
                      type="number"
                      formControlName="order"
                      min="0"
                      style="width: 6rem"
                    />
                  </div>
                </div>

                <div class="checkbox-field">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="featured" />
                    <span>Feature on homepage</span>
                  </label>
                </div>
              </div>

              <footer class="modal-form__actions">
                <button type="button" class="btn btn--ghost" (click)="closeModal()">Cancel</button>
                <button
                  type="submit"
                  class="btn btn--primary"
                  [disabled]="saving() || form.invalid"
                >
                  @if (saving()) {
                    <app-icon name="refresh" class="spin" />
                    Saving...
                  } @else {
                    <app-icon name="check" />
                    Save Project
                  }
                </button>
              </footer>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (projectToDelete(); as target) {
        <div class="modal-backdrop" (click)="projectToDelete.set(null)">
          <div class="modal-card modal-card--sm glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>Confirm Deletion</h2>
              <button type="button" class="close-btn" (click)="projectToDelete.set(null)">
                <app-icon name="close" />
              </button>
            </header>
            <div class="modal-card__body">
              <p>
                Are you sure you want to delete <strong>{{ target.title }}</strong>? This action
                cannot be undone.
              </p>
            </div>
            <footer class="modal-form__actions">
              <button type="button" class="btn btn--ghost" (click)="projectToDelete.set(null)">
                Cancel
              </button>
              <button
                type="button"
                class="btn btn--danger"
                [disabled]="deleting()"
                (click)="executeDelete(target)"
              >
                @if (deleting()) {
                  <app-icon name="refresh" class="spin" />
                  Deleting...
                } @else {
                  <app-icon name="trash" />
                  Delete Permanently
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

    .projects-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      border-radius: var(--r-md);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;
    }

    .data-table th {
      text-align: left;
      padding: 0.85rem 1rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--faint);
      border-bottom: 1px solid var(--line);
      background: rgba(15, 23, 42, 0.4);
    }

    .data-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid var(--line);
      vertical-align: middle;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .table-proj-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      max-width: 20rem;
    }

    .table-proj-thumb {
      width: 3rem;
      height: 2.25rem;
      object-fit: cover;
      border-radius: var(--r-xs);
      border: 1px solid var(--line);
      flex-shrink: 0;
    }

    .table-proj-placeholder {
      width: 3rem;
      height: 2.25rem;
      display: grid;
      place-items: center;
      background: rgba(148, 163, 184, 0.06);
      border-radius: var(--r-xs);
      border: 1px solid var(--line);
      color: var(--faint);
      flex-shrink: 0;
    }

    .table-proj-title {
      font-weight: 600;
      color: var(--text);
    }

    .table-proj-desc {
      font-size: 0.76rem;
      color: var(--faint);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 15rem;
    }

    .tech-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      max-width: 14rem;
    }

    .tech-chip {
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      border-radius: var(--r-pill);
      background: rgba(148, 163, 184, 0.08);
      color: var(--text-soft);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--r-pill);
      background: rgba(148, 163, 184, 0.08);
      color: var(--faint);
    }

    .badge--success {
      background: var(--success-soft);
      color: var(--success);
      border: 1px solid rgba(52, 211, 153, 0.25);
    }

    .text-right {
      text-align: right;
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
      background: rgba(15, 23, 42, 0.4);
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
      max-width: 42rem;
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
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--text);
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

    .form-row--inline {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .field__control input,
    .field__control textarea,
    .field__control select {
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
    .field__control textarea:focus,
    .field__control select:focus {
      outline: none;
      border-color: var(--accent-bright);
      box-shadow: 0 0 0 3px rgba(99, 164, 255, 0.15);
    }

    .upload-control {
      display: flex;
      gap: 0.5rem;
    }

    .flex-1 {
      flex: 1;
    }

    .upload-btn {
      cursor: pointer;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      margin-top: 1.2rem;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--text-soft);
      cursor: pointer;
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

    .btn--danger:hover {
      background: #e11d48;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProjectsPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PortfolioApiService);
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  protected readonly projects = signal<Project[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly uploading = signal(false);

  protected readonly showModal = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly projectToDelete = signal<Project | null>(null);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    longDescription: [''],
    category: ['Frontend' as ProjectCategory, Validators.required],
    technologiesInput: [''],
    year: [''],
    liveUrl: [''],
    githubUrl: [''],
    image: [''],
    order: [0],
    featured: [false],
  });

  constructor() {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load projects from server.', 'error');
      },
    });
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      longDescription: '',
      category: 'Frontend',
      technologiesInput: '',
      year: new Date().getFullYear().toString(),
      liveUrl: '',
      githubUrl: '',
      image: '',
      order: this.projects().length + 1,
      featured: false,
    });
    this.showModal.set(true);
  }

  openEditModal(project: Project): void {
    const id = project.id || (project as any)._id;
    this.editingId.set(id);
    this.form.patchValue({
      title: project.title,
      description: project.description,
      longDescription: project.longDescription || '',
      category: project.category,
      technologiesInput: (project.technologies || []).join(', '),
      year: project.year || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      image: project.image || '',
      order: project.order ?? 0,
      featured: Boolean(project.featured),
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.api.uploadFile(file).subscribe({
      next: (res: UploadResponse) => {
        this.uploading.set(false);
        this.form.patchValue({
          image: res.url,
        });
        this.toast.show('Image uploaded successfully.', 'success');
      },
      error: (err) => {
        this.uploading.set(false);
        const msg = err?.error?.message || 'Upload failed.';
        this.toast.show(msg, 'error');
      },
    });
  }

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = '/assets/images/projects/aurora.svg';
    }
  }

  saveProject(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.getRawValue();
    const technologies = (val.technologiesInput || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<Project> = {
      title: val.title!,
      description: val.description!,
      longDescription: val.longDescription || '',
      category: val.category!,
      technologies,
      year: val.year || '',
      liveUrl: val.liveUrl || '',
      githubUrl: val.githubUrl || '',
      image: val.image || '',
      order: Number(val.order) || 0,
      featured: Boolean(val.featured),
    };

    const id = this.editingId();
    const request$ = id ? this.api.updateProject(id, payload) : this.api.createProject(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show(
          id ? 'Project updated successfully.' : 'Project created successfully.',
          'success',
        );
        this.closeModal();
        this.loadProjects();
        this.store.reloadProjects();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save project.';
        this.toast.show(msg, 'error');
      },
    });
  }

  confirmDelete(project: Project): void {
    this.projectToDelete.set(project);
  }

  executeDelete(project: Project): void {
    const id = project.id || (project as any)._id;
    this.deleting.set(true);
    this.api.deleteProject(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.projectToDelete.set(null);
        this.toast.show('Project deleted successfully.', 'success');
        this.loadProjects();
        this.store.reloadProjects();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message || 'Failed to delete project.';
        this.toast.show(msg, 'error');
      },
    });
  }
}
