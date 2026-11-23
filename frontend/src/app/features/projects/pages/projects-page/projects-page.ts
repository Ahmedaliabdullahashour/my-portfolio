import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioStore } from '../../../../core/services/portfolio-store.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ProjectGridComponent } from '../../components/project-grid/project-grid';

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink, SectionHeadingComponent, IconComponent, ProjectGridComponent],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  private readonly store = inject(PortfolioStore);

  protected readonly projects = this.store.projects;
  protected readonly loading = this.store.loading;
}
