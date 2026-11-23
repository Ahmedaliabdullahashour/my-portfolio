import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Skill } from '../../../../core/models';
import { IconComponent } from '../../../../shared/components/icon/icon';

const CIRCUMFERENCE = 2 * Math.PI * 42;

@Component({
  selector: 'app-skill-card',
  imports: [IconComponent],
  template: `
    <article class="skill">
      <div class="skill__top">
        <span class="skill__icon"><app-icon [name]="skill().icon" /></span>

        <div class="skill__ring" [style.--offset]="dashOffset()">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle class="ring__track" cx="50" cy="50" r="42" />
            <circle class="ring__value" cx="50" cy="50" r="42" />
          </svg>
          <span class="skill__level">
            {{ skill().level }}<small>%</small>
          </span>
        </div>
      </div>

      <div class="skill__body">
        <h3 class="skill__name">{{ skill().name }}</h3>
        @if (skill().note) {
          <p class="skill__note">{{ skill().note }}</p>
        }
      </div>

      <span class="skill__category">{{ skill().category }}</span>
      <span class="skill__meter" aria-hidden="true">
        <span class="skill__meter-fill" [style.width.%]="skill().level"></span>
      </span>

      <span class="sr-only">{{ skill().name }} proficiency: {{ skill().level }} percent</span>
    </article>
  `,
  styleUrl: './skill-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillCardComponent {
  readonly skill = input.required<Skill>();

  protected readonly dashOffset = computed(
    () => CIRCUMFERENCE * (1 - this.skill().level / 100),
  );
}
