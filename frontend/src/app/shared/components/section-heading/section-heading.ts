import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  template: `
    <div class="head" [class.head--center]="align() === 'center'">
      @if (eyebrow()) {
        <span class="eyebrow">{{ eyebrow() }}</span>
      }
      <h2 class="head__title" [id]="headingId() || null">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="head__subtitle">{{ subtitle() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: clamp(2.25rem, 4vw, 3.25rem);
    }

    .head {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.85rem;
      max-width: 46rem;
    }

    .head--center {
      align-items: center;
      text-align: center;
      margin-inline: auto;
    }

    .head__title {
      font-size: clamp(1.85rem, 4vw, 2.75rem);
      font-weight: 700;
      letter-spacing: -0.035em;
      line-height: 1.1;
    }

    .head__subtitle {
      color: var(--muted);
      font-size: clamp(0.95rem, 1.5vw, 1.05rem);
      line-height: 1.7;
      max-width: 40rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeadingComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly align = input<'left' | 'center'>('left');
  readonly headingId = input('');
}
