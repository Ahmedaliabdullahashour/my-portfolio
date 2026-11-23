import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PortfolioApiService, type UploadResponse } from '../../../../core/services/portfolio-api.service';
import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import type { PortfolioSettings } from '../../../../core/models';

type SettingsTab = 'profile' | 'about' | 'cv' | 'socials';

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="admin-page">
      <header class="admin-page__head">
        <div>
          <a class="admin-page__back" routerLink="/admin">
            <app-icon name="arrow-right" />
            Back to overview
          </a>
          <h1 class="admin-page__title">Portfolio Settings</h1>
          <p class="admin-page__desc">Configure your personal information, hero titles, biography, downloadable CV, and social media links.</p>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button
          type="button"
          class="tab-btn"
          [class.is-active]="activeTab() === 'profile'"
          (click)="activeTab.set('profile')"
        >
          <app-icon name="user" />
          Profile & Identity
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.is-active]="activeTab() === 'about'"
          (click)="activeTab.set('about')"
        >
          <app-icon name="sparkles" />
          About & Biography
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.is-active]="activeTab() === 'cv'"
          (click)="activeTab.set('cv')"
        >
          <app-icon name="download" />
          CV & Resume
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.is-active]="activeTab() === 'socials'"
          (click)="activeTab.set('socials')"
        >
          <app-icon name="link" />
          Social Links
        </button>
      </div>

      @if (loading()) {
        <div class="admin-page__loading">
          <app-icon name="refresh" class="spin" />
          <span>Loading portfolio settings...</span>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="saveSettings()" class="settings-form">
          <!-- TAB 1: Profile & Identity -->
          @if (activeTab() === 'profile') {
            <div class="form-section glass">
              <h2 class="form-section__title">Identity & Hero Content</h2>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="set-name">Full Name *</label>
                  <div class="field__control">
                    <input id="set-name" type="text" formControlName="name" required />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="set-short-name">Display / Short Name *</label>
                  <div class="field__control">
                    <input id="set-short-name" type="text" formControlName="shortName" required />
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="set-title">Professional Title *</label>
                  <div class="field__control">
                    <input id="set-title" type="text" formControlName="title" placeholder="e.g. Front-End Developer" required />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="set-email">Email Address *</label>
                  <div class="field__control">
                    <input id="set-email" type="email" formControlName="email" required />
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label class="field__label" for="set-loc">Location</label>
                  <div class="field__control">
                    <input id="set-loc" type="text" formControlName="location" placeholder="e.g. Cairo, Egypt" />
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="set-avail">Availability Badge</label>
                  <div class="field__control">
                    <input id="set-avail" type="text" formControlName="availability" placeholder="e.g. Open to opportunities" />
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="set-tagline">Tagline</label>
                <div class="field__control">
                  <input id="set-tagline" type="text" formControlName="tagline" placeholder="Headline displayed below your name" />
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="set-intro">Hero Introduction</label>
                <div class="field__control">
                  <textarea id="set-intro" rows="3" formControlName="intro"></textarea>
                </div>
              </div>

              <!-- Profile Image Upload -->
              <div class="field">
                <label class="field__label">Profile Photo</label>
                <div class="upload-control">
                  <div class="field__control flex-1">
                    <input type="text" formControlName="profileImage" placeholder="Image URL or upload a file" />
                  </div>
                  <label class="btn btn--ghost btn--sm upload-btn">
                    @if (uploadingImage()) {
                      <app-icon name="refresh" class="spin" />
                      Uploading...
                    } @else {
                      <app-icon name="upload" />
                      Upload Photo
                    }
                    <input type="file" (change)="onProfileImageSelected($event)" accept="image/*" [disabled]="uploadingImage()" hidden />
                  </label>
                </div>
              </div>
            </div>
          }

          <!-- TAB 2: About & Biography -->
          @if (activeTab() === 'about') {
            <div class="form-section glass">
              <h2 class="form-section__title">About & Biography Paragraphs</h2>
              <p class="form-section__desc">Each paragraph is rendered sequentially in the public About section.</p>

              <div class="field">
                <label class="field__label" for="set-bio">Biography (enter paragraphs separated by blank lines)</label>
                <div class="field__control">
                  <textarea id="set-bio" rows="8" formControlName="bioText" placeholder="Write paragraphs separated by double enters..."></textarea>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="set-goals">Career Goals (one goal per line)</label>
                <div class="field__control">
                  <textarea id="set-goals" rows="5" formControlName="careerGoalsText" placeholder="One goal per line..."></textarea>
                </div>
              </div>
            </div>
          }

          <!-- TAB 3: CV & Downloads -->
          @if (activeTab() === 'cv') {
            <div class="form-section glass">
              <h2 class="form-section__title">Curriculum Vitae (CV / Resume)</h2>
              <p class="form-section__desc">Upload your latest PDF CV so visitors can download it from your portfolio.</p>

              <div class="field">
                <label class="field__label" for="set-cv-url">CV Document URL / Path</label>
                <div class="upload-control">
                  <div class="field__control flex-1">
                    <input id="set-cv-url" type="text" formControlName="cvUrl" placeholder="assets/cv/ahmed-ashour-cv.pdf" />
                  </div>
                  <label class="btn btn--primary btn--sm upload-btn">
                    @if (uploadingCv()) {
                      <app-icon name="refresh" class="spin" />
                      Uploading CV...
                    } @else {
                      <app-icon name="upload" />
                      Upload New PDF
                    }
                    <input type="file" (change)="onCvFileSelected($event)" accept="application/pdf" [disabled]="uploadingCv()" hidden />
                  </label>
                </div>
              </div>

              @if (form.get('cvUrl')?.value) {
                <div class="cv-preview">
                  <app-icon name="file-code" />
                  <span>Current CV: <strong>{{ form.get('cvUrl')?.value }}</strong></span>
                  <a [href]="form.get('cvUrl')?.value" target="_blank" rel="noopener" class="btn btn--ghost btn--sm">
                    <app-icon name="external-link" />
                    Preview CV
                  </a>
                </div>
              }
            </div>
          }

          <!-- TAB 4: Social Links -->
          @if (activeTab() === 'socials') {
            <div class="form-section glass">
              <div class="form-section__head">
                <div>
                  <h2 class="form-section__title">Social & Profile Links</h2>
                  <p class="form-section__desc">Links displayed in the navigation bar, hero, and footer.</p>
                </div>
                <button type="button" class="btn btn--ghost btn--sm" (click)="addSocialLink()">
                  <app-icon name="plus" />
                  Add Link
                </button>
              </div>

              <div formArrayName="socials" class="socials-list">
                @for (item of socialsArray.controls; track $index) {
                  <div [formGroupName]="$index" class="social-row">
                    <div class="field">
                      <label class="field__label">Platform / Label</label>
                      <div class="field__control">
                        <input type="text" formControlName="label" placeholder="e.g. GitHub" />
                      </div>
                    </div>

                    <div class="field">
                      <label class="field__label">Icon</label>
                      <div class="field__control">
                        <select formControlName="icon">
                          <option value="github">github</option>
                          <option value="linkedin">linkedin</option>
                          <option value="mail">mail</option>
                          <option value="link">link</option>
                          <option value="external-link">external-link</option>
                        </select>
                      </div>
                    </div>

                    <div class="field flex-2">
                      <label class="field__label">URL</label>
                      <div class="field__control">
                        <input type="text" formControlName="url" placeholder="https://..." />
                      </div>
                    </div>

                    <button type="button" class="icon-btn icon-btn--delete remove-social-btn" (click)="removeSocialLink($index)">
                      <app-icon name="trash" />
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <footer class="settings-form__save">
            <button type="submit" class="btn btn--primary" [disabled]="saving() || form.invalid">
              @if (saving()) {
                <app-icon name="refresh" class="spin" />
                Saving Changes...
              } @else {
                <app-icon name="check" />
                Save Portfolio Settings
              }
            </button>
          </footer>
        </form>
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

    .tabs-nav {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--line);
      padding-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      border-radius: var(--r-sm);
      border: 1px solid transparent;
      background: none;
      color: var(--muted);
      font-family: var(--font-display);
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s var(--ease);
    }

    .tab-btn:hover {
      color: var(--text);
      background: rgba(148, 163, 184, 0.06);
    }

    .tab-btn.is-active {
      color: #fff;
      background: var(--accent-soft);
      border-color: var(--accent-line);
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      padding: 1.75rem;
      border-radius: var(--r-lg);
      border: 1px solid var(--line);
      display: grid;
      gap: 1.25rem;
    }

    .form-section__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .form-section__title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text);
    }

    .form-section__desc {
      font-size: 0.82rem;
      color: var(--muted);
      margin-top: 0.2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .flex-2 {
      flex: 2;
    }

    .upload-btn {
      cursor: pointer;
    }

    .cv-preview {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      border-radius: var(--r-sm);
      background: rgba(59, 130, 246, 0.06);
      border: 1px solid rgba(59, 130, 246, 0.2);
      font-size: 0.85rem;
    }

    .socials-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .social-row {
      display: flex;
      align-items: flex-end;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .remove-social-btn {
      margin-bottom: 0.25rem;
    }

    .icon-btn {
      display: inline-grid;
      place-items: center;
      width: 2.2rem;
      height: 2.2rem;
      border-radius: var(--r-xs);
      border: 1px solid var(--line);
      background: rgba(15, 23, 42, 0.5);
      color: var(--muted);
      cursor: pointer;
    }

    .icon-btn--delete:hover {
      border-color: rgba(251, 113, 133, 0.4);
      background: var(--danger-soft);
      color: var(--danger);
    }

    .settings-form__save {
      display: flex;
      justify-content: flex-end;
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
export class AdminSettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PortfolioApiService);
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  protected readonly activeTab = signal<SettingsTab>('profile');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly uploadingImage = signal(false);
  protected readonly uploadingCv = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    shortName: ['', Validators.required],
    title: ['', Validators.required],
    tagline: [''],
    intro: [''],
    email: ['', [Validators.required, Validators.email]],
    location: [''],
    availability: [''],
    profileImage: [''],
    cvUrl: [''],
    bioText: [''],
    careerGoalsText: [''],
    socials: this.fb.array([]),
  });

  get socialsArray(): FormArray {
    return this.form.get('socials') as FormArray;
  }

  constructor() {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.api.getSettings().subscribe({
      next: (data) => {
        this.loading.set(false);
        this.populateForm(data);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load portfolio settings.', 'error');
      },
    });
  }

  private populateForm(settings: PortfolioSettings): void {
    this.form.patchValue({
      name: settings.name,
      shortName: settings.shortName,
      title: settings.title,
      tagline: settings.tagline || '',
      intro: settings.intro || '',
      email: settings.email,
      location: settings.location || '',
      availability: settings.availability || '',
      profileImage: settings.profileImage || '',
      cvUrl: settings.cvUrl || '',
      bioText: (settings.bio || []).join('\n\n'),
      careerGoalsText: (settings.careerGoals || []).join('\n'),
    });

    this.socialsArray.clear();
    (settings.socials || []).forEach((s) => {
      this.socialsArray.push(
        this.fb.group({
          label: [s.label, Validators.required],
          icon: [s.icon, Validators.required],
          url: [s.url],
        })
      );
    });
  }

  addSocialLink(): void {
    this.socialsArray.push(
      this.fb.group({
        label: ['New Link', Validators.required],
        icon: ['link', Validators.required],
        url: ['https://'],
      })
    );
  }

  removeSocialLink(index: number): void {
    this.socialsArray.removeAt(index);
  }

  onProfileImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    this.uploadingImage.set(true);
    this.api.uploadFile(file).subscribe({
      next: (res: UploadResponse) => {
        this.uploadingImage.set(false);
        this.form.patchValue({ profileImage: res.url });
        this.toast.show('Profile image uploaded.', 'success');
      },
      error: (err) => {
        this.uploadingImage.set(false);
        const msg = err?.error?.message || 'Image upload failed.';
        this.toast.show(msg, 'error');
      },
    });
  }

  onCvFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    this.uploadingCv.set(true);
    this.api.uploadFile(file).subscribe({
      next: (res: UploadResponse) => {
        this.uploadingCv.set(false);
        this.form.patchValue({ cvUrl: res.url });
        this.toast.show('CV PDF uploaded successfully.', 'success');
      },
      error: (err) => {
        this.uploadingCv.set(false);
        const msg = err?.error?.message || 'CV upload failed.';
        this.toast.show(msg, 'error');
      },
    });
  }

  saveSettings(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.getRawValue();

    const bio = (val.bioText || '')
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const careerGoals = (val.careerGoalsText || '')
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean);

    const payload: Partial<PortfolioSettings> = {
      name: val.name!,
      shortName: val.shortName!,
      title: val.title!,
      tagline: val.tagline || '',
      intro: val.intro || '',
      email: val.email!,
      location: val.location || '',
      availability: val.availability || '',
      profileImage: val.profileImage || '',
      cvUrl: val.cvUrl || '',
      bio,
      careerGoals,
      socials: val.socials as any,
    };

    this.api.updateSettings(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Portfolio settings saved successfully.', 'success');
        this.store.reloadSettings();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || 'Failed to save settings.';
        this.toast.show(msg, 'error');
      },
    });
  }
}
