import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { IconComponent } from '../../shared/components/icon/icon';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-experience',
  imports: [IconComponent, SectionHeadingComponent, EmptyStateComponent, RevealDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  private readonly store = inject(PortfolioStore);

  protected readonly experience = this.store.experience;
  protected readonly loading = this.store.loading;

  protected retry(): void {
    this.store.retry();
  }
}
