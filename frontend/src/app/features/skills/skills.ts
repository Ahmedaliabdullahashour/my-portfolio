import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import type { SkillCategory } from '../../core/models';
import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SkillCardComponent } from './components/skill-card/skill-card';

type Filter = SkillCategory | 'All';

const CATEGORY_ORDER: SkillCategory[] = [
  'Frontend',
  'Backend',
  'Programming',
  'Computer Science',
];

@Component({
  selector: 'app-skills',
  imports: [SectionHeadingComponent, SkillCardComponent, EmptyStateComponent, RevealDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  private readonly store = inject(PortfolioStore);

  protected readonly skills = this.store.skills;
  protected readonly loading = this.store.loading;
  protected readonly activeFilter = signal<Filter>('All');

  protected readonly categories = computed(() => {
    const present = new Set(this.skills().map((skill) => skill.category));
    return CATEGORY_ORDER.filter((category) => present.has(category));
  });

  protected readonly filters = computed<{ label: Filter; count: number }[]>(() => {
    const skills = this.skills();
    return [
      { label: 'All', count: skills.length },
      ...this.categories().map((category) => ({
        label: category as Filter,
        count: skills.filter((skill) => skill.category === category).length,
      })),
    ];
  });

  protected readonly visibleSkills = computed(() => {
    const filter = this.activeFilter();
    const skills = this.skills();
    return filter === 'All' ? skills : skills.filter((skill) => skill.category === filter);
  });

  protected setFilter(filter: Filter): void {
    this.activeFilter.set(filter);
  }

  protected retry(): void {
    this.store.retry();
  }
}
