import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import type { Project, ProjectCategory } from '../../../../core/models';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ProjectCardComponent } from '../project-card/project-card';
import { ProjectDialogComponent } from '../project-dialog/project-dialog';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

type Filter = ProjectCategory | 'All';

const CATEGORY_ORDER: ProjectCategory[] = ['Frontend', 'Full-Stack', 'UI / UX'];
@Component({
  selector: 'app-project-grid',
  imports: [ProjectCardComponent, ProjectDialogComponent, EmptyStateComponent, RevealDirective],
  templateUrl: './project-grid.html',
  styleUrl: './project-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectGridComponent {
  readonly projects = input<Project[]>([]);
  readonly loading = input(false);

  protected readonly activeFilter = signal<Filter>('All');
  protected readonly selected = signal<Project | null>(null);

  protected readonly categories = computed(() => {
    const present = new Set(this.projects().map((project) => project.category));
    return CATEGORY_ORDER.filter((category) => present.has(category));
  });

  protected readonly filters = computed<{ label: Filter; count: number }[]>(() => {
    const projects = this.projects();
    return [
      { label: 'All', count: projects.length },
      ...this.categories().map((category) => ({
        label: category as Filter,
        count: projects.filter((project) => project.category === category).length,
      })),
    ];
  });

  protected readonly visibleProjects = computed(() => {
    const filter = this.activeFilter();
    const projects = [...this.projects()].sort((a, b) => a.order - b.order);
    return filter === 'All' ? projects : projects.filter((project) => project.category === filter);
  });

  protected setFilter(filter: Filter): void {
    this.activeFilter.set(filter);
  }

  protected open(project: Project): void {
    this.selected.set(project);
  }

  protected close(): void {
    this.selected.set(null);
  }
}
