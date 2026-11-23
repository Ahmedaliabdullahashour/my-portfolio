import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ProjectGridComponent } from './components/project-grid/project-grid';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, IconComponent, SectionHeadingComponent, ProjectGridComponent, RevealDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  private readonly store = inject(PortfolioStore);

  protected readonly projects = this.store.projects;
  protected readonly loading = this.store.loading;
}
