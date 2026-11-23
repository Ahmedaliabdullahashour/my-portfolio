import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { IconComponent } from '../../shared/components/icon/icon';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-education',
  imports: [IconComponent, SectionHeadingComponent, EmptyStateComponent, RevealDirective],
  templateUrl: './education.html',
  styleUrl: './education.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  private readonly store = inject(PortfolioStore);

  protected readonly education = this.store.education;
  protected readonly loading = this.store.loading;

  protected readonly courses = computed(
    () =>
      this.education().flatMap((item) =>
        (item.relevantCourses ?? []).map((course) => ({ course, institution: item.institution })),
      ),
  );

  protected retry(): void {
    this.store.retry();
  }
}
