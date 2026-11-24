import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import type { Project } from '../../../../core/models';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { AssetUrlPipe } from '../../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-project-card',
  imports: [IconComponent, TruncatePipe, AssetUrlPipe],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent {
  private readonly toast = inject(ToastService);

  readonly project = input.required<Project>();
  readonly view = output<Project>();

  protected readonly visibleTechnologies = computed(() => this.project().technologies.slice(0, 4));
  protected readonly extraTechnologies = computed(() =>
    Math.max(0, this.project().technologies.length - this.visibleTechnologies().length),
  );

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = '/assets/images/projects/aurora.svg';
    }
  }

  protected openDetails(): void {
    this.view.emit(this.project());
  }

  protected handleMissingLink(network: 'GitHub' | 'live demo'): void {
    this.toast.show(
      `This is sample content — add a real ${network} URL for "${this.project().title}" in the portfolio data service.`,
      'info',
    );
  }
}
