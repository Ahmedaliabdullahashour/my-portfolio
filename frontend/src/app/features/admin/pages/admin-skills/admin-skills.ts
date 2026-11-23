import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PortfolioApiService } from '../../../../core/services/portfolio-api.service';
import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import type { Skill, SkillCategory } from '../../../../core/models';

const SKILL_CATEGORIES: SkillCategory[] = [
  'Frontend',
  'Backend',
  'Programming',
  'Computer Science',
];

const AVAILABLE_ICONS = [
  'code',
  'palette',
  'braces',
  'file-code',
  'layers',
  'server',
  'route',
  'database',
  'cpu',
  'boxes',
  'git-branch',
  'workflow',
  'terminal',
  'sparkles',
  'shield',
];

@Component({
  selector: 'app-admin-skills',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="admin-page">
      <header class="admin-page__head">
        <div>
          <a class="admin-page__back" routerLink="/admin">
            <app-icon name="arrow-right" />
            Back to overview
          </a>
          <h1 class="admin-page__title">Skills Management</h1>
          <p class="admin-page__desc">Manage technical proficiencies, categories, icons, and proficiency ratings.</p>
        </div>
        <button type="button" class="btn btn--primary" (click)="openCreateModal()">
          <app-icon name="plus" />
          Add Skill
        </button>
      </header>

      @if (loading()) {
        <div class="admin-page__loading">
          <app-icon name="refresh" class="spin" />
          <span>Loading skills...</span>
        </div>
      } @else if (skills().length === 0) {
        <div class="empty-card glass">
          <app-icon name="target" />
          <h3>No skills configured</h3>
          <p>Add technical skills to highlight your expertise.</p>
          <button type="button" class="btn btn--primary btn--sm" (click)="openCreateModal()">
            <app-icon name="plus" />
            Add First Skill
          </button>
        </div>
      } @else {
        <div class="categories-grid">
          @for (cat of categories(); track cat) {
            <section class="cat-card glass">
              <header class="cat-card__head">
                <h2 class="cat-card__title">{{ cat }}</h2>
                <span class="chip">{{ getSkillsForCat(cat).length }}</span>
              </header>

              <div class="skills-list">
                @for (skill of getSkillsForCat(cat); track skill.id || $index) {
                  <div class="skill-item">
                    <span class="skill-item__icon">
                      <app-icon [name]="skill.icon || 'code'" />
                    </span>
                    <div class="skill-item__info">
                      <div class="skill-item__top">
                        <span class="skill-item__name">{{ skill.name }}</span>
                        <span class="skill-item__level">{{ skill.level }}%</span>
                      </div>
                      <div class="skill-item__bar-bg">
                        <div class="skill-item__bar-fill" [style.width.%]="skill.level"></div>
                      </div>
                      @if (skill.note) {
                        <span class="skill-item__note">{{ skill.note }}</span>
                      }
                    </div>

                    <div class="skill-item__actions">
                      <button
                        type="button"
                        class="icon-btn icon-btn--edit"
                        title="Edit skill"
                        (click)="openEditModal(skill)"
                      >
                        <app-icon name="edit" />
                      </button>
                      <button
                        type="button"
                        class="icon-btn icon-btn--delete"
                        title="Delete skill"
                        (click)="confirmDelete(skill)"
                      >
                        <app-icon name="trash" />
                      </button>
                    </div>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }

      <!-- Skill Modal Form -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card modal-card--sm glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>{{ editingId() ? 'Edit Skill' : 'Add New Skill' }}</h2>
              <button type="button" class="close-btn" (click)="closeModal()">
                <app-icon name="close" />
              </button>
            </header>

            <form [formGroup]="form" (ngSubmit)="saveSkill()" class="modal-form">
              <div class="field">
                <label class="field__label" for="skill-name">Skill Name *</label>
                <div class="field__control">
                  <input id="skill-name" type="text" formControlName="name" placeholder="e.g. Angular, Node.js" required />
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="skill-cat">Category *</label>
                <div class="field__control">
                  <select id="skill-cat" formControlName="category" required>
                    @for (c of categoriesList; track c) {
                      <option [value]="c">{{ c }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="field">
                <div class="slider-head">
                  <label class="field__label" for="skill-level">Proficiency Level</label>
                  <span class="slider-val">{{ form.get('level')?.value }}%</span>
                </div>
                <div class="field__control">
                  <input id="skill-level" type="range" formControlName="level" min="0" max="100" step="1" />
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="skill-icon">Icon</label>
                <div class="field__control">
                  <select id="skill-icon" formControlName="icon">
                    @for (iconName of availableIcons; track iconName) {
                      <option [value]="iconName">{{ iconName }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="skill-note">Note / Subtitle</label>
                <div class="field__control">
                  <input id="skill-note" type="text" formControlName="note" placeholder="e.g. Standalone, signals, routing" />
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
                    Save Skill
                  }
                </button>
              </footer>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (skillToDelete(); as target) {
        <div class="modal-backdrop" (click)="skillToDelete.set(null)">
          <div class="modal-card modal-card--sm glass" (click)="$event.stopPropagation()">
            <header class="modal-card__head">
              <h2>Confirm Deletion</h2>
              <button type="button" class="close-btn" (click)="skillToDelete.set(null)">
                <app-icon name="close" />
              </button>
            </header>
            <div class="modal-card__body">
              <p>Are you sure you want to remove <strong>{{ target.name }}</strong> from your skills?</p>
            </div>
            <footer class="modal-form__actions">
              <button type="button" class="btn btn--ghost" (click)="skillToDelete.set(null)">Cancel</button>
              <button type="button" class="btn btn--danger" [disabled]="deleting()" (click)="executeDelete(target)">
                @if (deleting()) {
                  <app-icon name="refresh" class="spin" />
                  Deleting...
                } @else {
                  <app-icon name="trash" />
                  Delete Skill
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

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
      gap: 1.25rem;
    }

    .cat-card {
      padding: 1.25rem;
      border-radius: var(--r-md);
      border: 1px solid var(--line);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cat-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--line);
    }

    .cat-card__title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }

    .skills-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skill-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.85rem;
      border-radius: var(--r-sm);
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--line);
    }

    .skill-item__icon {
      width: 2.2rem;
      height: 2.2rem;
      display: grid;
      place-items: center;
      border-radius: var(--r-xs);
      background: rgba(59, 130, 246, 0.1);
      color: var(--accent-bright);
      font-size: 1rem;
      flex-shrink: 0;
    }

    .skill-item__info {
      flex: 1;
      min-width: 0;
    }

    .skill-item__top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .skill-item__name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
    }

    .skill-item__level {
      font-size: 0.75rem;
      color: var(--faint);
      font-family: var(--font-mono);
    }

    .skill-item__bar-bg {
      height: 4px;
      border-radius: 2px;
      background: rgba(148, 163, 184, 0.15);
      overflow: hidden;
    }

    .skill-item__bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--accent-bright));
      border-radius: 2px;
    }

    .skill-item__note {
      display: block;
      font-size: 0.72rem;
      color: var(--faint);
      margin-top: 0.25rem;
    }

    .skill-item__actions {
      display: flex;
      gap: 0.3rem;
    }

    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 1.85rem;
      height: 1.85rem;
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

    .slider-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .slider-val {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--accent-bright);
    }

    .field__control input,
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

    .field__control input[type="range"] {
      padding: 0;
      cursor: pointer;
      accent-color: var(--accent-bright);
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSkillsPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PortfolioApiService);
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  protected readonly categoriesList = SKILL_CATEGORIES;
  protected readonly availableIcons = AVAILABLE_ICONS;

  protected readonly skills = signal<Skill[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);

  protected readonly showModal = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly skillToDelete = signal<Skill | null>(null);

  protected readonly categories = computed(() => {
    const set = new Set(this.skills().map((s) => s.category));
    return SKILL_CATEGORIES.filter((c) => set.has(c)).concat(
      Array.from(set).filter((c) => !SKILL_CATEGORIES.includes(c))
    );
  });

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    category: ['Frontend' as SkillCategory, Validators.required],
    level: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
    icon: ['code'],
    note: [''],
  });

  constructor() {
    this.loadSkills();
  }

  loadSkills(): void {
    this.loading.set(true);
    this.api.getSkills().subscribe({
      next: (data) => {
        this.skills.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load skills.', 'error');
      },
    });
  }

  getSkillsForCat(cat: string): Skill[] {
    return this.skills().filter((s) => s.category === cat);
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      category: 'Frontend',
      level: 80,
      icon: 'code',
      note: '',
    });
    this.showModal.set(true);
  }

  openEditModal(skill: Skill): void {
    const id = skill.id || (skill as any)._id;
    this.editingId.set(id);
    this.form.patchValue({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon || 'code',
      note: skill.note || '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveSkill(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.getRawValue();

    const payload: Partial<Skill> = {
      name: val.name!,
      category: val.category!,
      level: Number(val.level) || 50,
      icon: val.icon || 'code',
      note: val.note || '',
    };

    const id = this.editingId();
    const req$ = id ? this.api.updateSkill(id, payload) : this.api.createSkill(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show(id ? 'Skill updated successfully.' : 'Skill created successfully.', 'success');
        this.closeModal();
        this.loadSkills();
        this.store.reloadSkills();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save skill.';
        this.toast.show(msg, 'error');
      },
    });
  }

  confirmDelete(skill: Skill): void {
    this.skillToDelete.set(skill);
  }

  executeDelete(skill: Skill): void {
    const id = skill.id || (skill as any)._id;
    this.deleting.set(true);
    this.api.deleteSkill(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.skillToDelete.set(null);
        this.toast.show('Skill deleted successfully.', 'success');
        this.loadSkills();
        this.store.reloadSkills();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message || 'Failed to delete skill.';
        this.toast.show(msg, 'error');
      },
    });
  }
}
