import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ContactService } from '../../core/services/contact.service';
import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { SocialLinksComponent } from '../../shared/components/social-links/social-links';
import { RevealDirective } from '../../shared/directives/reveal.directive';

type Feedback = { type: 'success' | 'error'; message: string };

@Component({
  selector: 'app-contact',
  imports: [
    ReactiveFormsModule,
    IconComponent,
    SectionHeadingComponent,
    SocialLinksComponent,
    RevealDirective,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly toast = inject(ToastService);
  private readonly store = inject(PortfolioStore);

  protected readonly settings = this.store.settings;
  protected readonly socials = computed(() => this.store.settings()?.socials ?? []);

  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    message: [
      '',
      [Validators.required, Validators.minLength(20), Validators.maxLength(2000)],
    ],
  });

  protected get nameControl(): AbstractControl {
    return this.form.controls.name;
  }
  protected get emailControl(): AbstractControl {
    return this.form.controls.email;
  }
  protected get subjectControl(): AbstractControl {
    return this.form.controls.subject;
  }
  protected get messageControl(): AbstractControl {
    return this.form.controls.message;
  }

  protected showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.feedback.set(null);

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    this.sending.set(true);

    this.contactService.send(this.form.getRawValue()).subscribe((response) => {
      this.sending.set(false);
      this.feedback.set({
        type: response.success ? 'success' : 'error',
        message: response.message,
      });

      if (response.success) {
        this.form.reset();
        this.submitted.set(false);
        this.toast.show('Message submitted successfully.', 'success');
      } else {
        this.toast.show('Your message could not be sent.', 'error');
      }
    });
  }

  protected async copyEmail(): Promise<void> {
    const email = this.settings()?.email;
    if (!email) {
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      this.toast.show('Email address copied to clipboard.', 'success');
    } catch {
      this.toast.show(`Email address: ${email}`, 'info');
    }
  }

  private focusFirstInvalid(): void {
    
    setTimeout(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        'form .field__control.is-invalid input, form .field__control.is-invalid textarea',
      );
      firstInvalid?.focus();
    });
  }
}
